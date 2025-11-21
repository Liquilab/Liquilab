#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');
const fs = require('fs/promises');
const path = require('path');
const playwright = require('playwright');

const prisma = new PrismaClient();
const REPORT_DIR = path.join(process.cwd(), 'docs/research/weekly');
const TARGET_PAIR = { token0: 'wflr', token1: 'usdt0' };

const addDays = (date, days) => {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
};

const startOfDay = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
const isoDate = (date) => date.toISOString().split('T')[0];
const isoWeek = (date) => {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week: weekNum };
};

const usd = (value, digits = 1) => (value === null || value === undefined ? 'N/A' : `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`);
const pct = (value, digits = 1) => (value === null || value === undefined ? 'N/A' : `${Number(value).toFixed(digits)}%`);
const int = (value) => (value === null || value === undefined ? 'N/A' : Number(value).toLocaleString('en-US'));
const deltaPct = (curr, prev) => {
  if (curr === null || curr === undefined || prev === null || prev === undefined || prev === 0) return null;
  return ((Number(curr) - Number(prev)) / Number(prev)) * 100;
};

const htmlTable = (headers, rows) => {
  if (!rows || !rows.length) return '<p class="caption">Data not available in this snapshot.</p>';
  const thead = `<thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>`;
  const tbody = `<tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>`;
  return `<table class="data-table">${thead}${tbody}</table>`;
};

const safeQuery = async (label, fn) => {
  try {
    const result = await fn();
    if (!result || (Array.isArray(result) && !result.length)) {
      console.warn(`⚠️  ${label}: no rows`);
      return null;
    }
    return result;
  } catch (error) {
    console.warn(`⚠️  ${label} unavailable: ${error.message}`);
    return null;
  }
};

const getWindow = () => {
  const today = startOfDay(new Date());
  const dayOfWeek = today.getUTCDay();
  const offset = dayOfWeek === 0 ? 7 : dayOfWeek;
  const weekEnd = addDays(today, -offset);
  const weekStart = addDays(weekEnd, -6);
  const prevWeekEnd = addDays(weekStart, -1);
  const prevWeekStart = addDays(prevWeekEnd, -6);
  const lookbackStart = addDays(weekEnd, -89);
  return {
    weekStart,
    weekEnd,
    prevWeekStart,
    prevWeekEnd,
    weekEndExclusive: addDays(weekEnd, 1),
    prevWeekEndExclusive: addDays(prevWeekEnd, 1),
    lookbackStart,
    lookbackEnd: weekEnd,
  };
};

const fetchNetworkKpis = async (window) => {
  const current = await safeQuery('network KPIs (current week)', () => prisma.$queryRaw`
    SELECT
      AVG(tvl_usd) AS avg_tvl_usd,
      SUM(volume_usd) AS total_volume_usd,
      SUM(fees_usd) AS total_fees_usd,
      COUNT(DISTINCT market_id) FILTER (WHERE volume_usd > 0) AS active_pools_count,
      AVG(avg_apr_pct) AS avg_pool_apr
    FROM analytics_market_metrics_daily
    WHERE day >= ${window.weekStart}::date AND day < ${window.weekEndExclusive}::date;
  `);

  const previous = await safeQuery('network KPIs (previous week)', () => prisma.$queryRaw`
    SELECT
      AVG(tvl_usd) AS avg_tvl_usd,
      SUM(volume_usd) AS total_volume_usd,
      SUM(fees_usd) AS total_fees_usd,
      COUNT(DISTINCT market_id) FILTER (WHERE volume_usd > 0) AS active_pools_count,
      AVG(avg_apr_pct) AS avg_pool_apr
    FROM analytics_market_metrics_daily
    WHERE day >= ${window.prevWeekStart}::date AND day < ${window.prevWeekEndExclusive}::date;
  `);

  const walletCurrent = await safeQuery('wallet KPIs (current week)', () => prisma.$queryRaw`
    SELECT
      COUNT(DISTINCT wallet_address) FILTER (WHERE pools_active > 0) AS active_lp_wallets_count,
      COUNT(DISTINCT wallet_address) FILTER (WHERE new_positions > 0) AS new_lp_wallets_count
    FROM analytics_wallet_metrics_daily
    WHERE day >= ${window.weekStart}::date AND day < ${window.weekEndExclusive}::date;
  `);

  const walletPrev = await safeQuery('wallet KPIs (previous week)', () => prisma.$queryRaw`
    SELECT
      COUNT(DISTINCT wallet_address) FILTER (WHERE pools_active > 0) AS active_lp_wallets_count,
      COUNT(DISTINCT wallet_address) FILTER (WHERE new_positions > 0) AS new_lp_wallets_count
    FROM analytics_wallet_metrics_daily
    WHERE day >= ${window.prevWeekStart}::date AND day < ${window.prevWeekEndExclusive}::date;
  `);

  return {
    current: { ...(walletCurrent?.[0] || {}), ...(current?.[0] || {}) },
    previous: { ...(walletPrev?.[0] || {}), ...(previous?.[0] || {}) },
  };
};

