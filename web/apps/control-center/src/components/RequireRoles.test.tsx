import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { RequireRoles } from './RequireRoles';
import { LoadingState } from '@__SLUG__/components';
import * as UserContext from '../context/UserContext';

type Role = { name: string; contextId?: string };

function mockUser(roles: (Role | string)[], loaded = true) {
  vi.spyOn(UserContext, 'useUser').mockReturnValue({
    user: loaded ? LoadingState.loaded({ id: '1', email: 'a@b.com', displayName: 'Alice', isDisabled: false, roles: [] }) : LoadingState.loading(),
    roles: loaded ? LoadingState.loaded(roles as Role[]) : LoadingState.loading(),
  });
}

describe('RequireRoles', () => {
  it('renders null when user not loaded', () => {
    mockUser([], false);
    const { container } = render(<RequireRoles requiredRoles={['admin']}><span>secret</span></RequireRoles>);
    expect(container.firstChild).toBeNull();
  });

  it('renders children when user has matching string role', () => {
    mockUser(['admin']);
    render(<RequireRoles requiredRoles={['admin']}><span>protected</span></RequireRoles>);
    expect(screen.getByText('protected')).toBeInTheDocument();
  });

  it('renders accessDeniedComponent when user lacks role', () => {
    mockUser(['viewer']);
    render(
      <RequireRoles requiredRoles={['admin']} accessDeniedComponent={<span>denied</span>}>
        <span>protected</span>
      </RequireRoles>
    );
    expect(screen.getByText('denied')).toBeInTheDocument();
    expect(screen.queryByText('protected')).not.toBeInTheDocument();
  });

  it('matches object roles by name and contextId', () => {
    mockUser([{ name: 'admin', contextId: 'site-1' }]);
    render(
      <RequireRoles requiredRoles={[{ name: 'admin', contextId: 'site-1' }]}>
        <span>ok</span>
      </RequireRoles>
    );
    expect(screen.getByText('ok')).toBeInTheDocument();
  });

  it('denies when contextId does not match', () => {
    mockUser([{ name: 'admin', contextId: 'site-1' }]);
    render(
      <RequireRoles requiredRoles={[{ name: 'admin', contextId: 'site-2' }]} accessDeniedComponent={<span>denied</span>}>
        <span>ok</span>
      </RequireRoles>
    );
    expect(screen.getByText('denied')).toBeInTheDocument();
  });

  it('matches object role against string required role', () => {
    mockUser([{ name: 'editor' }]);
    render(<RequireRoles requiredRoles={['editor']}><span>allowed</span></RequireRoles>);
    expect(screen.getByText('allowed')).toBeInTheDocument();
  });

  it('matches string role against object required role', () => {
    mockUser(['manager']);
    render(<RequireRoles requiredRoles={[{ name: 'manager' }]}><span>allowed</span></RequireRoles>);
    expect(screen.getByText('allowed')).toBeInTheDocument();
  });
});
