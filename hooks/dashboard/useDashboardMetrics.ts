import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppError, DashboardMetric, Result } from '../../types';
import { httpJson } from '../../utils/http';

type ParamsValue = string | number | boolean | undefined | null;

export type UseDashboardMetricsOptions = {
  endpoint?: string; // پیش‌فرض: /api/metrics/dashboard
  params?: Record<string, ParamsValue>;
  auto?: boolean;
  staleTimeMs?: number;
  refreshIntervalMs?: number; // پولینگ اختیاری
  decoder?: (input: unknown) => DashboardMetric[];
};

type CacheEntry = { data: DashboardMetric[]; ts: number };
const cache = new Map<string, CacheEntry>();

const DEFAULT_ENDPOINT = '/api/metrics/dashboard';
const DEFAULT_STALE = 30_000;

function serializeParams(params?: Record<string, ParamsValue>) {
  const usp = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      usp.set(k, typeof v === 'boolean' ? String(v) : String(v));
    });
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

export function useDashboardMetrics(opts: UseDashboardMetricsOptions = {}) {
  const {
    endpoint = DEFAULT_ENDPOINT,
    params,
    auto = true,
    staleTimeMs = DEFAULT_STALE,
    refreshIntervalMs,
    decoder,
  } = opts;

  const key = useMemo(() => `${endpoint}${serializeParams(params)}`, [endpoint, params]);

  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(auto));
  const [error, setError] = useState<AppError | null>(null);
  const [isStale, setIsStale] = useState<boolean>(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const fromCache = useCallback(() => {
    const entry = cache.get(key);
    if (!entry) return null;
    const fresh = Date.now() - entry.ts <= staleTimeMs;
    setIsStale(!fresh);
    return entry.data;
  }, [key, staleTimeMs]);

  const saveCache = useCallback((data: DashboardMetric[]) => {
    cache.set(key, { data, ts: Date.now() });
    setIsStale(false);
    setLastUpdatedAt(Date.now());
  }, [key]);

  // FIX: Removed extra '>' from the Promise return type definition
  const fetchMetrics = useCallback(async (force = false): Promise<Result<DashboardMetric[]>> => {
    try {
      if (!force) {
        const cached = fromCache();
        if (cached) {
          setMetrics(cached);
          setLoading(false);
          return { ok: true, data: cached };
        }
      }

      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setLoading(true);
      setError(null);

      const data = await httpJson<DashboardMetric[]>(key, {
        method: 'GET',
        signal: controller.signal,
        decoder,
      });

      if (!mountedRef.current) return { ok: true, data };

      setMetrics(data);
      saveCache(data);
      setLoading(false);

      return { ok: true, data };
    } catch (e: any) {
      if (!mountedRef.current) return { ok: false, error: e };
      setError(e);
      setLoading(false);
      return { ok: false, error: e };
    }
  }, [decoder, fromCache, key, saveCache]);

  const refetch = useCallback((opts?: { force?: boolean }) => fetchMetrics(Boolean(opts?.force)), [fetchMetrics]);

  const setLocal = useCallback((updater: (prev: DashboardMetric[]) => DashboardMetric[]) => {
    setMetrics(prev => {
      const next = updater(prev);
      saveCache(next);
      return next;
    });
  }, [saveCache]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!auto) return;
    const cached = fromCache();
    if (cached) {
      setMetrics(cached);
      setLoading(false);
      return;
    }
    void fetchMetrics();
  }, [auto, fetchMetrics, fromCache]);

  useEffect(() => {
    if (!refreshIntervalMs || refreshIntervalMs <= 0) return;
    const id = setInterval(() => void refetch({ force: true }), refreshIntervalMs);
    return () => clearInterval(id);
  }, [refreshIntervalMs, refetch]);

  return useMemo(
    () => ({
      metrics,
      loading,
      error,
      isStale,
      lastUpdatedAt,
      refetch,
      setLocal,
    }),
    [metrics, loading, error, isStale, lastUpdatedAt, refetch, setLocal]
  );
}