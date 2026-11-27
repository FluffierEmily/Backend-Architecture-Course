import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';

const UI_STATE_STORAGE_KEY = 'backend-arch-course-ui-state-v1';

function readAllUiState(): Record<string, unknown> {
  try {
    const raw = window.localStorage.getItem(UI_STATE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
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
  try {
    const all = readAllUiState();
    all[key] = value;
    window.localStorage.setItem(UI_STATE_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Ignore storage quota or private-mode errors
  }
}

export function clearPersistedUiState(): void {
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

  const setPersistedState = useCallback<Dispatch<SetStateAction<T>>>(
    (updater) => {
      setState((prev) => {
        const next =
          typeof updater === 'function' ? (updater as (prevState: T) => T)(prev) : updater;
        writeUiState(key, next);
        return next;
      });
    },
    [key]
  );

  return [state, setPersistedState];
}
