import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  DataGrid,
  GridColDef,
  GridRowsProp,
  GridSortModel,
  GridToolbar,
  GridPaginationModel,
} from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ErrorIcon } from '../icons/Icons';

export type { GridColDef as TableColumn };

export type SortDir = 'asc' | 'desc';

export interface FilterParam {
  field: string;
  op: 'eq' | 'contains' | 'gt' | 'gte' | 'lt' | 'lte';
  value: string;
}

export interface TableParams {
  page: number;
  pageSize: number;
  sort: string;
  sortDir: SortDir;
  filters: FilterParam[];
}

export interface TableProps {
  rows: GridRowsProp;
  columns: GridColDef[];
  loading?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  toolbar?: boolean;
  onRowClick?: (row: any) => void;
  height?: number | string;
  getRowId?: (row: any) => string | number;
  errorMessage?: string;
  // Server-side props
  rowCount?: number;
  onParamsChange?: (params: TableParams) => void;
}

export const Table: React.FC<TableProps> = ({
  rows,
  columns,
  loading = false,
  pageSize: initialPageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],
  toolbar = true,
  onRowClick,
  height = 600,
  getRowId,
  errorMessage,
  rowCount,
  onParamsChange,
}) => {
  const serverSide = onParamsChange !== undefined;

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: initialPageSize,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [quickFilterValue, setQuickFilterValue] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildParams = useCallback(
    (
      pagination: GridPaginationModel,
      sort: GridSortModel,
      search: string,
    ): TableParams => {
      const filters: FilterParam[] = search
        ? [{ field: 'displayName', op: 'contains', value: search }]
        : [];
      const sortField = sort[0]?.field ?? '';
      const sortDir: SortDir = (sort[0]?.sort as SortDir) ?? 'asc';
      return {
        page: pagination.page,
        pageSize: pagination.pageSize,
        sort: sortField,
        sortDir,
        filters,
      };
    },
    [],
  );

  // Notify parent when pagination or sort changes (immediate)
  useEffect(() => {
    if (!serverSide) return;
    onParamsChange!(buildParams(paginationModel, sortModel, quickFilterValue));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel, sortModel]);

  const handleQuickFilterChange = useCallback(
    (value: string) => {
      setQuickFilterValue(value);
      if (!serverSide) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
        onParamsChange!(buildParams({ ...paginationModel, page: 0 }, sortModel, value));
      }, 300);
    },
    [serverSide, onParamsChange, buildParams, paginationModel, sortModel],
  );

  const handleSortChange = useCallback(
    (model: GridSortModel) => {
      setSortModel(model);
      if (serverSide) {
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
      }
    },
    [serverSide],
  );

  const noRowsOverlay = errorMessage
    ? () => (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={1} height="100%">
          <ErrorIcon color="error" fontSize="large" />
          <Typography variant="body2" color="error">{errorMessage}</Typography>
        </Box>
      )
    : undefined;

  const serverSideProps = serverSide
    ? {
        paginationMode: 'server' as const,
        sortingMode: 'server' as const,
        filterMode: 'server' as const,
        rowCount: rowCount ?? 0,
        paginationModel,
        onPaginationModelChange: setPaginationModel,
        sortModel,
        onSortModelChange: handleSortChange,
      }
    : {
        initialState: { pagination: { paginationModel: { pageSize: initialPageSize } } },
      };

  return (
    <div style={{ height, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        getRowId={getRowId}
        pageSizeOptions={pageSizeOptions}
        {...serverSideProps}
        slots={{
          ...(toolbar ? { toolbar: GridToolbar } : {}),
          ...(noRowsOverlay ? { noRowsOverlay } : {}),
        }}
        slotProps={
          toolbar
            ? {
                toolbar: {
                  showQuickFilter: true,
                  ...(serverSide
                    ? {
                        quickFilterProps: {
                          value: quickFilterValue,
                          onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                            handleQuickFilterChange(e.target.value),
                        },
                      }
                    : {}),
                },
              }
            : {}
        }
        onRowClick={onRowClick ? (params) => onRowClick(params.row) : undefined}
        disableRowSelectionOnClick
        sx={(theme) => ({
          border: 'none',
          '& .MuiDataGrid-columnHeaders, & .MuiDataGrid-columnHeader, & .MuiDataGrid-filler--borderBottom': {
            backgroundColor: theme.palette.primary.main,
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            color: theme.palette.primary.contrastText,
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          },
          '& .MuiDataGrid-columnSeparator': { color: 'rgba(255,255,255,0.3)' },
          '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': { outline: 'none' },
          '& .MuiDataGrid-sortIcon, & .MuiDataGrid-menuIconButton': { color: 'rgba(255,255,255,0.8)' },
          '& .MuiDataGrid-iconButtonContainer .MuiIconButton-root': {
            backgroundColor: 'transparent',
            color: 'rgba(255,255,255,0.8)',
          },
          '& .MuiDataGrid-row:hover': { backgroundColor: '#f8fafc', cursor: onRowClick ? 'pointer' : 'default' },
          '& .MuiDataGrid-row:nth-of-type(even)': { backgroundColor: '#f8fafc' },
          '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' },
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none' },
          '& .MuiDataGrid-toolbarContainer': {
            backgroundColor: theme.palette.primary.main,
            padding: '4px 8px',
          },
          '& .MuiDataGrid-toolbarContainer .MuiButton-root': {
            color: theme.palette.primary.contrastText,
          },
          '& .MuiDataGrid-toolbarContainer .MuiInputBase-root': {
            color: theme.palette.primary.contrastText,
          },
          '& .MuiDataGrid-toolbarContainer .MuiInputBase-root::before': {
            borderColor: 'rgba(255,255,255,0.4)',
          },
          '& .MuiDataGrid-toolbarContainer .MuiInputBase-root:hover::before': {
            borderColor: 'rgba(255,255,255,0.8)',
          },
          '& .MuiDataGrid-toolbarContainer .MuiSvgIcon-root': {
            color: theme.palette.primary.contrastText,
          },
        })}
      />
    </div>
  );
};
