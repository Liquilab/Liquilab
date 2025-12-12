import { useCallback, useEffect, useMemo, useState } from 'react';

type IntelRecency = 'day' | 'week';

type IntelItem = {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  snippet?: string;
  relevance?: number;
};

type IntelImpact = {
  bullets: string[];
  riskLevel: 'low' | 'med' | 'high';
};

type IntelSuccess = {
  ok: true;
  pair: string;
  tokens: string[];
  recency: IntelRecency;
  items: IntelItem[];
  impact: IntelImpact;
  fallback?: boolean;
  empty?: boolean;
};

type IntelError = {
  ok: false;
  error: string;
  pair?: string;
  tokens?: string[];
  recency?: IntelRecency;
};

type PoolIntelCardProps = {
  pair?: string;
  tokens?: string[];
  chain?: string;
  recency?: IntelRecency;
};

type FetchStatus = 'idle' | 'loading' | 'loaded' | 'error';

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Request geweigerd; we hebben automatisch een fallback geprobeerd.',
  429: 'Teveel verzoeken; probeer zo weer.',
  500: 'Unexpected error.',
  501: 'API-sleutel ontbreekt.',
  502: 'Upstream tijdelijk onbereikbaar.',
};

const RISK_LABELS: Record<'low' | 'med' | 'high', string> = {
  low: 'Low risk',
  med: 'Medium risk',
  high: 'High risk',
};

export function PoolIntelCard({
  pair,
  tokens,
  chain = 'flare',
  recency = 'week',
}: PoolIntelCardProps) {
  const [status, setStatus] = useState<FetchStatus>('idle');
  const [error, setError] = useState<string | undefined>();
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [data, setData] = useState<IntelSuccess | undefined>();
  const [localRecency, setLocalRecency] = useState<IntelRecency>(recency);
  const [allowAny, setAllowAny] = useState(false);

  useEffect(() => {
    setLocalRecency(recency);
  }, [recency]);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (tokens?.length) {
      params.set('tokens', tokens.join(','));
    } else if (pair) {
      params.set('pair', pair);
    }
    params.set('chain', chain);
    params.set('recency', localRecency);
    return params.toString();
  }, [pair, tokens, chain, localRecency]);

  useEffect(() => {
    setAllowAny(false);
  }, [pair, tokens?.join(',')]);

  const fetchIntel = useCallback(async () => {
    if (!pair && !tokens?.length) return;
    setStatus('loading');
    setError(undefined);

    try {
      const url = `/api/intel/news?${query}${allowAny ? '&allow=any' : ''}`;
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => undefined)) as IntelError | undefined;
        const message =
          STATUS_MESSAGES[response.status] ||
          body?.error ||
          `Request failed (${response.status})`;
        setStatusCode(response.status);
        setError(message);
        setStatus('error');
        return;
      }

      const body = (await response.json()) as IntelSuccess | IntelError;
      if (!body.ok) {
        setStatusCode(response.status);
        setError(body.error || 'Unexpected error.');
        setStatus('error');
        return;
      }

      setData(body);
      setStatusCode(null);
      setStatus('loaded');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to load intel');
      setStatusCode(null);
    }
  }, [pair, tokens, query, allowAny]);

  useEffect(() => {
    if (!pair && !tokens?.length) return;
    fetchIntel();
  }, [fetchIntel, pair, tokens]);

  if (!pair && !tokens?.length) {
    return null;
  }

  const items = data?.items ?? [];
  const impact = data?.impact;

  const subjectLabel = useMemo(() => {
    if (data?.tokens?.length) return data.tokens.join(' / ');
    if (pair) return pair;
    if (tokens?.length) return tokens.join(' / ');
    return 'this pool';
  }, [data?.tokens, pair, tokens]);

  const resolveHostname = useCallback((item: IntelItem) => {
    if (item.source) return item.source;
    try {
      return new URL(item.url).hostname.replace(/^www\./, '');
    } catch {
      return 'source';
    }
  }, []);

  const activeRecency = status === 'loaded' && data ? data.recency : localRecency;
  const isEmpty = status === 'loaded' && (data?.empty || (data && data.items.length === 0));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {impact?.riskLevel && (
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium ${
              impact.riskLevel === 'high'
                ? 'bg-red-500/20 text-red-300'
                : impact.riskLevel === 'med'
                  ? 'bg-amber-500/20 text-amber-200'
                  : 'bg-emerald-500/20 text-emerald-200'
            }`}
          >
            {RISK_LABELS[impact.riskLevel]}
          </span>
        )}

        <div className="inline-flex items-center rounded-lg bg-[#0B1530]/50 p-1 text-xs text-white/60">
          {(['day', 'week'] as IntelRecency[]).map((option) => {
            const active = localRecency === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  if (!active) {
                    setLocalRecency(option);
                  }
                }}
                className={`rounded-md px-3 py-1 transition ${
                  active ? 'bg-[#3B82F6] text-white shadow-sm' : 'hover:text-white hover:bg-white/5'
                }`}
                aria-pressed={active}
              >
                {option === 'day' ? 'Day' : 'Week'}
              </button>
            );
          })}
        </div>
      </div>

      {status === 'loading' && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-lg bg-white/5 p-4"
            >
              <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
              <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-white/10" />
              <div className="mt-3 h-3 w-full animate-pulse rounded bg-white/5" />
            </div>
          ))}
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-lg bg-white/5 p-5 text-white/70">
          <p className="text-sm">Pool intel is temporarily unavailable. On-chain analytics remain up to date.</p>
          <button
            type="button"
            onClick={fetchIntel}
            className="mt-3 inline-flex items-center justify-center rounded-md bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2563EB]"
          >
            Retry
          </button>
        </div>
      )}

      {isEmpty && (
        <div className="rounded-lg bg-white/5 p-5 text-white/70">
          <p className="text-sm">
            No notable web signals for this pair in the selected window.
          </p>
        </div>
      )}

      {status === 'loaded' && !isEmpty && items.length > 0 && (
        <div className="space-y-3">
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={`${item.url}-${item.publishedAt}`}>
                <article className="rounded-lg bg-white/5 p-4 transition hover:bg-white/10">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-semibold text-white hover:underline"
                  >
                    {item.title}
                  </a>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/50">
                    <span>{resolveHostname(item)}</span>
                    <span>•</span>
                    <span>{new Date(item.publishedAt).toLocaleDateString('en-US')}</span>
                  </div>
                  {item.snippet && (
                    <p className="mt-2 text-sm text-white/70">{item.snippet}</p>
                  )}
                </article>
              </li>
            ))}
          </ul>

          {impact?.bullets?.length ? (
            <div className="rounded-lg bg-white/5 p-4">
              <p className="mb-2 text-sm font-semibold text-white">Impact</p>
              <ul className="space-y-1.5">
                {impact.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2 text-sm text-white/70">
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-[#3B82F6]" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default PoolIntelCard;
