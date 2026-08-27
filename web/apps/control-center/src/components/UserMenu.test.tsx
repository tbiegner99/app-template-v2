import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { UserMenu } from './UserMenu';
import { LoadingState } from '@__SLUG__/components';
import * as UserContext from '../context/UserContext';

vi.mock('supertokens-auth-react/recipe/session', () => ({
  signOut: vi.fn().mockResolvedValue(undefined),
}));

import { signOut } from 'supertokens-auth-react/recipe/session';
const mockSignOut = vi.mocked(signOut);

beforeEach(() => vi.clearAllMocks());

describe('UserMenu', () => {
  it('renders nothing when user is not loaded', () => {
    vi.spyOn(UserContext, 'useUser').mockReturnValue({
      user: LoadingState.loading(),
      roles: LoadingState.loading(),
    });
    const { container } = render(<MemoryRouter><UserMenu /></MemoryRouter>);
    expect(container.firstChild).toBeNull();
  });

  it('renders user menu when user is loaded', () => {
    vi.spyOn(UserContext, 'useUser').mockReturnValue({
      user: LoadingState.loaded({ id: 'u1', email: 'a@b.com', displayName: 'Alice', isDisabled: false, roles: [] }),
      roles: LoadingState.loaded([]),
    });
    render(<MemoryRouter><UserMenu /></MemoryRouter>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls signOut when logout button is clicked', async () => {
    vi.spyOn(UserContext, 'useUser').mockReturnValue({
      user: LoadingState.loaded({ id: 'u1', email: 'a@b.com', displayName: 'Alice', isDisabled: false, roles: [] }),
      roles: LoadingState.loaded([]),
    });
    const { container } = render(<MemoryRouter><UserMenu /></MemoryRouter>);
    // Open the dropdown menu
    fireEvent.click(container.querySelector('[data-id="user-menu-button"]')!);
    // Click the logout button in the dropdown
    await waitFor(() => expect(document.querySelector('[data-id="logout-button"]')).not.toBeNull());
    fireEvent.click(document.querySelector('[data-id="logout-button"]')!);
    await waitFor(() => expect(mockSignOut).toHaveBeenCalled());
  });
});
