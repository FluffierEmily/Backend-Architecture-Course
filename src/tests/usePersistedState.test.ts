import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
  clearPersistedUiState,
  flushUiState,
  readUiState,
  usePersistedState,
  writeUiState,
} from '../hooks/usePersistedState';

describe('usePersistedState caching and batching', () => {
  beforeEach(() => {
    clearPersistedUiState();
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('coalesces multiple synchronous writes into a single localStorage.setItem call', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    writeUiState('a', 1);
    writeUiState('b', 2);
    writeUiState('c', 3);

    // Reads immediately see in-memory pending values before microtask flush
    expect(readUiState('a', 0)).toBe(1);
    expect(readUiState('b', 0)).toBe(2);
    expect(readUiState('c', 0)).toBe(3);

    // Flush microtask queue
    await Promise.resolve();

    expect(setItemSpy).toHaveBeenCalledTimes(1);
    const stored = JSON.parse(
      window.localStorage.getItem('backend-arch-course-ui-state-v1') ?? '{}'
    );
    expect(stored).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('skips redundant JSON.parse on repeated reads and skips no-op writes', () => {
    writeUiState('step', 2);
    flushUiState();

    const parseSpy = vi.spyOn(JSON, 'parse');
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    expect(readUiState('step', 0)).toBe(2);
    expect(readUiState('step', 0)).toBe(2);
    expect(parseSpy).not.toHaveBeenCalled();

    writeUiState('step', 2);
    flushUiState();
    expect(setItemSpy).not.toHaveBeenCalled();
  });

  it('batches rapid hook updates cleanly without double-writing', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    const { result } = renderHook(() => {
      const [a, setA] = usePersistedState('hook.a', 0);
      const [b, setB] = usePersistedState('hook.b', 'init');
      return { a, setA, b, setB };
    });

    act(() => {
      result.current.setA((prev) => prev + 1);
      result.current.setA((prev) => prev + 1);
      result.current.setB('updated');
    });

    expect(result.current.a).toBe(2);
    expect(result.current.b).toBe('updated');
    expect(setItemSpy).toHaveBeenCalledTimes(0);

    await Promise.resolve();
    expect(setItemSpy).toHaveBeenCalledTimes(1);
  });
});