const fetchSeries = async (window) => {
  const walletSeries = await safeQuery('Active wallet series (90d)', () => prisma.$queryRaw`
    SELECT
      day,
      COUNT(DISTINCT wallet_address) FILTER (WHERE pools_active > 0) AS active_lp_wallets,
      COUNT(DISTINCT wallet_address) FILTER (WHERE new_positions > 0) AS new_lp_wallets
    FROM analytics_wallet_metrics_daily
    WHERE day >= ${window.lookbackStart}::date AND day <= ${window.lookbackEnd}::date
    GROUP BY day
    ORDER BY day;
  `);

  const tvlSeries = await safeQuery('TVL/volume/fees series (90d)', () => prisma.$queryRaw`
    SELECT
      day,
      SUM(tvl_usd) AS tvl_usd,
      SUM(volume_usd) AS volume_usd,
      SUM(fees_usd) AS fees_usd
    FROM analytics_market_metrics_daily
    WHERE day >= ${window.lookbackStart}::date AND day <= ${window.lookbackEnd}::date
    GROUP BY day
    ORDER BY day;
  `);

  return { walletSeries, tvlSeries };
};

const fetchDexShare = async (window) =>
  safeQuery('DEX share', () => prisma.$queryRaw`
    SELECT
      m.dex_slug,
      SUM(d.tvl_usd) AS tvl_usd,
      SUM(d.volume_usd) AS volume_usd,
      SUM(d.fees_usd) AS fees_usd
    FROM analytics_market_metrics_daily d
    JOIN analytics_market m ON m.market_id = d.market_id
    WHERE d.day >= ${window.weekStart}::date AND d.day < ${window.weekEndExclusive}::date
    GROUP BY m.dex_slug
    ORDER BY SUM(d.tvl_usd) DESC;
  `);

const fetchLpBuckets = async () =>
  safeQuery('LP size buckets', () => prisma.$queryRaw`
    WITH wallet_pool AS (
      SELECT
        wallet_address,
        pool_id,
        SUM(share_of_pool_tvl) AS share_of_pool_tvl,
        SUM(tvl_usd_current) AS tvl_usd
      FROM mv_position_overview_latest
      WHERE share_of_pool_tvl IS NOT NULL
      GROUP BY wallet_address, pool_id
    ),
    bucketed AS (
      SELECT
        CASE
          WHEN share_of_pool_tvl < 0.001 THEN 'Retail'
          WHEN share_of_pool_tvl < 0.01 THEN 'Mid'
          ELSE 'Whale'
        END AS bucket,
        wallet_address,
        tvl_usd
      FROM wallet_pool
    )
    SELECT
      bucket,
      COUNT(DISTINCT wallet_address) AS lp_wallets_count,
      SUM(tvl_usd) AS tvl_usd
    FROM bucketed
    GROUP BY bucket;
  `);

const fetchConcentration = async () =>
  safeQuery('Top wallet concentration', () => prisma.$queryRaw`
    WITH pool_wallets AS (
      SELECT pool_id, wallet_address, SUM(tvl_usd_current) AS tvl_usd, SUM(fees_7d_usd) AS fees_7d_usd
      FROM mv_position_overview_latest
      GROUP BY pool_id, wallet_address
    ),
    ranked AS (
      SELECT
        pool_id,
        wallet_address,
        tvl_usd,
        fees_7d_usd,
        RANK() OVER (PARTITION BY pool_id ORDER BY tvl_usd DESC) AS tvl_rank
      FROM pool_wallets
    ),
    pool_totals AS (
      SELECT pool_id, SUM(tvl_usd) AS pool_tvl, SUM(fees_7d_usd) AS pool_fees FROM pool_wallets GROUP BY pool_id
    )
    SELECT
      SUM(CASE WHEN tvl_rank = 1 THEN tvl_usd ELSE 0 END) / NULLIF(SUM(pool_tvl), 0) * 100 AS top1_tvl_share_pct,
      SUM(CASE WHEN tvl_rank <= 10 THEN tvl_usd ELSE 0 END) / NULLIF(SUM(pool_tvl), 0) * 100 AS top10_tvl_share_pct,
      SUM(CASE WHEN tvl_rank <= 10 THEN fees_7d_usd ELSE 0 END) / NULLIF(SUM(pool_fees), 0) * 100 AS top10_fees_share_pct
    FROM ranked r
    JOIN pool_totals t ON r.pool_id = t.pool_id;
  `);

