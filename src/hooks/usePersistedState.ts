import { useCallback, useRef, useState, type Dispatch, type SetStateAction } from 'react';

const UI_STATE_STORAGE_KEY = 'backend-arch-course-ui-state-v1';

let uiStateCache: Record<string, unknown> | null = null;
let lastPersistedRaw: string | null | undefined = undefined;
let flushScheduled = false;
let lifecycleListenersBound = false;

function scheduleMicrotask(cb: () => void): void {
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(cb);
  } else {
    Promise.resolve().then(cb);
  }
}

export function flushUiState(): void {
  if (!flushScheduled || uiStateCache === null) return;
  flushScheduled = false;
  try {
    const serialized = JSON.stringify(uiStateCache);
    window.localStorage.setItem(UI_STATE_STORAGE_KEY, serialized);
    lastPersistedRaw = serialized;
  } catch {
    // Ignore storage quota or private-mode errors
  }
}

function bindLifecycleFlush(): void {
  if (lifecycleListenersBound || typeof window === 'undefined') return;
  lifecycleListenersBound = true;
  window.addEventListener('pagehide', flushUiState);
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        flushUiState();
      }
    });
  }
}

function readAllUiState(): Record<string, unknown> {
  // Pending writes in memory are strictly newer than localStorage
  if (flushScheduled && uiStateCache !== null) {
    return uiStateCache;
  }

  try {
    const raw = window.localStorage.getItem(UI_STATE_STORAGE_KEY);
    if (uiStateCache !== null && raw === lastPersistedRaw) {
      return uiStateCache;
    }

    if (!raw) {
      uiStateCache = {};
      lastPersistedRaw = raw;
      return uiStateCache;
    }

    const parsed = JSON.parse(raw);
    uiStateCache =
      parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};
    lastPersistedRaw = raw;
    return uiStateCache;
  } catch {
    uiStateCache = {};
    lastPersistedRaw = null;
    return uiStateCache;
  }
}

export function readUiState<T>(
  key: string,
  defaultValue: T,
  validate?: (value: unknown) => value is T
): T {
  const all = readAllUiState();
  if (!(key in all)) return defaultValue;
  const candidate = all[key];
  if (validate) {
    return validate(candidate) ? candidate : defaultValue;
  }
  return candidate as T;
}

export function writeUiState(key: string, value: unknown): void {
  const all = readAllUiState();
  if (key in all && Object.is(all[key], value)) {
    return;
  }

  all[key] = value;

  if (!flushScheduled) {
    flushScheduled = true;
    bindLifecycleFlush();
    scheduleMicrotask(flushUiState);
  }
}

export function clearPersistedUiState(): void {
  flushScheduled = false;
  uiStateCache = {};
  lastPersistedRaw = null;
  try {
    window.localStorage.removeItem(UI_STATE_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  validate?: (value: unknown) => value is T
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => readUiState(key, defaultValue, validate));
  const stateRef = useRef(state);
  stateRef.current = state;

  const setPersistedState = useCallback<Dispatch<SetStateAction<T>>>(
    (updater) => {
      const prev = stateRef.current;
      const next =
        typeof updater === 'function' ? (updater as (prevState: T) => T)(prev) : updater;
      if (Object.is(prev, next)) return;
      stateRef.current = next;
      setState(next);
      writeUiState(key, next);
    },
    [key]
  );

  return [state, setPersistedState];
}
