import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserContextProvider, useUser } from './UserContext';
import { LoadingState } from '@__SLUG__/components';

vi.mock('supertokens-auth-react/recipe/session', () => ({
  useSessionContext: vi.fn(),
}));

vi.mock('../domains/auth/datasource', () => ({
  fetchMe: vi.fn(),
}));

import { useSessionContext } from 'supertokens-auth-react/recipe/session';
import { fetchMe } from '../domains/auth/datasource';
const mockUseSessionContext = vi.mocked(useSessionContext);
const mockFetchMe = vi.mocked(fetchMe);

beforeEach(() => vi.clearAllMocks());

const Consumer = () => {
  const { user, roles } = useUser();
  return (
    <div>
      <span data-testid="user-unloaded">{String(user.isUnloaded())}</span>
      <span data-testid="user-loaded">{String(user.isLoaded())}</span>
      <span data-testid="user-error">{String(user.isError())}</span>
      <span data-testid="roles-loaded">{String(roles.isLoaded())}</span>
    </div>
  );
};

describe('UserContextProvider', () => {
  it('starts unloaded while session is loading', () => {
    mockUseSessionContext.mockReturnValue({ loading: true } as ReturnType<typeof useSessionContext>);
    render(<UserContextProvider><Consumer /></UserContextProvider>);
    expect(screen.getByTestId('user-unloaded')).toHaveTextContent('true');
  });

  it('stays unloaded when no userId in session', async () => {
    mockUseSessionContext.mockReturnValue({ loading: false } as ReturnType<typeof useSessionContext>);
    render(<UserContextProvider><Consumer /></UserContextProvider>);
    await waitFor(() => {
      expect(screen.getByTestId('user-unloaded')).toHaveTextContent('true');
    });
  });

  it('loads user and roles when session has userId', async () => {
    mockUseSessionContext.mockReturnValue({ loading: false, userId: 'u1' } as ReturnType<typeof useSessionContext>);
    mockFetchMe.mockResolvedValueOnce({
      user: { id: 'u1', email: 'a@b.com', displayName: 'Alice', isDisabled: false, roles: [] },
      roles: [],
    });
    render(<UserContextProvider><Consumer /></UserContextProvider>);
    await waitFor(() => {
      expect(screen.getByTestId('user-loaded')).toHaveTextContent('true');
    });
    expect(screen.getByTestId('roles-loaded')).toHaveTextContent('true');
  });

  it('sets error state when fetchMe throws', async () => {
    mockUseSessionContext.mockReturnValue({ loading: false, userId: 'u1' } as ReturnType<typeof useSessionContext>);
    mockFetchMe.mockRejectedValueOnce(new Error('network error'));
    render(<UserContextProvider><Consumer /></UserContextProvider>);
    await waitFor(() => {
      expect(screen.getByTestId('user-error')).toHaveTextContent('true');
    });
  });
});

describe('useUser', () => {
  it('throws when used outside UserContextProvider', () => {
    const Bad = () => { useUser(); return null; };
    expect(() => render(<Bad />)).toThrow('useUser must be used within a UserContextProvider');
  });
});
