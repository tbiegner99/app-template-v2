import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { AvatarMenuItem } from './AvatarMenuItem';

describe('AvatarMenuItem', () => {
  it('renders avatar with first letter of name', () => {
    render(<AvatarMenuItem name="Alice" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders avatar with src image', () => {
    render(<AvatarMenuItem name="Alice" src="https://example.com/avatar.jpg" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('opens menu when clicked with menu items', () => {
    render(
      <AvatarMenuItem
        name="Bob"
        menuItems={[{ label: 'Profile' }, { label: 'Logout' }]}
      />
    );
    act(() => screen.getByRole('button').click());
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('calls item onClick and closes menu', () => {
    const onLogout = vi.fn();
    render(
      <AvatarMenuItem
        name="Bob"
        menuItems={[{ label: 'Logout', onClick: onLogout }]}
      />
    );
    act(() => screen.getByRole('button').click());
    act(() => screen.getByText('Logout').click());
    expect(onLogout).toHaveBeenCalled();
  });

  it('does not open menu when no items provided', () => {
    render(<AvatarMenuItem name="Charlie" menuItems={[]} />);
    act(() => screen.getByRole('button').click());
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
