import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { useServerTableParams } from './useServerTableParams';

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(MemoryRouter, { initialEntries: ['/'] }, children);

describe('useServerTableParams', () => {
  it('returns default params with no query string', () => {
    const { result } = renderHook(() => useServerTableParams(), { wrapper });
    const [params] = result.current;
    expect(params.page).toBe(0);
    expect(params.pageSize).toBe(25);
    expect(params.sort).toBe('');
    expect(params.sortDir).toBe('asc');
    expect(params.filters).toEqual([]);
  });

  it('respects custom default page size', () => {
    const { result } = renderHook(() => useServerTableParams(10), { wrapper });
    const [params] = result.current;
    expect(params.pageSize).toBe(10);
  });

  it('updates params via setParams', () => {
    const { result } = renderHook(() => useServerTableParams(), { wrapper });
    act(() => {
      const [, setParams] = result.current;
      setParams({ page: 2, pageSize: 10, sort: 'name', sortDir: 'desc', filters: [] });
    });
    const [params] = result.current;
    expect(params.page).toBe(2);
    expect(params.pageSize).toBe(10);
    expect(params.sort).toBe('name');
    expect(params.sortDir).toBe('desc');
  });

  it('stores and reads filters', () => {
    const { result } = renderHook(() => useServerTableParams(), { wrapper });
    const filter = { field: 'email', value: 'test', operator: 'contains' as const };
    act(() => {
      const [, setParams] = result.current;
      setParams({ page: 0, pageSize: 25, sort: '', sortDir: 'asc', filters: [filter] });
    });
    const [params] = result.current;
    expect(params.filters).toHaveLength(1);
    expect(params.filters[0].field).toBe('email');
  });

  it('clears sort when empty string', () => {
    const { result } = renderHook(() => useServerTableParams(), { wrapper });
    act(() => {
      const [, setParams] = result.current;
      setParams({ page: 0, pageSize: 25, sort: '', sortDir: 'asc', filters: [] });
    });
    const [params] = result.current;
    expect(params.sort).toBe('');
  });
});
