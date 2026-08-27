import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { TableParams, FilterParam, SortDir } from '@__SLUG__/components';

export function useServerTableParams(defaultPageSize = 25): [TableParams, (params: TableParams) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const params: TableParams = useMemo(() => {
    const filtersRaw = searchParams.get('filters');
    let filters: FilterParam[] = [];
    try {
      if (filtersRaw) filters = JSON.parse(filtersRaw);
    } catch {
      filters = [];
    }
    return {
      page: parseInt(searchParams.get('page') ?? '0', 10),
      pageSize: parseInt(searchParams.get('pageSize') ?? String(defaultPageSize), 10),
      sort: searchParams.get('sort') ?? '',
      sortDir: (searchParams.get('sortDir') ?? 'asc') as SortDir,
      filters,
    };
  }, [searchParams, defaultPageSize]);

  const setParams = useCallback(
    (next: TableParams) => {
      setSearchParams((prev) => {
        const updated = new URLSearchParams(prev);
        updated.set('page', String(next.page));
        updated.set('pageSize', String(next.pageSize));
        if (next.sort) updated.set('sort', next.sort);
        else updated.delete('sort');
        updated.set('sortDir', next.sortDir);
        if (next.filters.length > 0) updated.set('filters', JSON.stringify(next.filters));
        else updated.delete('filters');
        return updated;
      }, { replace: true });
    },
    [setSearchParams],
  );

  return [params, setParams];
}
