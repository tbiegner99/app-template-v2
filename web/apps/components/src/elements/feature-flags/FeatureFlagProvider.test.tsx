import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { FeatureFlagProvider, useFeatureFlags } from './FeatureFlagProvider';
import { FeatureFlagGate } from './FeatureFlagGate';

const TestConsumer: React.FC<{ flag: string }> = ({ flag }) => {
  const { isEnabled, setFlag } = useFeatureFlags();
  return (
    <div>
      <span data-testid="status">{isEnabled(flag) ? 'enabled' : 'disabled'}</span>
      <button onClick={() => setFlag(flag, true)}>enable</button>
      <button onClick={() => setFlag(flag, false)}>disable</button>
    </div>
  );
};

describe('FeatureFlagProvider', () => {
  it('returns false for unknown flags', () => {
    render(
      <FeatureFlagProvider>
        <TestConsumer flag="new-feature" />
      </FeatureFlagProvider>
    );
    expect(screen.getByTestId('status')).toHaveTextContent('disabled');
  });

  it('returns true for enabled initial flag', () => {
    render(
      <FeatureFlagProvider flags={{ 'my-flag': true }}>
        <TestConsumer flag="my-flag" />
      </FeatureFlagProvider>
    );
    expect(screen.getByTestId('status')).toHaveTextContent('enabled');
  });

  it('can update flags via setFlag', () => {
    render(
      <FeatureFlagProvider>
        <TestConsumer flag="togglable" />
      </FeatureFlagProvider>
    );
    expect(screen.getByTestId('status')).toHaveTextContent('disabled');
    act(() => screen.getByText('enable').click());
    expect(screen.getByTestId('status')).toHaveTextContent('enabled');
    act(() => screen.getByText('disable').click());
    expect(screen.getByTestId('status')).toHaveTextContent('disabled');
  });

  it('throws when useFeatureFlags is used outside provider', () => {
    const consoleError = console.error;
    console.error = () => {};
    expect(() => render(<TestConsumer flag="x" />)).toThrow();
    console.error = consoleError;
  });
});

describe('FeatureFlagGate', () => {
  it('renders children when flag is enabled', () => {
    render(
      <FeatureFlagProvider flags={{ 'show-it': true }}>
        <FeatureFlagGate flag="show-it"><span>visible</span></FeatureFlagGate>
      </FeatureFlagProvider>
    );
    expect(screen.getByText('visible')).toBeInTheDocument();
  });

  it('renders fallback when flag is disabled', () => {
    render(
      <FeatureFlagProvider>
        <FeatureFlagGate flag="hidden" fallback={<span>fallback</span>}><span>secret</span></FeatureFlagGate>
      </FeatureFlagProvider>
    );
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
    expect(screen.getByText('fallback')).toBeInTheDocument();
  });

  it('renders nothing by default when flag is disabled', () => {
    render(
      <FeatureFlagProvider>
        <FeatureFlagGate flag="hidden"><span>secret</span></FeatureFlagGate>
      </FeatureFlagProvider>
    );
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
  });
});
