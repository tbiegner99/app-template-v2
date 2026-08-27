import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { RequireRoles } from './RequireRoles';

describe('RequireRoles', () => {
  it('renders children when user has required string role', () => {
    render(
      <RequireRoles userRoles={['admin']} requiredRoles={['admin']}>
        <span>Protected</span>
      </RequireRoles>
    );
    expect(screen.getByText('Protected')).toBeInTheDocument();
  });

  it('renders accessDeniedComponent when user lacks role', () => {
    render(
      <RequireRoles userRoles={['viewer']} requiredRoles={['admin']} accessDeniedComponent={<span>Denied</span>}>
        <span>Secret</span>
      </RequireRoles>
    );
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
    expect(screen.getByText('Denied')).toBeInTheDocument();
  });

  it('renders null by default when access denied', () => {
    const { container } = render(
      <RequireRoles userRoles={[]} requiredRoles={['admin']}>
        <span>Hidden</span>
      </RequireRoles>
    );
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });

  it('matches role objects with contextId', () => {
    render(
      <RequireRoles
        userRoles={[{ name: 'manager', contextId: 'site-1' }]}
        requiredRoles={[{ name: 'manager', contextId: 'site-1' }]}
      >
        <span>OK</span>
      </RequireRoles>
    );
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('rejects role object with wrong contextId', () => {
    render(
      <RequireRoles
        userRoles={[{ name: 'manager', contextId: 'site-2' }]}
        requiredRoles={[{ name: 'manager', contextId: 'site-1' }]}
      >
        <span>Secret</span>
      </RequireRoles>
    );
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
  });

  it('accepts role object user with string required (ignores contextId)', () => {
    render(
      <RequireRoles
        userRoles={[{ name: 'admin', contextId: 'any' }]}
        requiredRoles={['admin']}
      >
        <span>Access</span>
      </RequireRoles>
    );
    expect(screen.getByText('Access')).toBeInTheDocument();
  });

  it('matches one of multiple required roles', () => {
    render(
      <RequireRoles userRoles={['viewer']} requiredRoles={['admin', 'viewer']}>
        <span>Allowed</span>
      </RequireRoles>
    );
    expect(screen.getByText('Allowed')).toBeInTheDocument();
  });
});
