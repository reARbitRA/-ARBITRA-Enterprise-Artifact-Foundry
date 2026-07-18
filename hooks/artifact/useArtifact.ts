import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Artifact, AppError, JsonValue, Result } from '../../types';
import { httpJson } from '../../utils/http';

// کش بسیار سبک در سطح ماژول (اختیاری و کوچک)
type CacheEntry<T> = { data: T; ts: number };
const artifactCache = new Map<string, CacheEntry<Artifact<any>>>();

export type UseArtifactOptions<Data = JsonValue> = {
  auto?: boolean; // auto fetch on mount
  staleTimeMs?: number; // زمان تازه بودن کش
  refreshIntervalMs?: number; // پولینگ اختیاری
  initialData?: Artifact<Data> | null; // داده اولیه
};

const DEFAULT_STALE_TIME = 30_000;

export function useArtifact<Data = JsonValue>(
  artifactId: string | null | undefined,
  options: UseArtifactOptions<Data> = {}
) {
  const {
    auto = true,
    staleTimeMs = DEFAULT_STALE_TIME,
    refreshIntervalMs,
    initialData = null,
  } = options;

  const key = artifactId ? `artifact:${artifactId}` : null;

  const [artifact, setArtifact] = useState<Artifact<Data> | null>(initialData);
  const [loading, setLoading] = useState<boolean>(Boolean(auto && artifactId && !initialData));
  const [error, setError] = useState<AppError | null>(null);
  const [isStale, setIsStale] = useState<boolean>(false);

  const controllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const fromCache = useCallback(() => {
    if (!key) return null;
    const entry = artifactCache.get(key);
    if (!entry) return null;
    const fresh = Date.now() - entry.ts <= staleTimeMs;
    setIsStale(!fresh);
    return entry.data as Artifact<Data>;
  }, [key, staleTimeMs]);

  const saveCache = useCallback((data: Artifact<Data>) => {
    if (!key) return;
    artifactCache.set(key, { data, ts: Date.now() });
    setIsStale(false);
  }, [key]);

  const fetchArtifact = useCallback(async (forceNetwork = false): Promise<Result<Artifact<Data>>> => {
    if (!artifactId) {
      return { ok: false, error: Object.assign(new Error('artifactId is required'), { code: 'ARTIFACT_ID_REQUIRED' }) };
    }

    try {
      // استفاده از کش در صورت امکان
      if (!forceNetwork) {
        const cached = fromCache();
        if (cached) {
          setArtifact(cached);
          setLoading(false);
          return { ok: true, data: cached };
        }
      }

      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setLoading(true);
      setError(null);

      const data = await httpJson<Artifact<Data>>(`/api/artifacts/${artifactId}`, {
        method: 'GET',
        signal: controller.signal,
      });

      if (!mountedRef.current) return { ok: true, data }; // جلوگیری از setState بعد از unmount

      setArtifact(data);
      saveCache(data);
      setLoading(false);

      return { ok: true, data };
    } catch (e: any) {
      if (!mountedRef.current) {
        return { ok: false, error: e };
      }
      setError(e);
      setLoading(false);
      return { ok: false, error: e };
    }
  }, [artifactId, fromCache, saveCache]);

  const refetch = useCallback(
    async (opts?: { force?: boolean }) => {
      return fetchArtifact(Boolean(opts?.force));
    },
    [fetchArtifact]
  );

  const setLocal = useCallback((updater: (prev: Artifact<Data> | null) => Artifact<Data> | null) => {
    setArtifact(prev => {
      const next = updater(prev);
      if (next && key) {
        artifactCache.set(key, { data: next, ts: Date.now() });
        setIsStale(false);
      }
      return next;
    });
  }, [key]);

  // mount/unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, []);

  // واکنش به تغییر artifactId یا تنظیمات
  useEffect(() => {
    if (!artifactId || !auto) return;

    const cached = fromCache();
    if (cached) {
      setArtifact(cached);
      setLoading(false);
      return; // در صورت نیاز refetch دستی انجام شود
    }

    void fetchArtifact();
  }, [artifactId, auto, fromCache, fetchArtifact]);

  // پولینگ اختیاری
  useEffect(() => {
    if (!artifactId || !refreshIntervalMs || refreshIntervalMs <= 0) return;

    const interval = setInterval(() => {
      void refetch({ force: true });
    }, refreshIntervalMs);

    return () => clearInterval(interval);
  }, [artifactId, refreshIntervalMs, refetch]);

  return useMemo(
    () => ({
      artifact,
      loading,
      error,
      isStale,
      refetch,
      setLocal, // برای اپدیت خوشبینانه UI
    }),
    [artifact, loading, error, isStale, refetch, setLocal]
  );
}