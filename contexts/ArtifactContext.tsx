import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { Artifact } from '../types';

type State = {
  byId: Record<string, Artifact<any>>;
  order: string[]; // ترتیب نمایش
};

type Action =
  | { type: 'ADD'; payload: Artifact<any> }
  | { type: 'ADD_MANY'; payload: Artifact<any>[] }
  | { type: 'UPSERT'; payload: Artifact<any> }
  | { type: 'PATCH'; payload: { id: string; changes: Partial<Artifact<any>> } }
  | { type: 'REMOVE'; payload: { id: string } }
  | { type: 'CLEAR' }
  | { type: 'REPLACE_ALL'; payload: Artifact<any>[] };

const initialState: State = { byId: {}, order: [] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD': {
      const a = action.payload;
      if (state.byId[a.id]) return state; // جلوگیر‌ی از تکراری
      return {
        byId: { ...state.byId, [a.id]: a },
        order: [...state.order, a.id],
      };
    }
    case 'ADD_MANY': {
      const nextById = { ...state.byId };
      const nextOrder = [...state.order];
      for (const a of action.payload) {
        if (!nextById[a.id]) {
          nextById[a.id] = a;
          nextOrder.push(a.id);
        }
      }
      return { byId: nextById, order: nextOrder };
    }
    case 'UPSERT': {
      const a = action.payload;
      const exists = Boolean(state.byId[a.id]);
      return {
        byId: { ...state.byId, [a.id]: { ...(state.byId[a.id] ?? {}), ...a } },
        order: exists ? [...state.order] : [...state.order, a.id],
      };
    }
    case 'PATCH': {
      const { id, changes } = action.payload;
      const prev = state.byId[id];
      if (!prev) return state;
      return {
        byId: { ...state.byId, [id]: { ...prev, ...changes, updatedAt: changes.updatedAt ?? prev.updatedAt } },
        order: [...state.order],
      };
    }
    case 'REMOVE': {
      const { id } = action.payload;
      if (!state.byId[id]) return state;
      const { [id]: _, ...rest } = state.byId;
      return {
        byId: rest,
        order: state.order.filter(x => x !== id),
      };
    }
    case 'CLEAR':
      return initialState;
    case 'REPLACE_ALL': {
      const byId: Record<string, Artifact<any>> = {};
      const order: string[] = [];
      for (const a of action.payload) {
        byId[a.id] = a;
        order.push(a.id);
      }
      return { byId, order };
    }
    default:
      return state;
  }
}

export type ArtifactContextType = {
  artifacts: Artifact<any>[];
  byId: Record<string, Artifact<any>>;
  addArtifact: (a: Artifact<any>) => void;
  addMany: (arr: Artifact<any>[]) => void;
  upsertArtifact: (a: Artifact<any>) => void;
  patchArtifact: (id: string, changes: Partial<Artifact<any>>) => void;
  removeArtifact: (id: string) => void;
  clearArtifacts: () => void;
  replaceAll: (arr: Artifact<any>[]) => void;
  getById: (id: string) => Artifact<any> | undefined;
};

const ArtifactContext = createContext<ArtifactContextType | undefined>(undefined);

export function ArtifactProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const artifacts = useMemo(
    () => state.order.map(id => state.byId[id]),
    [state.byId, state.order]
  );

  const addArtifact = useCallback((a: Artifact<any>) => dispatch({ type: 'ADD', payload: a }), []);
  const addMany = useCallback((arr: Artifact<any>[]) => dispatch({ type: 'ADD_MANY', payload: arr }), []);
  const upsertArtifact = useCallback((a: Artifact<any>) => dispatch({ type: 'UPSERT', payload: a }), []);
  const patchArtifact = useCallback((id: string, changes: Partial<Artifact<any>>) => dispatch({ type: 'PATCH', payload: { id, changes } }), []);
  const removeArtifact = useCallback((id: string) => dispatch({ type: 'REMOVE', payload: { id } }), []);
  const clearArtifacts = useCallback(() => dispatch({ type: 'CLEAR' }), []);
  const replaceAll = useCallback((arr: Artifact<any>[]) => dispatch({ type: 'REPLACE_ALL', payload: arr }), []);
  const getById = useCallback((id: string) => state.byId[id], [state.byId]);

  const value = useMemo<ArtifactContextType>(() => ({
    artifacts,
    byId: state.byId,
    addArtifact,
    addMany,
    upsertArtifact,
    patchArtifact,
    removeArtifact,
    clearArtifacts,
    replaceAll,
    getById,
  }), [artifacts, state.byId, addArtifact, addMany, upsertArtifact, patchArtifact, removeArtifact, clearArtifacts, replaceAll, getById]);

  return <ArtifactContext.Provider value={value}>{children}</ArtifactContext.Provider>;
}

export function useArtifactContext() {
  const ctx = useContext(ArtifactContext);
  if (!ctx) throw new Error('ArtifactContext is not provided');
  return ctx;
}