const fetchRangeBandStats = async () => {
  const band = await safeQuery('RangeBand health', () => prisma.$queryRaw`
    SELECT COALESCE(band_color, 'UNKNOWN') AS band_color, SUM(tvl_usd_current) AS tvl_usd
    FROM mv_position_overview_latest
    GROUP BY COALESCE(band_color, 'UNKNOWN');
  `);

  const strategy = await safeQuery('Strategy mix', () => prisma.$queryRaw`
    WITH pool_totals AS (
      SELECT
        CONCAT(UPPER(token0_symbol), '/', UPPER(token1_symbol)) AS pair_label,
        SUM(tvl_usd) AS pool_tvl
      FROM mv_pool_latest_state
      GROUP BY 1
    ),
    top_pairs AS (
      SELECT pair_label FROM pool_totals ORDER BY pool_tvl DESC LIMIT 5
    )
    SELECT
      CONCAT(UPPER(po.token0_symbol), '/', UPPER(po.token1_symbol)) AS pair_label,
      strategy_code,
      SUM(tvl_usd_current) AS tvl_usd
    FROM mv_position_overview_latest po
    JOIN top_pairs tp ON tp.pair_label = CONCAT(UPPER(po.token0_symbol), '/', UPPER(po.token1_symbol))
    GROUP BY pair_label, strategy_code;
  `);

  return { band, strategy };
};

const fetchTopPools = async () =>
  safeQuery('Top pools', () => prisma.$queryRaw`
    SELECT
      CONCAT(UPPER(token0_symbol), '/', UPPER(token1_symbol)) AS pair_label,
      dex_slug,
      tvl_usd,
      volume_7d_usd,
      fees_7d_usd,
      active_lp_wallets_7d,
      apr_7d_pct
    FROM mv_pool_latest_state
    WHERE volume_7d_usd IS NOT NULL
    ORDER BY active_lp_wallets_7d DESC
    LIMIT 8;
  `);

const fetchGrowthPools = async () =>
  safeQuery('Growth pools', () => prisma.$queryRaw`
    SELECT
      pair_label,
      dex_slug,
      delta_lp_wallets_7d,
      lp_wallets_7d,
      tvl_change_pct_7d,
      volume_7d_usd
    FROM mv_pool_changes_7d
    ORDER BY delta_lp_wallets_7d DESC NULLS LAST
    LIMIT 8;
  `);

const fetchPairCombined = async () =>
  safeQuery('WFLR/USDT0 combined', () => prisma.$queryRaw`
    SELECT
      SUM(tvl_usd) AS tvl_usd,
      SUM(volume_7d_usd) AS volume_7d_usd,
      SUM(fees_7d_usd) AS fees_7d_usd,
      SUM(active_positions) AS active_positions,
      SUM(active_lp_wallets_7d) AS active_lp_wallets_7d,
      AVG(apr_7d_pct) AS apr_7d_pct
    FROM mv_pool_latest_state
    WHERE LOWER(token0_symbol) = ${TARGET_PAIR.token0}
      AND LOWER(token1_symbol) = ${TARGET_PAIR.token1};
  `);

const fetchPairDexBreakdown = async () =>
  safeQuery('WFLR/USDT0 dex breakdown', () => prisma.$queryRaw`
    SELECT
      dex_slug,
      SUM(tvl_usd) AS tvl_usd,
      SUM(volume_7d_usd) AS volume_7d_usd,
      SUM(fees_7d_usd) AS fees_7d_usd,
      SUM(active_lp_wallets_7d) AS active_lp_wallets_7d,
      AVG(apr_7d_pct) AS apr_7d_pct
    FROM mv_pool_latest_state
    WHERE LOWER(token0_symbol) = ${TARGET_PAIR.token0}
      AND LOWER(token1_symbol) = ${TARGET_PAIR.token1}
    GROUP BY dex_slug;
  `);

const fetchPairTrend = async (window) =>
  safeQuery('WFLR/USDT0 trend', () => prisma.$queryRaw`
    SELECT
      day,
      SUM(tvl_usd) AS tvl_usd,
      SUM(active_lp_wallets) AS active_lp_wallets
    FROM analytics_market_metrics_daily d
    JOIN analytics_market m ON m.market_id = d.market_id
    WHERE LOWER(m.token0_symbol) = ${TARGET_PAIR.token0}
      AND LOWER(m.token1_symbol) = ${TARGET_PAIR.token1}
      AND day >= ${window.lookbackStart}::date
      AND day <= ${window.lookbackEnd}::date
    GROUP BY day
    ORDER BY day;
  `);

