import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { AppError, ErrorContextType } from '../types';

type InternalError = AppError & { __id: string; __ts: number };

type State = { items: InternalError[] };

type Action =
  | { type: 'ADD'; payload: InternalError }
  | { type: 'CLEAR' };

const MAX_ERRORS = 50;
const DEDUPE_WINDOW_MS = 2_000;

function genId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as any).randomUUID();
  }
  return `err_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function toInternal(err: AppError): InternalError {
  const code = err.code || 'APP_ERROR';
  return {
    name: err.name ?? 'Error',
    message: err.message ?? 'Unknown error',
    code,
    status: err.status,
    cause: err.cause,
    meta: err.meta,
    __id: genId(),
    __ts: Date.now(),
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD': {
      const next = [action.payload, ...state.items];
      if (next.length > MAX_ERRORS) next.length = MAX_ERRORS;
      return { items: next };
    }
    case 'CLEAR':
      return { items: [] };
    default:
      return state;
  }
}

function shouldDedupe(prev?: InternalError, next?: InternalError) {
  if (!prev || !next) return false;
  if (prev.code !== next.code) return false;
  if (prev.message !== next.message) return false;
  return next.__ts - prev.__ts < DEDUPE_WINDOW_MS;
}

export const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });

  const addError = useCallback((err: AppError) => {
    const normalized = toInternal(err);
    const last = state.items[0];
    if (shouldDedupe(last, normalized)) return;
    dispatch({ type: 'ADD', payload: normalized });
  }, [state.items]);

  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const value = useMemo<ErrorContextType>(() => {
    // تبدیل به AppError[] برای خروجی کانتکست
    const errors: AppError[] = state.items.map(({ __id: _i, __ts: _t, ...rest }) => rest);
    return { errors, addError, clearErrors };
  }, [state.items, addError, clearErrors]);

  return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>;
}

export const useErrorContext = () => {
  const ctx = useContext(ErrorContext);
  if (!ctx) throw new Error('ErrorContext is not provided');
  return ctx;
};