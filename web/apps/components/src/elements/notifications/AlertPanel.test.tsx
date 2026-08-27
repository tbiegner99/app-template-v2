import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { AlertPanel } from './AlertPanel';

const alerts = [
  { id: '1', title: 'High Temp', body: 'Temperature exceeded limit', route: '/alerts/1' },
  { id: '2', title: 'Low Pressure', body: 'Pressure below threshold' },
];

describe('AlertPanel', () => {
  it('shows "No active alerts" when empty', () => {
    render(<AlertPanel alerts={[]} />);
    expect(screen.getByText('No active alerts')).toBeInTheDocument();
  });

  it('renders alert titles and bodies', () => {
    render(<AlertPanel alerts={alerts} />);
    expect(screen.getByText('High Temp')).toBeInTheDocument();
    expect(screen.getByText('Temperature exceeded limit')).toBeInTheDocument();
    expect(screen.getByText('Low Pressure')).toBeInTheDocument();
  });

  it('shows "Dismiss all" button when onDismissAll provided and alerts exist', () => {
    render(<AlertPanel alerts={alerts} onDismissAll={vi.fn()} />);
    expect(screen.getByText('Dismiss all')).toBeInTheDocument();
  });

  it('hides "Dismiss all" when no alerts', () => {
    render(<AlertPanel alerts={[]} onDismissAll={vi.fn()} />);
    expect(screen.queryByText('Dismiss all')).not.toBeInTheDocument();
  });

  it('calls onDismissAll when clicked', () => {
    const onDismissAll = vi.fn();
    render(<AlertPanel alerts={alerts} onDismissAll={onDismissAll} />);
    screen.getByText('Dismiss all').click();
    expect(onDismissAll).toHaveBeenCalled();
  });

  it('calls onDismiss with alert id', () => {
    const onDismiss = vi.fn();
    render(<AlertPanel alerts={alerts} onDismiss={onDismiss} />);
    const dismissBtns = screen.getAllByLabelText('Dismiss');
    dismissBtns[0].click();
    expect(onDismiss).toHaveBeenCalledWith('1');
  });

  it('calls onNavigate when clickable alert is clicked', () => {
    const onNavigate = vi.fn();
    render(<AlertPanel alerts={alerts} onNavigate={onNavigate} />);
    screen.getByText('High Temp').click();
    expect(onNavigate).toHaveBeenCalledWith('/alerts/1');
  });

  it('does not call onNavigate for alerts without route', () => {
    const onNavigate = vi.fn();
    render(<AlertPanel alerts={alerts} onNavigate={onNavigate} />);
    screen.getByText('Low Pressure').click();
    expect(onNavigate).not.toHaveBeenCalled();
  });
});
