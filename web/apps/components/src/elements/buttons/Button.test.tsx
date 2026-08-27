import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import {
  ThemeType,
  PrimaryButton,
  SecondaryButton,
  DestructiveButton,
  SuccessButton,
  WarningButton,
  InfoButton,
  LinkButton,
  IconButton,
  OutlinedPrimaryButton,
} from './Button';

describe('Button variants', () => {
  it('renders PrimaryButton with label', () => {
    render(<PrimaryButton>Click me</PrimaryButton>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('renders SecondaryButton', () => {
    render(<SecondaryButton>Secondary</SecondaryButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders DestructiveButton', () => {
    render(<DestructiveButton>Delete</DestructiveButton>);
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('renders SuccessButton', () => {
    render(<SuccessButton>Save</SuccessButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders WarningButton', () => {
    render(<WarningButton>Warning</WarningButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders InfoButton', () => {
    render(<InfoButton>Info</InfoButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders LinkButton as text variant', () => {
    render(<LinkButton>Link</LinkButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders OutlinedPrimaryButton', () => {
    render(<OutlinedPrimaryButton>Outlined</OutlinedPrimaryButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders IconButton without tooltip', () => {
    render(<IconButton aria-label="icon">X</IconButton>);
    expect(screen.getByRole('button', { name: /icon/i })).toBeInTheDocument();
  });

  it('renders IconButton with tooltip', () => {
    render(<IconButton tooltip="Close" aria-label="close">X</IconButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});

describe('ThemeType enum', () => {
  it('has expected values', () => {
    expect(ThemeType.Primary).toBe('primary');
    expect(ThemeType.Secondary).toBe('secondary');
    expect(ThemeType.Tertiary).toBe('tertiary');
    expect(ThemeType.Success).toBe('success');
    expect(ThemeType.Destructive).toBe('destructive');
    expect(ThemeType.Warning).toBe('warning');
    expect(ThemeType.Info).toBe('info');
  });
});
