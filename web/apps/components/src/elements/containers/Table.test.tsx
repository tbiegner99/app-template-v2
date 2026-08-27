import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { Table } from './Table';

const columns = [
  { field: 'id', headerName: 'ID' },
  { field: 'name', headerName: 'Name' },
];

const rows = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
];

describe('Table', () => {
  it('renders without error for empty rows', () => {
    render(<Table rows={[]} columns={columns} />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('renders with rows', () => {
    render(<Table rows={rows} columns={columns} getRowId={(r) => r.id} />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('renders error message when provided', () => {
    render(<Table rows={[]} columns={columns} errorMessage="Failed to load" />);
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(<Table rows={[]} columns={columns} loading />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('renders with toolbar', () => {
    render(<Table rows={rows} columns={columns} getRowId={(r) => r.id} toolbar />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('accepts onParamsChange callback', () => {
    const onParamsChange = vi.fn();
    render(<Table rows={rows} columns={columns} getRowId={(r) => r.id} onParamsChange={onParamsChange} rowCount={2} />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });
});
