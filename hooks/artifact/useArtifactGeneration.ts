import { useCallback, useMemo, useRef, useState } from 'react';
import { Artifact, AppError, JsonValue, Result } from '../../types';
import { httpJson } from '../../utils/http';

export type UseArtifactGenerationOptions<Data = JsonValue> = {
  endpoint?: string; // مسیر API (پیش‌فرض: /api/artifacts)
};

export function useArtifactGeneration<
  Payload extends Record<string, any> | FormData = Record<string, any>,
  Data = JsonValue
>(options: UseArtifactGenerationOptions<Data> = {}) {
  const { endpoint = '/api/artifacts' } = options;

  const [generating, setGenerating] = useState(false);
  const [artifact, setArtifact] = useState<Artifact<Data> | null>(null);
  const [error, setError] = useState<AppError | null>(null);

  const controllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setGenerating(false);
    setArtifact(null);
    setError(null);
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  const generate = useCallback(
    async (payload: Payload): Promise<Result<Artifact<Data>>> => {
      setGenerating(true);
      setError(null);

      try {
        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;

        const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;

        const res = await httpJson<Artifact<Data>>(endpoint, {
          method: 'POST',
          body: isFormData ? (payload as FormData) : JSON.stringify(payload),
          headers: isFormData ? { Accept: 'application/json' } : { 'Content-Type': 'application/json', Accept: 'application/json' },
          signal: controller.signal,
        });

        setArtifact(res);
        setGenerating(false);
        return { ok: true, data: res };
      } catch (e: any) {
        setError(e);
        setGenerating(false);
        return { ok: false, error: e };
      }
    },
    [endpoint]
  );

  return useMemo(
    () => ({
      artifact,
      generating,
      error,
      generate,
      reset,
      abort: () => controllerRef.current?.abort(),
    }),
    [artifact, generating, error, generate, reset]
  );
}