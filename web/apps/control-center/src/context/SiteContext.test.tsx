import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SiteContextProvider, useCurrentSite } from './SiteContext';

const Consumer = () => {
  const { site } = useCurrentSite();
  return <span data-testid="state">{site.isLoaded() ? 'loaded' : site.isLoading() ? 'loading' : 'unloaded'}</span>;
};

describe('SiteContextProvider', () => {
  it('sets loaded(null) when no siteId in params', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<SiteContextProvider><Consumer /></SiteContextProvider>} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('loaded'));
  });

  it('loads site data when siteId is present', async () => {
    render(
      <MemoryRouter initialEntries={['/sites/xyz']}>
        <Routes>
          <Route path="/sites/:siteId" element={<SiteContextProvider><Consumer /></SiteContextProvider>} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('loaded'), { timeout: 2000 });
  });
});

describe('useCurrentSite', () => {
  it('returns default unloaded state outside provider', () => {
    const Consumer2 = () => {
      const { site } = useCurrentSite();
      return <span data-testid="state">{site.isUnloaded() ? 'unloaded' : 'other'}</span>;
    };
    render(<MemoryRouter><Consumer2 /></MemoryRouter>);
    expect(screen.getByTestId('state')).toHaveTextContent('unloaded');
  });
});
