import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import {
  Chip,
  PrimaryChip,
  SecondaryChip,
  SuccessChip,
  DestructiveChip,
  WarningChip,
  InfoChip,
} from './Chip';

describe('Chip variants', () => {
  it('renders Chip with label', () => {
    render(<Chip label="Status" />);
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders PrimaryChip', () => {
    render(<PrimaryChip label="Primary" />);
    expect(screen.getByText('Primary')).toBeInTheDocument();
  });

  it('renders SecondaryChip', () => {
    render(<SecondaryChip label="Secondary" />);
    expect(screen.getByText('Secondary')).toBeInTheDocument();
  });

  it('renders SuccessChip', () => {
    render(<SuccessChip label="Active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders DestructiveChip', () => {
    render(<DestructiveChip label="Danger" />);
    expect(screen.getByText('Danger')).toBeInTheDocument();
  });

  it('renders WarningChip', () => {
    render(<WarningChip label="Warning" />);
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });

  it('renders InfoChip', () => {
    render(<InfoChip label="Info" />);
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('renders outlined variant', () => {
    render(<Chip label="Outlined" variant="outlined" />);
    expect(screen.getByText('Outlined')).toBeInTheDocument();
  });
});
