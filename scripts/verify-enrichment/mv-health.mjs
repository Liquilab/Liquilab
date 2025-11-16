#!/usr/bin/env node

import process from 'node:process';

const BASE_URL =
  process.env.APP_BASE_URL ||
  process.env.VERIFY_BASE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'http://localhost:3000';

const POOL_ADDRESS =
  process.env.VERIFY_POOL_ADDRESS ||
  '0x0000000000000000000000000000000000000000';

async function fetchJson(path) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url);
  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, body: JSON.parse(text) };
  } catch {
    return { ok: res.ok, status: res.status, body: null, error: 'invalid_json', raw: text };
  }
}

function hasIndexedTs(body) {
  if (!body) return false;
  return Boolean(body.indexedUpToTs || body.data?.indexedUpToTs || body.analytics?.indexedUpToTs);
}

function warn(message, meta = {}) {
  console.warn(`[verify:mv] ${message}`, meta);
}

function fail(message, meta = {}) {
  console.error(`[verify:mv] ${message}`, meta);
  process.exit(1);
}

async function main() {
  const summary = await fetchJson('/api/analytics/summary');
  const pool = await fetchJson(`/api/analytics/pool/${POOL_ADDRESS}`);

  const summaryBody = summary.body || {};
  const poolBody = pool.body || {};

  const summaryDegraded = Boolean(summaryBody.degrade);
  const poolDegraded = Boolean(poolBody.degrade);

  if (!summaryBody.ok && !summaryDegraded) {
    fail('analytics summary not ok and not degraded', { status: summary.status, body: summaryBody });
  }

  if (!poolBody.ok && !poolDegraded) {
    fail('analytics pool not ok and not degraded', { status: pool.status, body: poolBody });
  }

  if (summaryBody.ok && !hasIndexedTs(summaryBody)) {
    fail('analytics summary missing indexedUpToTs when ok', { body: summaryBody });
  }

  if (poolBody.ok && !hasIndexedTs(poolBody)) {
    warn('analytics pool missing indexedUpToTs when ok', { body: poolBody });
  }

  const output = {
    baseUrl: BASE_URL,
    summary: {
      status: summary.status,
      ok: Boolean(summaryBody.ok),
      degrade: summaryDegraded,
      indexed: hasIndexedTs(summaryBody),
    },
    pool: {
      status: pool.status,
      ok: Boolean(poolBody.ok),
      degrade: poolDegraded,
      indexed: hasIndexedTs(poolBody),
      address: POOL_ADDRESS,
    },
    ts: Date.now(),
  };

  console.log(JSON.stringify(output, null, 2));
}

main().catch((error) => {
  fail('unexpected error', { error: error?.message || String(error) });
});
