import { describe, it, expect } from 'vitest';
import { LoadingState, LoadingStateStatus } from './LoadingState';

describe('LoadingState', () => {
  describe('unloaded()', () => {
    it('has Unloaded status', () => {
      const s = LoadingState.unloaded<string>();
      expect(s.status).toBe(LoadingStateStatus.Unloaded);
      expect(s.isUnloaded()).toBe(true);
      expect(s.isLoading()).toBe(false);
      expect(s.isLoaded()).toBe(false);
      expect(s.isError()).toBe(false);
      expect(s.hasValue()).toBe(false);
    });

    it('throws when accessing value', () => {
      expect(() => LoadingState.unloaded<string>().value).toThrow();
    });
  });

  describe('loading()', () => {
    it('has Loading status with no data', () => {
      const s = LoadingState.loading<number>();
      expect(s.status).toBe(LoadingStateStatus.Loading);
      expect(s.isLoading()).toBe(true);
      expect(s.hasValue()).toBe(false);
    });

    it('has Loading status with optional data', () => {
      const s = LoadingState.loading<number>(42);
      expect(s.isLoading()).toBe(true);
      expect(s.hasValue()).toBe(true);
      expect(s.value).toBe(42);
    });
  });

  describe('loaded()', () => {
    it('has Loaded status and exposes data', () => {
      const s = LoadingState.loaded({ name: 'test' });
      expect(s.status).toBe(LoadingStateStatus.Loaded);
      expect(s.isLoaded()).toBe(true);
      expect(s.hasValue()).toBe(true);
      expect(s.value).toEqual({ name: 'test' });
    });
  });

  describe('error()', () => {
    it('has Error status and exposes error', () => {
      const err = new Error('something went wrong');
      const s = LoadingState.error<string>(err);
      expect(s.status).toBe(LoadingStateStatus.Error);
      expect(s.isError()).toBe(true);
      expect(s.error).toBe(err);
      expect(s.hasValue()).toBe(false);
    });
  });

  describe('notLoaded() deprecated alias', () => {
    it('returns unloaded state', () => {
      const s = LoadingState.notLoaded<string>();
      expect(s.isUnloaded()).toBe(true);
    });
  });

  describe('hasData() deprecated alias', () => {
    it('returns true when data is present', () => {
      const s = LoadingState.loaded(99);
      expect(s.hasData()).toBe(true);
    });
  });
});
