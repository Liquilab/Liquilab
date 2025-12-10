/**
 * RPC Scanner with Adaptive Retry, Concurrency & Cost Tracking
 * 
 * Fetches blockchain logs with rate limiting, adaptive window sizing, and ANKR credit tracking.
 */

import { createPublicClient, http, Log, type PublicClient } from 'viem';
import { flare } from 'viem/chains';
import pLimit from 'p-limit';
import { loadIndexerConfigFromEnv } from '../../indexer.config';
import { getEventTopics } from './abis';
import { RateLimiter } from './lib/rateLimiter';
import { CostMeter, type CostSummary } from './metrics/costMeter';

type RpcScannerOverrides = {
  rpcUrl?: string;
  rps?: number;
  concurrency?: number;
  blockWindow?: number;
};

const DEFAULT_REQUESTED_BLOCK_WINDOW = 1000;

export interface ScanOptions {
  fromBlock: number;
  toBlock: number;
  contractAddress: string | string[];
  tokenIds?: string[];
  dryRun?: boolean;
  topics?: string[];
  blockWindow?: number;
}

export interface ScanResult {
  logs: Log[];
  scannedBlocks: number;
  elapsedMs: number;
  retriesUsed: number;
}

export class RpcScanner {
  private client: PublicClient;
  private limit: ReturnType<typeof pLimit>;
  private consecutiveFailures = 0;
  private consecutiveSuccesses = 0;
  private currentConcurrency: number;
  private currentBlockWindow: number;
  private rateLimiter: RateLimiter;
  private costMeter: CostMeter;
  private config: ReturnType<typeof loadIndexerConfigFromEnv>;
  private providerCap: number;
  private rpcUrl: string;
  private requestedBlockWindow: number;
  private rps: number;

  private static getProviderCap(rpcUrl: string): number {
    const url = rpcUrl.toLowerCase();
    if (url.includes('flare-api.flare.network')) {
      return 25;
    }
    if (url.includes('rpc.ankr.com/flare')) {
      return 2000;
    }
    return 1000;
  }

  constructor(overrides?: RpcScannerOverrides) {
    this.config = loadIndexerConfigFromEnv();
    this.rpcUrl = overrides?.rpcUrl ?? this.config.rpc.url;
    this.providerCap = RpcScanner.getProviderCap(this.rpcUrl);
    this.requestedBlockWindow =
      overrides?.blockWindow ?? this.config.rpc.blockWindow ?? DEFAULT_REQUESTED_BLOCK_WINDOW;
    
    this.client = createPublicClient({
      chain: flare,
      transport: http(this.rpcUrl, {
        timeout: this.config.rpc.requestTimeout,
      }),
    });

    this.rps = overrides?.rps ?? this.config.rpc.rps;
    this.currentConcurrency = overrides?.concurrency ?? this.config.rpc.concurrency;
    this.currentBlockWindow = Math.min(this.requestedBlockWindow, this.providerCap);
    
    this.limit = pLimit(this.currentConcurrency);
    
    this.rateLimiter = new RateLimiter({
      rps: this.rps,
      burst: this.rps * 2,
    });
    
    this.costMeter = new CostMeter(this.config.cost);
  }

  async scan(options: ScanOptions): Promise<ScanResult> {
    const startTime = Date.now();
    const { fromBlock, toBlock, contractAddress, tokenIds, dryRun, topics } = options;
    const requestedWindow =
      options.blockWindow ?? this.requestedBlockWindow ?? DEFAULT_REQUESTED_BLOCK_WINDOW;
    const effectiveBlockWindow = Math.min(requestedWindow, this.providerCap);
    this.currentBlockWindow = effectiveBlockWindow;

    console.log(
      `[RPC] Init: rpc=${this.rpcUrl} requestedBlockWindow=${requestedWindow} providerCap=${this.providerCap} effectiveBlockWindow=${effectiveBlockWindow}`,
    );

    if (fromBlock > toBlock) {
      throw new Error(`Invalid range: fromBlock (${fromBlock}) > toBlock (${toBlock})`);
    }

    const addresses = Array.isArray(contractAddress) ? contractAddress : [contractAddress];
    const ranges = this.createChunkRanges(fromBlock, toBlock, this.currentBlockWindow);

    const maxRangeSize = Math.max(...ranges.map((r) => r.to - r.from + 1));

    console.log(
      `[RPC] Scanning ${fromBlock}→${toBlock} (${ranges.length} chunks, window=${this.currentBlockWindow}, max_range=${maxRangeSize}, concurrency=${this.currentConcurrency}, rps=${this.rps})`
    );

    const results = await Promise.all(
      ranges.map((range) =>
        this.limit(() =>
          this.rateLimiter.schedule(() =>
            this.fetchLogsWithRetry(range, addresses, tokenIds, dryRun, topics)
          )
        )
      )
    );

    const allLogs = results.flatMap((r) => r.logs);
    const totalRetries = results.reduce((sum, r) => sum + r.retriesUsed, 0);
    const elapsedMs = Date.now() - startTime;
    const scannedBlocks = toBlock - fromBlock + 1;

    console.log(
      `[RPC] ✓ Scanned ${scannedBlocks} blocks → ${allLogs.length} logs (${Math.round(
        scannedBlocks / (elapsedMs / 1000)
      )}/s, ${totalRetries} retries)`
    );

    this.logCostSummary();

    return {
      logs: allLogs,
      scannedBlocks,
      elapsedMs,
      retriesUsed: totalRetries,
    };
  }