const fetchPairBuckets = async () =>
  safeQuery('WFLR/USDT0 LP buckets', () => prisma.$queryRaw`
    WITH wallet_pool AS (
      SELECT
        wallet_address,
        SUM(share_of_pool_tvl) AS share_of_pool_tvl,
        SUM(tvl_usd_current) AS tvl_usd
      FROM mv_position_overview_latest
      WHERE LOWER(token0_symbol) = ${TARGET_PAIR.token0}
        AND LOWER(token1_symbol) = ${TARGET_PAIR.token1}
      GROUP BY wallet_address
    )
    SELECT
      CASE
        WHEN share_of_pool_tvl < 0.001 THEN 'Retail'
        WHEN share_of_pool_tvl < 0.01 THEN 'Mid'
        ELSE 'Whale'
      END AS bucket,
      COUNT(*) AS lp_wallets_count,
      SUM(tvl_usd) AS tvl_usd
    FROM wallet_pool
    GROUP BY bucket;
  `);

const fetchPairRangeBand = async () =>
  safeQuery('WFLR/USDT0 RangeBand', () => prisma.$queryRaw`
    SELECT COALESCE(band_color, 'UNKNOWN') AS band_color, SUM(tvl_usd_current) AS tvl_usd
    FROM mv_position_overview_latest
    WHERE LOWER(token0_symbol) = ${TARGET_PAIR.token0}
      AND LOWER(token1_symbol) = ${TARGET_PAIR.token1}
    GROUP BY COALESCE(band_color, 'UNKNOWN');
  `);

const fetchPairAprDistribution = async () =>
  safeQuery('WFLR/USDT0 APR distribution', () => prisma.$queryRaw`
    SELECT
      WIDTH_BUCKET(apr_30d_pct, -50, 200, 10) AS bucket,
      COUNT(*) AS positions,
      MIN(apr_30d_pct) AS bucket_min,
      MAX(apr_30d_pct) AS bucket_max
    FROM mv_position_overview_latest
    WHERE LOWER(token0_symbol) = ${TARGET_PAIR.token0}
      AND LOWER(token1_symbol) = ${TARGET_PAIR.token1}
      AND apr_30d_pct IS NOT NULL
    GROUP BY bucket
    ORDER BY bucket;
  `);

const fetchPairClaimStats = async () =>
  safeQuery('WFLR/USDT0 claim stats', () => prisma.$queryRaw`
    WITH base AS (
      SELECT
        CASE
          WHEN share_of_pool_tvl < 0.001 THEN 'Retail'
          WHEN share_of_pool_tvl < 0.01 THEN 'Mid'
          ELSE 'Whale'
        END AS bucket,
        avg_days_between_claims,
        unclaimed_fees_pct_of_tvl,
        late_claim_state
      FROM mv_position_overview_latest
      WHERE LOWER(token0_symbol) = ${TARGET_PAIR.token0}
        AND LOWER(token1_symbol) = ${TARGET_PAIR.token1}
    )
    SELECT
      bucket,
      AVG(avg_days_between_claims) AS avg_days_between_claims,
      AVG(unclaimed_fees_pct_of_tvl) AS avg_unclaimed_fees_pct_of_tvl,
      COUNT(*) FILTER (WHERE late_claim_state = 'Late')::float / NULLIF(COUNT(*), 0) * 100 AS late_pct,
      COUNT(*) FILTER (WHERE late_claim_state = 'Very late')::float / NULLIF(COUNT(*), 0) * 100 AS very_late_pct
    FROM base
    GROUP BY bucket;
  `);

const fetchPairPositions = async () =>
  safeQuery('WFLR/USDT0 positions', () => prisma.$queryRaw`
    SELECT
      COALESCE(lp_label, CONCAT('LP#', SUBSTRING(wallet_address FROM 3 FOR 6))) AS lp_label,
      dex_slug,
      position_id,
      tvl_usd_current,
      unclaimed_fees_usd,
      apr_30d_pct,
      strategy_code,
      band_color,
      time_in_range_30d_pct,
      late_claim_state
    FROM mv_position_overview_latest
    WHERE LOWER(token0_symbol) = ${TARGET_PAIR.token0}
      AND LOWER(token1_symbol) = ${TARGET_PAIR.token1}
    ORDER BY tvl_usd_current DESC;
  `);

