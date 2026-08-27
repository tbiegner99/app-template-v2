import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => mockNavigate,
}));

vi.mock('supertokens-auth-react/recipe/session', () => ({
  signOut: vi.fn().mockResolvedValue(undefined),
}));

import Logout from './Logout';
import { signOut } from 'supertokens-auth-react/recipe/session';
const mockSignOut = vi.mocked(signOut);

describe('Logout', () => {
  it('calls signOut and navigates to /auth', async () => {
    render(<MemoryRouter><Logout /></MemoryRouter>);
    await vi.waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/auth', { replace: true });
    });
  });

  it('renders null', () => {
    const { container } = render(<MemoryRouter><Logout /></MemoryRouter>);
    expect(container.firstChild).toBeNull();
  });
});
