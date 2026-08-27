import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ClientContextProvider, useCurrentClient } from './ClientContext';

const Consumer = () => {
  const { client } = useCurrentClient();
  return <span data-testid="state">{client.isLoaded() ? 'loaded' : client.isLoading() ? 'loading' : 'unloaded'}</span>;
};

const withRouter = (path: string, routePattern: string) => (
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path={routePattern} element={<ClientContextProvider><Consumer /></ClientContextProvider>} />
    </Routes>
  </MemoryRouter>
);

describe('ClientContextProvider', () => {
  it('sets loaded(null) when no clientId in params', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<ClientContextProvider><Consumer /></ClientContextProvider>} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('loaded'));
  });

  it('loads client data when clientId is present', async () => {
    render(withRouter('/clients/abc', '/clients/:clientId'));
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('loaded'), { timeout: 2000 });
  });
});

describe('useCurrentClient', () => {
  it('returns default unloaded state outside provider', () => {
    const Consumer2 = () => {
      const { client } = useCurrentClient();
      return <span data-testid="state">{client.isUnloaded() ? 'unloaded' : 'other'}</span>;
    };
    render(<MemoryRouter><Consumer2 /></MemoryRouter>);
    expect(screen.getByTestId('state')).toHaveTextContent('unloaded');
  });
});
