import { useCallback, useEffect, useMemo, useState } from 'react';

export type UsePromptBuilderOptions = {
  storageKey?: string; // اگر ست شود، پرامپت نگه‌داری می‌شود
};

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function approximateTokens(s: string) {
  // تخمین خیلی ساده: ~ 4 کاراکتر ≈ 1 توکن
  return Math.max(1, Math.round(s.length / 4));
}

export function usePromptBuilder(defaultPrompt = '', options: UsePromptBuilderOptions = {}) {
  const { storageKey } = options;

  const [prompt, setPrompt] = useState<string>(() => {
    if (!storageKey || !isBrowser()) return defaultPrompt;
    try {
      return localStorage.getItem(storageKey) ?? defaultPrompt;
    } catch {
      return defaultPrompt;
    }
  });

  useEffect(() => {
    if (!storageKey || !isBrowser()) return;
    try {
      localStorage.setItem(storageKey, prompt);
    } catch {}
  }, [prompt, storageKey]);

  const set = useCallback((text: string) => setPrompt(text), []);
  const clear = useCallback(() => setPrompt(''), []);
  const append = useCallback((text: string) => setPrompt(curr => curr + text), []);
  const appendLine = useCallback((text: string = '') => setPrompt(curr => (curr ? curr + '\n' + text : text)), []);
  const prepend = useCallback((text: string) => setPrompt(curr => text + curr), []);
  const insertAt = useCallback((index: number, text: string) => {
    setPrompt(curr => {
      const i = Math.max(0, Math.min(index, curr.length));
      return curr.slice(0, i) + text + curr.slice(i);
    });
  }, []);
  const wrap = useCallback((prefix: string, suffix: string) => setPrompt(curr => prefix + curr + suffix), []);
  const replaceAll = useCallback((search: string | RegExp, replacement: string) => {
    setPrompt(curr => curr.replace(search as any, replacement));
  }, []);
  const ensureTrailingNewline = useCallback((count = 1) => {
    setPrompt(curr => {
      const trailing = curr.match(/\n*$/)?.[0]?.length ?? 0;
      const needed = Math.max(0, count - trailing);
      return needed ? curr + '\n'.repeat(needed) : curr;
    });
  }, []);
  const interpolate = useCallback((vars: Record<string, string | number>) => {
    setPrompt(curr =>
      curr.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{{${k}}}`))
    );
  }, []);

  const stats = useMemo(() => {
    const chars = prompt.length;
    const words = prompt.trim() ? prompt.trim().split(/\s+/).length : 0;
    const tokens = approximateTokens(prompt);
    const lines = prompt.split('\n').length;
    return { chars, words, tokens, lines };
  }, [prompt]);

  return useMemo(
    () => ({
      prompt,
      set,
      clear,
      append,
      appendLine,
      prepend,
      insertAt,
      wrap,
      replaceAll,
      ensureTrailingNewline,
      interpolate,
      stats,
    }),
    [prompt, set, clear, append, appendLine, prepend, insertAt, wrap, replaceAll, ensureTrailingNewline, interpolate, stats]
  );
}