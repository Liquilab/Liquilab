#!/usr/bin/env node

const BASE = `http://localhost:${process.env.PORT || 3000}`;
const SAMPLE_POOL = process.env.SAMPLE_POOL || '0x0000000000000000000000000000000000000000';

function isSummaryPayload(payload) {
  if (!payload || typeof payload.ts !== 'number') {
    return false;
  }
  if (payload.degrade) {
    return true;
  }
  const data = payload.data;
  if (!payload.ok || !data) {
    return false;
  }
  return (
    typeof data.tvlTotal === 'number' &&
    typeof data.poolsActive === 'number' &&
    typeof data.positionsActive === 'number' &&
    typeof data.fees24h === 'number' &&
    typeof data.fees7d === 'number'
  );
}

function isPoolPayload(payload) {
  if (!payload || (typeof payload.ts !== 'number' && typeof payload.ts !== 'string')) {
    return false;
  }
  if (payload.degrade) {
    return true;
  }

  const pool = payload.pool;
  if (!payload.ok || !pool) {
    return false;
  }

  const head = pool.head;
  const universe = pool.universe;
  const summary = universe?.summary;

  const headValid =
    head &&
    typeof head.state === 'string' &&
    typeof head.tvl === 'number' &&
    typeof head.fees24h === 'number' &&
    typeof head.fees7d === 'number' &&
    typeof head.positionsCount === 'number';

  const universeValid =
    universe &&
    summary &&
    typeof summary.tvlUsd === 'number' &&
    typeof summary.fees24hUsd === 'number' &&
    typeof summary.fees7dUsd === 'number' &&
    typeof summary.positionsCount === 'number' &&
    typeof summary.walletsCount === 'number' &&
    Array.isArray(universe.segments);

  if (headValid && universeValid) {
    return true;
  }

  return false;
}

async function fetchJson(pathname) {
  const url = `${BASE}${pathname}`;
  const response = await fetch(url);
  if (response.status !== 200) {
    throw new Error(`${pathname} responded with ${response.status}`);
  }
  return response.json();
}

async function main() {
  const summary = await fetchJson('/api/analytics/summary');
  if (!isSummaryPayload(summary)) {
    console.error('verify:api:analytics — summary payload invalid:', summary);
    process.exit(1);
  }

  const pool = await fetchJson(`/api/analytics/pool/${encodeURIComponent(SAMPLE_POOL)}`);
  if (!isPoolPayload(pool)) {
    console.error('verify:api:analytics — pool payload invalid:', pool);
    process.exit(1);
  }

  console.log('verify:api:analytics — ok');
}

main().catch((error) => {
  console.error('verify:api:analytics — failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
