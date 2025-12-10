/**
 * Staking Contract Configuration
 * 
 * Update deze file met de juiste contract addresses zodra bekend.
 */

export type StakingDex = 'enosys-v3' | 'sparkdex-v3';
export type StakingType = 'masterchef' | 'gauge' | 'custom' | 'api';

export interface StakingRewardsConfig {
  id: string;                    // Stable key for this reward source
  dex: StakingDex;
  type: StakingType;
  description?: string;
  poolIdentifier?: string;       // Pool/pair key or address (if applicable)
  rewardToken: string;           // Address of reward token (placeholder allowed)
  rewardTokenSymbol: string;     // e.g. "rFLR", "SPX"
  distributorAddress?: string;   // TokenDistributor contract (for on-chain rewards)
  apiUrl?: string;               // API endpoint (for Enosys rFLR API)
  startBlock: number;            // Block where rewards started
  poolMapping?: {                // For masterchef-style configs
    [pid: string]: string;
  };
}

export const STAKING_REWARDS: StakingRewardsConfig[] = [
  // ENOSYS rFLR REWARDS (via Flare Portal Emissions - monthly distribution)
  // Rewards accrue to Enosys LP positions and are distributed monthly via Flare's emissions system.
  // Contract: https://flare-explorer.flare.network/address/0x0Bf36BC05301F1F049634f6937FDD6d35E8D60c3
  // Note: The old Enosys API (v3.dex.enosys.global/api/flr/v2/stats/rflr) is deprecated (404).
  {
    id: 'enosys-rflr-flare-emissions',
    dex: 'enosys-v3',
    type: 'custom',
    description: 'Enosys rFLR rewards via Flare Portal Emissions (monthly)',
    rewardToken: '0x0000000000000000000000000000000000000000', // WFLR (rFLR is wrapped FLR)
    rewardTokenSymbol: 'rFLR',
    distributorAddress: '0x0Bf36BC05301F1F049634f6937FDD6d35E8D60c3', // Flare Distributor for Enosys
    startBlock: 29_837_200,
  },

  // SPARKDEX SPX REWARDS (On-chain via TokenDistributor)
  {
    id: 'sparkdex-spx-token-distributor',
    dex: 'sparkdex-v3',
    type: 'custom', // Custom distributor pattern (TokenDistributor)
    description: 'SparkDEX SPX rewards via TokenDistributor',
    rewardToken: '0x657097cC15fdEc9e383dB8628B57eA4a763F2ba0', // SPRK token
    rewardTokenSymbol: 'SPX',
    distributorAddress: '0xc2DF11C68f86910B99EAf8acEd7F5189915Ba24F',
    startBlock: 29_837_200,
  },

  // SPARKDEX rFLR REWARDS (via TokenDistributor - same contract, different token)
  {
    id: 'sparkdex-rflr-token-distributor',
    dex: 'sparkdex-v3',
    type: 'custom',
    description: 'SparkDEX rFLR rewards via TokenDistributor',
    rewardToken: '0x0000000000000000000000000000000000000000', // Placeholder for rFLR
    rewardTokenSymbol: 'rFLR',
    distributorAddress: '0xc2DF11C68f86910B99EAf8acEd7F5189915Ba24F',
    startBlock: 29_837_200,
  },
];

/**
 * Helper: Find staking config by contract address
 */
export function getStakingConfig(address: string): StakingRewardsConfig | undefined {
  return STAKING_REWARDS.find(
    (c) => c.distributorAddress?.toLowerCase() === address.toLowerCase()
  );
}

/**
 * Helper: Get pool address from staking event metadata
 */
export function resolvePoolFromStakingEvent(
  config: StakingRewardsConfig,
  eventName: string,
  decodedArgs: Record<string, any>
): string | null {
  // For MasterChef: use PID to lookup pool
  if (config.type === 'masterchef' && 'pid' in decodedArgs) {
    const pid = String(decodedArgs.pid);
    return config.poolMapping?.[pid] || null;
  }

  // For Gauge: pool address is usually the gauge contract itself
  if (config.type === 'gauge') {
    // Gauge contracts usually have 1:1 mapping with LP tokens
    // May need on-chain read: gauge.stakingToken()
    return null; // Implement later with on-chain read
  }

  return null;
}