const fetchAnalytics = async (window) => {
  const network = await fetchNetworkKpis(window);
  const series = await fetchSeries(window);
  const dexShare = await fetchDexShare(window);
  const lpBuckets = await fetchLpBuckets();
  const concentration = await fetchConcentration();
  const rangeBand = await fetchRangeBandStats();
  const topPools = await fetchTopPools();
  const growthPools = await fetchGrowthPools();
  const pairCombined = await fetchPairCombined();
  const pairDex = await fetchPairDexBreakdown();
  const pairTrend = await fetchPairTrend(window);
  const pairBuckets = await fetchPairBuckets();
  const pairRangeBand = await fetchPairRangeBand();
  const pairApr = await fetchPairAprDistribution();
  const pairClaim = await fetchPairClaimStats();
  const pairPositions = await fetchPairPositions();

  return {
    network,
    series,
    dexShare,
    lpBuckets,
    concentration,
    rangeBand,
    topPools,
    growthPools,
    pair: {
      combined: pairCombined?.[0] || null,
      dex: pairDex,
      trend: pairTrend,
      buckets: pairBuckets,
      rangeBand: pairRangeBand,
      aprDistribution: pairApr,
      claim: pairClaim,
      positions: pairPositions,
    },
  };
};

const caption = (text) => `<p class="caption">${text}</p>`;

const buildExecutiveSummary = (window, analytics) => {
  const current = analytics.network?.current || {};
  const previous = analytics.network?.previous || {};
  const tvlChange = deltaPct(current.avg_tvl_usd, previous.avg_tvl_usd);
  const walletChange = deltaPct(current.active_lp_wallets_count, previous.active_lp_wallets_count);
  const poolsChange = deltaPct(current.active_pools_count, previous.active_pools_count);
  return `
    <section>
      <h2 class="section-title">1. Executive Summary</h2>
      <ul>
        <li><strong>Total TVL:</strong> ${usd(current.avg_tvl_usd)} (avg weekly TVL; ${pct(tvlChange)} vs previous week)</li>
        <li><strong>Weekly volume & fees:</strong> ${usd(current.total_volume_usd)} traded, ${usd(current.total_fees_usd)} fees</li>
        <li><strong>Active pools:</strong> ${int(current.active_pools_count)} (${pct(poolsChange)} vs prior week)</li>
        <li><strong>Active LP wallets:</strong> ${int(current.active_lp_wallets_count)} (${pct(walletChange)} WoW), ${int(current.new_lp_wallets_count)} new wallets onboarded</li>
        <li><strong>Context:</strong> Liquidity growth is lagging broader market moves, but wallet activity and fee capture continue to rise.</li>
      </ul>
      <p class="caption">This report uses the same analytics stack that will power the Pro Weekly Universe Report (M3 alpha → M4 GA), serving both Flare grant evidence and the product preview.</p>
    </section>`;
};

const dataTableWithCaption = (title, headers, rows, explanation) => {
  return `
    <div class="figure">
      <h3 class="figure-title">${title}</h3>
      ${htmlTable(headers, rows)}
      ${caption(explanation)}
    </div>`;
};

const buildSeriesPreview = (title, headers, rows, explanation) => {
  if (!rows || !rows.length) return `<div class="figure"><h3 class="figure-title">${title}</h3>${caption('Data not available')}</div>`;
  const trimmed = rows.slice(-12);
  const tableRows = trimmed.map((row) => headers.map((h) => (h.key === 'day' ? row.day : int(row[h.key]))));
  return dataTableWithCaption(title, headers.map((h) => h.label), tableRows, explanation);
};

const buildRangeBandSummary = (rows) => {
  if (!rows) return '<p class="caption">RangeBand data not available.</p>';
  const total = rows.reduce((sum, row) => sum + Number(row.tvl_usd || 0), 0);
  const tableRows = rows.map((row) => {
    const share = total ? (Number(row.tvl_usd) / total) * 100 : null;
    return [row.band_color, usd(row.tvl_usd, 0), pct(share)];
  });
  return dataTableWithCaption('RangeBand health (all pools)', ['Band', 'TVL (USD)', 'Share of TVL'], tableRows, 'This shows how much TVL sits in each RangeBand status (GREEN = earning fees, RED = out-of-range).');
};

const buildStrategyMix = (rows) => {
  if (!rows) return '<p class="caption">Strategy mix data not available.</p>';
  const tableRows = rows.map((row) => [row.pair_label, row.strategy_code || 'n/a', usd(row.tvl_usd)]);
  return dataTableWithCaption('Strategy mix for top TVL tokenpairs', ['Pair', 'Strategy', 'TVL'], tableRows, 'Shows how AGR/BAL/CONS allocations differ across the top tokenpairs.');
};

