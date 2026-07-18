import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AIToolkitConfig } from '../../types';

export type UseAIToolkitOptions = {
  storageKey?: string;
  clamp?: boolean; // مقادیر temperature و maxTokens در بازه امن clamp می‌شوند
  validate?: (cfg: AIToolkitConfig) => { valid: boolean; issues?: string[] };
};

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

const DEFAULT_VALIDATE = (cfg: AIToolkitConfig) => {
  const issues: string[] = [];
  if (!cfg.model) issues.push('model is required');
  if (!['openai', 'google', 'azure', 'custom'].includes(cfg.provider)) issues.push('invalid provider');
  if (cfg.temperature < 0 || cfg.temperature > 2) issues.push('temperature must be in [0, 2]');
  if (!Number.isFinite(cfg.maxTokens) || cfg.maxTokens <= 0) issues.push('maxTokens must be a positive number');
  return { valid: issues.length === 0, issues };
};

export function useAIToolkit(defaultConfig: AIToolkitConfig, options: UseAIToolkitOptions = {}) {
  const { storageKey, clamp = true, validate = DEFAULT_VALIDATE } = options;
  const defaultRef = useRef(defaultConfig);

  const readStored = useCallback((): Partial<AIToolkitConfig> => {
    if (!storageKey || !isBrowser()) return {};
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return typeof parsed === 'object' && parsed ? parsed as Partial<AIToolkitConfig> : {};
    } catch {
      return {};
    }
  }, [storageKey]);

  const [config, setConfig] = useState<AIToolkitConfig>(() => ({ ...defaultConfig, ...readStored() }));
  const [issues, setIssues] = useState<string[]>([]);
  const [isValid, setIsValid] = useState<boolean>(true);

  const sanitize = useCallback((cfg: AIToolkitConfig): AIToolkitConfig => {
    if (!clamp) return cfg;
    const temperature = Math.max(0, Math.min(2, cfg.temperature));
    const maxTokens = Math.max(1, Math.floor(cfg.maxTokens));
    return { ...cfg, temperature, maxTokens };
  }, [clamp]);

  // validate whenever config changes
  useEffect(() => {
    const { valid, issues } = validate(config);
    setIsValid(valid);
    setIssues(issues ?? []);
  }, [config, validate]);

  // persist
  useEffect(() => {
    if (!storageKey || !isBrowser()) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(config));
    } catch {}
  }, [config, storageKey]);

  const updateConfig = useCallback(
    <K extends keyof AIToolkitConfig>(key: K, value: AIToolkitConfig[K] | ((prev: AIToolkitConfig[K]) => AIToolkitConfig[K])) => {
      setConfig(prev => {
        const nextVal = typeof value === 'function' ? (value as (p: AIToolkitConfig[K]) => AIToolkitConfig[K])(prev[key]) : value;
        if (Object.is(prev[key], nextVal)) return prev;
        return sanitize({ ...prev, [key]: nextVal });
      });
    },
    [sanitize]
  );

  const mergeConfig = useCallback((partial: Partial<AIToolkitConfig>) => {
    setConfig(prev => sanitize({ ...prev, ...partial }));
  }, [sanitize]);

  const reset = useCallback(() => {
    setConfig(sanitize({ ...defaultRef.current }));
  }, [sanitize]);

  return useMemo(
    () => ({
      config,
      isValid,
      issues,
      setConfig: (cfg: AIToolkitConfig) => setConfig(sanitize(cfg)),
      updateConfig,   // آپدیت تایپ‌سیف
      mergeConfig,    // مرج کردن بخشی از کانفیگ
      reset,          // ریست به مقدار پیش‌فرض
    }),
    [config, isValid, issues, updateConfig, mergeConfig, reset, sanitize]
  );
}