import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type UseDashboardFiltersOptions<T extends Record<string, unknown>> = {
  storageKey?: string; // اگر ست شود، فیلترها در localStorage نگه‌داری می‌شوند
  onChange?: (filters: T) => void;
};

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function useDashboardFilters<T extends Record<string, unknown>>(
  initialFilters: T,
  options: UseDashboardFiltersOptions<T> = {}
) {
  const { storageKey, onChange } = options;
  const initialRef = useRef<T>(initialFilters);

  const readFromStorage = useCallback((): Partial<T> => {
    if (!storageKey || !isBrowser()) return {};
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return typeof parsed === 'object' && parsed ? parsed as Partial<T> : {};
    } catch {
      return {};
    }
  }, [storageKey]);

  const [filters, setFilters] = useState<T>(() => {
    const persisted = readFromStorage();
    return { ...initialFilters, ...persisted };
  });

  // persist to storage
  useEffect(() => {
    if (!storageKey || !isBrowser()) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(filters));
    } catch {}
  }, [filters, storageKey]);

  // onChange callback
  useEffect(() => {
    onChange?.(filters);
  }, [filters, onChange]);

  const updateFilter = useCallback(
    <K extends keyof T>(key: K, value: T[K] | ((prev: T[K]) => T[K])) => {
      setFilters(prev => {
        const nextValue = typeof value === 'function' ? (value as (p: T[K]) => T[K])(prev[key]) : value;
        if (Object.is(prev[key], nextValue)) return prev;
        return { ...prev, [key]: nextValue } as T;
      });
    },
    []
  );

  const mergeFilters = useCallback((partial: Partial<T>) => {
    setFilters(prev => ({ ...prev, ...partial }));
  }, []);

  const removeFilter = useCallback(<K extends keyof T>(key: K) => {
    setFilters(prev => {
      const { [key]: _, ...rest } = prev;
      return rest as T;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ ...initialRef.current });
  }, []);

  const toQueryString = useCallback(() => {
    const usp = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      usp.set(k, typeof v === 'boolean' ? String(v) : String(v));
    });
    const qs = usp.toString();
    return qs ? `?${qs}` : '';
  }, [filters]);

  return useMemo(
    () => ({
      filters,
      setFilters,      // در صورت نیاز به کنترل کامل
      updateFilter,    // آپدیت تایپ‌سیف
      mergeFilters,    // ادغام چند فیلد
      removeFilter,    // حذف یک فیلتر
      resetFilters,    // بازنشانی به مقدار اولیه
      toQueryString,   // تبدیل به query string
    }),
    [filters, updateFilter, mergeFilters, removeFilter, resetFilters, toQueryString]
  );
}