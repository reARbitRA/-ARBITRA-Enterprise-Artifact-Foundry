import React, { createContext, useContext, useMemo } from 'react';
import { AIToolkitConfig } from '../types';
import { useAIToolkit } from '../hooks/toolkit/useAIToolkit';

type ConfigContextType = {
  config: AIToolkitConfig;
  isValid: boolean;
  issues: string[];
  setConfig: (cfg: AIToolkitConfig) => void;
  updateConfig: <K extends keyof AIToolkitConfig>(
    key: K,
    value: AIToolkitConfig[K] | ((prev: AIToolkitConfig[K]) => AIToolkitConfig[K])
  ) => void;
  mergeConfig: (partial: Partial<AIToolkitConfig>) => void;
  reset: () => void;
};

const DEFAULT_CONFIG: AIToolkitConfig = {
  model: 'default',
  provider: 'openai',
  temperature: 0.7,
  maxTokens: 2048,
};

export const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({
  children,
  initial,
  storageKey = 'app:toolkit',
}: {
  children: React.ReactNode;
  initial?: Partial<AIToolkitConfig>;
  storageKey?: string;
}) {
  const base = useMemo(() => ({ ...DEFAULT_CONFIG, ...initial }), [initial]);
  const {
    config,
    isValid,
    issues,
    setConfig,
    updateConfig,
    mergeConfig,
    reset,
  } = useAIToolkit(base, { storageKey, clamp: true });

  const value = useMemo<ConfigContextType>(() => ({
    config,
    isValid,
    issues,
    setConfig,
    updateConfig,
    mergeConfig,
    reset,
  }), [config, isValid, issues, setConfig, updateConfig, mergeConfig, reset]);

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export const useConfigContext = () => {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('ConfigContext not provided');
  return ctx;
};