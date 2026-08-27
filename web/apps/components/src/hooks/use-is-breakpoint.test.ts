import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIsBreakpoint } from './use-is-breakpoint';

describe('useIsBreakpoint', () => {
  const mockMatchMedia = (matches: boolean) => {
    const listeners: Array<(e: MediaQueryListEvent) => void> = [];
    const mql = {
      matches,
      addEventListener: vi.fn((_event: string, cb: (e: MediaQueryListEvent) => void) => {
        listeners.push(cb);
      }),
      removeEventListener: vi.fn(),
    };
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue(mql),
    });
    return { mql, listeners };
  };

  it('returns true when max-width matches', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useIsBreakpoint('max', 768));
    expect(result.current).toBe(true);
  });

  it('returns false when max-width does not match', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useIsBreakpoint('max', 768));
    expect(result.current).toBe(false);
  });

  it('returns true when min-width matches', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useIsBreakpoint('min', 1024));
    expect(result.current).toBe(true);
  });

  it('uses default values (max, 768)', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useIsBreakpoint());
    expect(result.current).toBe(false);
  });

  it('updates state when media query change event fires', () => {
    const { listeners } = mockMatchMedia(false);
    const { result } = renderHook(() => useIsBreakpoint('max', 768));
    expect(result.current).toBe(false);
    act(() => {
      listeners.forEach(cb => cb({ matches: true } as MediaQueryListEvent));
    });
    expect(result.current).toBe(true);
  });
});
