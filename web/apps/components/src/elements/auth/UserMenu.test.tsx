import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { UserMenu } from './UserMenu';

describe('UserMenu', () => {
  it('renders avatar with initials', () => {
    render(<UserMenu displayName="Alice Bob" onSignOut={vi.fn()} />);
    expect(screen.getByText('AB')).toBeInTheDocument();
  });

  it('renders ? initials for no name', () => {
    render(<UserMenu onSignOut={vi.fn()} />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('opens dropdown on button click', () => {
    render(<UserMenu displayName="Alice" email="a@test.com" onSignOut={vi.fn()} />);
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    act(() => screen.getByLabelText('User menu').click());
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.getByText('a@test.com')).toBeInTheDocument();
  });

  it('calls onSignOut when Logout clicked', () => {
    const onSignOut = vi.fn();
    render(<UserMenu displayName="Alice" onSignOut={onSignOut} />);
    act(() => screen.getByLabelText('User menu').click());
    act(() => screen.getByText('Logout').click());
    expect(onSignOut).toHaveBeenCalled();
  });

  it('renders extraMenuItems in dropdown', () => {
    render(
      <UserMenu displayName="Alice" onSignOut={vi.fn()} extraMenuItems={<div>Settings</div>} />
    );
    act(() => screen.getByLabelText('User menu').click());
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('toggles dropdown closed on second click', () => {
    render(<UserMenu displayName="Alice" onSignOut={vi.fn()} />);
    act(() => screen.getByLabelText('User menu').click());
    expect(screen.getByText('Logout')).toBeInTheDocument();
    act(() => screen.getByLabelText('User menu').click());
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });
});
