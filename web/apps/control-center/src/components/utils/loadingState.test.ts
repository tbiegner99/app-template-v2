import { describe, it, expect } from 'vitest';
import { LoadingState, LoadingStateEnum } from './loadingState';

describe('LoadingState', () => {
  it('creates unloaded state', () => {
    const s = LoadingState.unloaded<string>();
    expect(s.state).toBe(LoadingStateEnum.Unloaded);
    expect(s.data).toBeNull();
    expect(s.isUnloaded()).toBe(true);
    expect(s.isLoading()).toBe(false);
    expect(s.isLoaded()).toBe(false);
    expect(s.isError()).toBe(false);
  });

  it('creates loading state without value', () => {
    const s = LoadingState.loading<string>();
    expect(s.state).toBe(LoadingStateEnum.Loading);
    expect(s.isLoading()).toBe(true);
  });

  it('creates loading state with value', () => {
    const s = LoadingState.loading('partial');
    expect(s.data).toBe('partial');
    expect(s.hasValue()).toBe(true);
  });

  it('creates loaded state', () => {
    const s = LoadingState.loaded('done');
    expect(s.state).toBe(LoadingStateEnum.Loaded);
    expect(s.isLoaded()).toBe(true);
    expect(s.value).toBe('done');
    expect(s.hasValue()).toBe(true);
  });

  it('creates error state', () => {
    const err = new Error('oops');
    const s = LoadingState.error<string>(err);
    expect(s.state).toBe(LoadingStateEnum.Error);
    expect(s.isError()).toBe(true);
    expect(s.error).toBe(err);
  });

  it('throws when accessing value on null data', () => {
    const s = LoadingState.unloaded<string>();
    expect(() => s.value).toThrow();
  });

  it('hasValue returns false when data is null', () => {
    const s = LoadingState.unloaded<string>();
    expect(s.hasValue()).toBe(false);
  });
});