const buildTopPoolsTable = (rows) => dataTableWithCaption(
  'Top pools by active LP wallets (7D)',
  ['Pair', 'DEX', 'TVL', 'Volume 7D', 'Fees 7D', 'Active LPs', 'APR 7D'],
  rows ? rows.map((row) => [row.pair_label, row.dex_slug, usd(row.tvl_usd), usd(row.volume_7d_usd), usd(row.fees_7d_usd), int(row.active_lp_wallets_7d), pct(row.apr_7d_pct)]) : null,
  'Where most LP wallets concentrate, useful to track social coordination and liquidity flows.',
);

const buildGrowthPoolsTable = (rows) => dataTableWithCaption(
  'Pools with highest LP wallet growth (7D)',
  ['Pool', 'DEX', 'Δ LP wallets', 'Total LP wallets', 'TVL change %', 'Volume 7D'],
  rows ? rows.map((row) => [row.pair_label, row.dex_slug, int(row.delta_lp_wallets_7d), int(row.lp_wallets_7d), pct(row.tvl_change_pct_7d), usd(row.volume_7d_usd)]) : null,
  'Highlights pools attracting new LP wallets, often driven by incentives or rising fees.',
);

const buildPairPositionsTable = (rows) => dataTableWithCaption(
  'WFLR/USDT0 ERC-721 positions (anonymised)',
  ['LP', 'DEX', 'Position ID', 'TVL', 'Unclaimed fees', 'APR 30D', 'Strategy', 'Band', 'Time in range (30D)', 'Claim state'],
  rows
    ? rows.map((row) => [row.lp_label, row.dex_slug, row.position_id, usd(row.tvl_usd_current), usd(row.unclaimed_fees_usd), pct(row.apr_30d_pct), row.strategy_code || 'n/a', row.band_color || 'n/a', pct(row.time_in_range_30d_pct), row.late_claim_state || 'n/a'])
    : null,
  'This appendix mirrors the Pro detail view, proving our ERC-721 analytics granularity.',
);