  private async fetchLogsWithRetry(
    range: { from: number; to: number },
    addresses: string[],
    tokenIds?: string[],
    dryRun?: boolean,
    topics?: string[]
  ): Promise<{ logs: Log[]; retriesUsed: number }> {
    const { from, to } = range;
    let attempt = 0;
    let delay = this.config.retry.initialDelayMs;

    while (attempt < this.config.retry.maxAttempts) {
      try {
        this.costMeter.track('eth_getLogs');
        
        const eventTopics = topics ?? getEventTopics(this.config.events);
        const addressChunks = this.chunkAddresses(addresses, 20);
        const topicsParam =
          eventTopics.length > 0
            ? ([eventTopics.map((t) => t as `0x${string}`)] as (`0x${string}` | null)[][])
            : undefined;
        
        let allLogs: Log[] = [];
        
        for (const addressChunk of addressChunks) {
          const logs = await (this.client as any).getLogs({
            address: addressChunk.map((addr) => addr as `0x${string}`),
            fromBlock: BigInt(from),
            toBlock: BigInt(to),
            topics: topicsParam,
          });
          allLogs.push(...logs);
        }

        let filteredLogs = allLogs;
        if (eventTopics.length > 0) {
          const topicSet = new Set(eventTopics.map((t) => t.toLowerCase()));
          filteredLogs = filteredLogs.filter(
            (log) => log.topics[0] && topicSet.has((log.topics[0] as string).toLowerCase())
          );
        }

        if (tokenIds && tokenIds.length > 0) {
          filteredLogs = filteredLogs.filter((log) => {
            const tokenIdHex = log.topics[1];
            if (!tokenIdHex) return false;
            const tokenId = BigInt(tokenIdHex).toString();
            return tokenIds.includes(tokenId);
          });
        }

        if (!dryRun && filteredLogs.length > 0) {
          console.log(`[RPC] ✓ ${from}→${to} (${filteredLogs.length} logs)`);
        }

        this.onSuccess();
        return { logs: filteredLogs, retriesUsed: attempt };
      } catch (error: any) {
        attempt++;
        this.onFailure();

        const errorMsg = error?.message || String(error);

        const isLastAttempt = attempt >= this.config.retry.maxAttempts;
        if (isLastAttempt) {
          console.error(`[RPC] ✗ ${from}→${to} failed after ${attempt} attempts:`, error);
          throw error;
        }

        console.warn(
          `[RPC] ⚠ ${from}→${to} failed (attempt ${attempt}/${this.config.retry.maxAttempts}), retrying in ${delay}ms...`
        );

        await this.sleep(delay);
        delay = Math.min(delay * this.config.retry.backoffMultiplier, this.config.retry.maxDelayMs);
      }
    }

    throw new Error(`Unreachable: max retries exceeded for ${from}→${to}`);
  }

  async getLatestBlock(): Promise<number> {
    this.costMeter.track('eth_blockNumber');
    const blockNumber = await this.rateLimiter.schedule(() => this.client.getBlockNumber());
    return Number(blockNumber);
  }

  async getBlockTimestamp(blockNumber: number): Promise<number> {
    this.costMeter.track('eth_getBlockByNumber');
    const block = await this.rateLimiter.schedule(() =>
      this.client.getBlock({ blockNumber: BigInt(blockNumber) })
    );
    return Number(block.timestamp);
  }

  getCostSummary(): CostSummary {
    return this.costMeter.summary();
  }

  private logCostSummary(): void {
    const summary = this.costMeter.summary();
    console.log(
      JSON.stringify({
        scope: 'cost',
        totalCredits: summary.totalCredits,
        usdEstimate: parseFloat(summary.usdEstimate.toFixed(4)),
        byMethod: summary.byMethod,
      })
    );
  }

  private chunkAddresses(addresses: string[], size: number): string[][] {
    const chunks: string[][] = [];
    for (let i = 0; i < addresses.length; i += size) {
      chunks.push(addresses.slice(i, i + size));
    }
    return chunks;
  }

  private createChunkRanges(from: number, to: number, chunkSize: number): Array<{ from: number; to: number }> {
    const safeChunkSize = Math.min(chunkSize, this.providerCap);
    
    const ranges: Array<{ from: number; to: number }> = [];
    let current = from;

    while (current <= to) {
      const end = Math.min(current + safeChunkSize - 1, to);
      ranges.push({ from: current, to: end });
      current = end + 1;
    }

    return ranges;
  }

  private onFailure() {
    this.consecutiveFailures++;
    this.consecutiveSuccesses = 0;

    if (this.consecutiveFailures >= this.config.retry.failureThreshold) {
      const newConcurrency = Math.max(
        this.currentConcurrency - 1,
        this.config.rpc.minConcurrency
      );
      if (newConcurrency !== this.currentConcurrency) {
        console.log(`[RPC] 🔻 Reducing concurrency: ${this.currentConcurrency} → ${newConcurrency}`);
        this.currentConcurrency = newConcurrency;
        this.limit = pLimit(newConcurrency);
      }
      this.consecutiveFailures = 0;
    }
  }

  private onSuccess() {
    this.consecutiveSuccesses++;
    this.consecutiveFailures = 0;

    if (this.consecutiveSuccesses >= this.config.retry.successThreshold) {
      const newConcurrency = Math.min(
        this.currentConcurrency + 1,
        this.config.rpc.concurrency
      );
      if (newConcurrency !== this.currentConcurrency) {
        console.log(`[RPC] 🔺 Increasing concurrency: ${this.currentConcurrency} → ${newConcurrency}`);
        this.currentConcurrency = newConcurrency;
        this.limit = pLimit(newConcurrency);
      }
      this.consecutiveSuccesses = 0;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