const buildHtmlReport = (window, analytics) => {
  const { year, week } = isoWeek(window.weekEnd);
  const weekLabel = `${isoDate(window.weekStart)} → ${isoDate(window.weekEnd)}`;
  const prevLabel = `${isoDate(window.prevWeekStart)} → ${isoDate(window.prevWeekEnd)}`;
  const current = analytics.network?.current || {};
  const previous = analytics.network?.previous || {};
  const kpiRows = [
    ['TVL (avg)', usd(current.avg_tvl_usd), usd(previous.avg_tvl_usd)],
    ['Volume (7D)', usd(current.total_volume_usd), usd(previous.total_volume_usd)],
    ['Fees (7D)', usd(current.total_fees_usd), usd(previous.total_fees_usd)],
    ['Active pools', int(current.active_pools_count), int(previous.active_pools_count)],
    ['Active LP wallets', int(current.active_lp_wallets_count), int(previous.active_lp_wallets_count)],
    ['New LP wallets', int(current.new_lp_wallets_count), int(previous.new_lp_wallets_count)],
    ['Avg pool apr', pct(current.avg_pool_apr), pct(previous.avg_pool_apr)],
  ];
  const lpBucketTotal = (analytics.lpBuckets || []).reduce((sum, row) => sum + (Number(row.tvl_usd) || 0), 0);
  const lpBucketRows = (analytics.lpBuckets || []).map((row) => [row.bucket || 'n/a', int(row.lp_wallets_count), usd(row.tvl_usd), pct(lpBucketTotal ? (Number(row.tvl_usd) / lpBucketTotal) * 100 : null)]);
  const concentration = analytics.concentration?.[0];
  const fairnessRows = concentration
    ? [
        ['Top 1 wallet TVL share', pct(concentration.top1_tvl_share_pct)],
        ['Top 10 wallet TVL share', pct(concentration.top10_tvl_share_pct)],
        ['Top 10 wallet fee share', pct(concentration.top10_fees_share_pct)],
      ]
    : null;
  const dexShareRows = analytics.dexShare?.map((row) => [row.dex_slug || 'Unknown', usd(row.tvl_usd), usd(row.volume_usd), usd(row.fees_usd)]) || null;
  const pairCombinedRows = analytics.pair.combined
    ? [
        ['TVL (current)', usd(analytics.pair.combined.tvl_usd)],
        ['Volume (7D)', usd(analytics.pair.combined.volume_7d_usd)],
        ['Fees (7D)', usd(analytics.pair.combined.fees_7d_usd)],
        ['APR (7D avg)', pct(analytics.pair.combined.apr_7d_pct)],
        ['Active positions', int(analytics.pair.combined.active_positions)],
        ['Active LP wallets', int(analytics.pair.combined.active_lp_wallets_7d)],
      ]
    : null;
  const pairDexRows = analytics.pair.dex?.map((row) => [row.dex_slug, usd(row.tvl_usd), usd(row.volume_7d_usd), usd(row.fees_7d_usd), int(row.active_lp_wallets_7d)]) || null;
  const pairBucketRows = analytics.pair.buckets?.map((row) => [row.bucket, int(row.lp_wallets_count), usd(row.tvl_usd)]) || null;
  const pairAprRows = analytics.pair.aprDistribution?.map((row) => [row.bucket, int(row.positions), `${pct(row.bucket_min)} → ${pct(row.bucket_max)}`]) || null;
  const pairClaimRows = analytics.pair.claim?.map((row) => [row.bucket, row.avg_days_between_claims ? Number(row.avg_days_between_claims).toFixed(1) : 'n/a', pct(row.avg_unclaimed_fees_pct_of_tvl), pct(row.late_pct), pct(row.very_late_pct)]) || null;
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>LiquiLab Weekly Universe Report – Week ${week}, ${year}</title>
        <style>
          body { font-family: 'Inter', 'Segoe UI', sans-serif; margin: 40px; color: #0b1530; }
          h1, h2, h3 { color: #0b1530; }
          h1 { font-size: 28px; }
          h2 { margin-top: 32px; border-bottom: 1px solid #e0e4f0; padding-bottom: 8px; }
          h3 { margin-top: 20px; }
          ul { padding-left: 20px; }
          table { border-collapse: collapse; width: 100%; margin-top: 8px; }
          th, td { border: 1px solid #dde1ef; padding: 8px; }
          th { background: #f3f5fc; text-align: left; }
          .caption { font-size: 13px; color: #4d5c7d; margin-top: 4px; }
          .chapter-title { margin-top: 40px; }
          .figure { margin-top: 24px; }
        </style>
      </head>
      <body>
        <h1>LiquiLab Weekly Universe Report</h1>
        <p>Flare V3 concentrated liquidity — Week ${week}, ${year} (${weekLabel}, comparison ${prevLabel})</p>
        ${buildExecutiveSummary(window, analytics)}
        <section>
          <h2>2. Flare V3 LP Market Overview</h2>
          ${dataTableWithCaption('Universe KPIs (7D vs previous 7D)', ['Metric', weekLabel, prevLabel], kpiRows, 'Core KPIs for the current vs prior week, sourced from analytics_market_metrics_daily.')} 
          ${buildSeriesPreview('90-day TVL vs Volume vs Fees (preview for chart)', [{ label: 'Day', key: 'day' }, { label: 'TVL (USD)', key: 'tvl_usd' }, { label: 'Volume (USD)', key: 'volume_usd' }, { label: 'Fees (USD)', key: 'fees_usd' }], analytics.series.tvlSeries, 'Shows the last 90 days of TVL, volume, and fees as a data source for the chart.')} 
          ${buildSeriesPreview('90-day Active vs New LP wallets (preview)', [{ label: 'Day', key: 'day' }, { label: 'Active wallets', key: 'active_lp_wallets' }, { label: 'New wallets', key: 'new_lp_wallets' }], analytics.series.walletSeries, 'Trend data for active and new LP wallets to illustrate usage dynamics.')} 
          ${dataTableWithCaption('DEX share (last 7 days)', ['DEX', 'TVL (7D)', 'Volume (7D)', 'Fees (7D)'], dexShareRows, 'Split of liquidity across Ēnosys and SparkDEX to show ecosystem balance.')} 
        </section>
        <section>
          <h2>3. LP Population & Fairness</h2>
          ${dataTableWithCaption('LP size buckets (Retail/Mid/Whale)', ['Bucket', 'Wallets', 'TVL', 'Share of TVL'], lpBucketRows, 'Bucket definitions follow the Universe SSoT (Retail <0.10%, Mid 0.10–1.0%, Whale ≥1.0% share of pool TVL).')} 
          ${dataTableWithCaption('Concentration metrics', ['Metric', 'Value'], fairnessRows, 'Indicates whether TVL and fees remain evenly distributed across wallets.')} 
          <p class="caption">Fees remain broadly proportional to TVL when top-10 fee share tracks top-10 TVL share.</p>
        </section>
        <section>
          <h2>4. RangeBand™ Market Barometer</h2>
          ${buildRangeBandSummary(analytics.rangeBand.band)}
          ${buildStrategyMix(analytics.rangeBand.strategy)}
        </section>
        <section>
          <h2>5. Top Pools & Growth Pools</h2>
          ${buildTopPoolsTable(analytics.topPools)}
          ${buildGrowthPoolsTable(analytics.growthPools)}
          <p class="caption">WFLR/USDT0 appears in these tables and is covered in more detail in Chapter 6.</p>
        </section>
        <section>
          <h2>6. Pool Deep Dive — WFLR/USDT0</h2>
          ${dataTableWithCaption('Combined KPIs (Ēnosys + SparkDEX)', ['Metric', 'Value'], pairCombinedRows, 'Summarises total scale and fee performance for the flagship pair.')} 
          ${dataTableWithCaption('DEX breakdown (7D)', ['DEX', 'TVL', 'Volume 7D', 'Fees 7D', 'Active LP wallets'], pairDexRows, 'Shows how both DEXes contribute to this pair.')} 
          ${buildSeriesPreview('WFLR/USDT0 — 90d TVL & active wallets', [{ label: 'Day', key: 'day' }, { label: 'TVL (USD)', key: 'tvl_usd' }, { label: 'Active LP wallets', key: 'active_lp_wallets' }], analytics.pair.trend, 'Trend data to build the 90-day TVL & wallet chart.')} 
          ${dataTableWithCaption('LP buckets (WFLR/USDT0)', ['Bucket', 'Wallets', 'TVL'], pairBucketRows, 'Distribution of wallets across Retail/Mid/Whale buckets for the deep dive pool.')} 
          ${buildRangeBandSummary(analytics.pair.rangeBand)}
          ${dataTableWithCaption('APR distribution (30D buckets)', ['Bucket', 'Positions', 'APR range'], pairAprRows, 'APR percentiles to illustrate how realised yields cluster.')} 
          ${dataTableWithCaption('Claim behaviour & missed fees (30D)', ['Bucket', 'Avg days between claims', 'Avg unclaimed fees % TVL', 'Late %', 'Very late %'], pairClaimRows, 'Captures claim discipline and the share of positions delayed (Late/Very late).')} 
          ${buildPairPositionsTable(analytics.pair.positions)}
        </section>
        <section>
          <h2>7. Ecosystem & Context</h2>
          <ul>
            <li>Liquidity inflows remain steady but concentrated in WFLR pairs; smaller pools rely on incentives.</li>
            <li>Reward Flare (rFLR) continues to supplement trading fees and is captured in missed-fee estimates.</li>
            <li>Cross-DEX wallet growth indicates more LPs are experimenting with both Ēnosys and SparkDEX.</li>
            <li>The analytics stack used here is the same pipeline powering the Pro Weekly Universe preview.</li>
          </ul>
        </section>
        <p class="caption">Report generated ${new Date().toISOString()} — LiquiLab weekly analytics (Flare V3 concentrated liquidity).</p>
      </body>
    </html>
  `;
  return html;
};

const ensureDir = async (dir) => fs.mkdir(dir, { recursive: true });

const writeReport = async (window, html) => {
  const { year, week } = isoWeek(window.weekEnd);
  const filenameBase = `Cross-DEX-Report-${year}-W${String(week).padStart(2, '0')}`;
  const htmlPath = path.join(REPORT_DIR, `${filenameBase}.html`);
  await fs.writeFile(htmlPath, html, 'utf8');
  return { htmlPath, filenameBase };
};

const exportPdf = async (htmlPath, filenameBase) => {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
  const pdfPath = path.join(REPORT_DIR, `${filenameBase}.pdf`);
  await page.pdf({ path: pdfPath, format: 'A4', margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' } });
  await browser.close();
  return pdfPath;
};

const main = async () => {
  console.log('🚀 LiquiLab Weekly Universe Report');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const window = getWindow();
  const { year, week } = isoWeek(window.weekEnd);
  console.log(`📅 Generating Week ${week}, ${year} (${isoDate(window.weekStart)} → ${isoDate(window.weekEnd)})`);

  const analytics = await fetchAnalytics(window);
  const html = buildHtmlReport(window, analytics);
  await ensureDir(REPORT_DIR);
  const { htmlPath, filenameBase } = await writeReport(window, html);
  const pdfPath = await exportPdf(htmlPath, filenameBase);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Weekly Universe report generated');
  console.log(`📄 HTML: ${htmlPath}`);
  console.log(`📄 PDF : ${pdfPath}`);
  console.log(`📊 Avg TVL: ${usd(analytics.network?.current?.avg_tvl_usd)}`);
  console.log(`👥 Active LP wallets: ${int(analytics.network?.current?.active_lp_wallets_count)}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};

if (require.main === module) {
  main()
    .then(() => {
      console.log('✨ Done!\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ ERROR:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}

module.exports = { main };
