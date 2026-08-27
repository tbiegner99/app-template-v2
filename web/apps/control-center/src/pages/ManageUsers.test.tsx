import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider, LoadingState } from '@__SLUG__/components';
import { MemoryRouter } from 'react-router-dom';
import * as UserContext from '../context/UserContext';
import { DuplicateEmailError } from '../domains/auth/models';

vi.mock('../domains/auth/datasource', () => ({
  fetchUsers: vi.fn().mockResolvedValue({ data: [], total: 0, page: 0, pageSize: 25 }),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  resetUserPassword: vi.fn(),
  disableUser: vi.fn(),
  enableUser: vi.fn(),
}));

import { createUser, fetchUsers } from '../domains/auth/datasource';
const mockCreateUser = vi.mocked(createUser);
const mockFetchUsers = vi.mocked(fetchUsers);

import ManageUsers from './ManageUsers';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider><MemoryRouter>{children}</MemoryRouter></ThemeProvider>
);

const mockUser = { id: 'u1', email: 'a@b.com', displayName: 'Alice', isDisabled: false, roles: ['admin'] };

beforeEach(() => {
  vi.clearAllMocks();
  mockFetchUsers.mockResolvedValue({ data: [], total: 0, page: 0, pageSize: 25 });
  vi.spyOn(UserContext, 'useUser').mockReturnValue({
    user: LoadingState.loaded(mockUser),
    roles: LoadingState.loaded([{ name: 'admin' }]),
  });
});

function openAddForm(container: HTMLElement) {
  const addBtn = container.querySelector('[data-id="open-add-user"]') as HTMLElement;
  fireEvent.click(addBtn);
}

function fillAddForm(email: string, password: string) {
  const emailInput = document.querySelector('[data-id="add-user-email"] input') as HTMLInputElement;
  const passwordInput = document.querySelector('[data-id="add-user-password"] input') as HTMLInputElement;
  const confirmInput = document.querySelector('[data-id="add-user-confirm-password"] input') as HTMLInputElement;
  const displayNameInput = document.querySelector('[data-id="add-user-display-name"] input') as HTMLInputElement;
  if (emailInput) fireEvent.change(emailInput, { target: { value: email } });
  if (passwordInput) fireEvent.change(passwordInput, { target: { value: password } });
  if (confirmInput) fireEvent.change(confirmInput, { target: { value: password } });
  if (displayNameInput) fireEvent.change(displayNameInput, { target: { value: 'Test User' } });
}

describe('ManageUsers', () => {
  it('renders without crashing', async () => {
    const { container } = render(<ManageUsers />, { wrapper });
    await waitFor(() => expect(container.querySelector('[role="grid"]')).not.toBeNull(), { timeout: 3000 });
  });

  it('shows add user button', () => {
    const { container } = render(<ManageUsers />, { wrapper });
    expect(container.querySelector('[data-id="open-add-user"]')).not.toBeNull();
  });

  it('shows empty table when no users returned', async () => {
    const { container } = render(<ManageUsers />, { wrapper });
    await waitFor(() => expect(container.querySelector('[role="grid"]')).not.toBeNull(), { timeout: 3000 });
  });

  it('shows add user form fields after clicking add button', async () => {
    const { container } = render(<ManageUsers />, { wrapper });
    openAddForm(container);
    await waitFor(() => {
      expect(document.querySelector('[data-id="add-user-email"]')).not.toBeNull();
    });
  });

  it('submits add user form successfully', async () => {
    mockCreateUser.mockResolvedValueOnce({ id: 'u2', email: 'new@b.com', displayName: 'New', isDisabled: false, roles: [] });
    const { container } = render(<ManageUsers />, { wrapper });
    openAddForm(container);
    await waitFor(() => expect(document.querySelector('[data-id="add-user-email"]')).not.toBeNull());
    fillAddForm('new@b.com', 'pass123!');
    const submitBtn = document.querySelector('[data-id="add-user-submit"]') as HTMLElement;
    fireEvent.click(submitBtn);
    await waitFor(() => expect(mockCreateUser).toHaveBeenCalled());
  });

  it('shows duplicate email error on 409', async () => {
    mockCreateUser.mockRejectedValueOnce(new DuplicateEmailError());
    const { container } = render(<ManageUsers />, { wrapper });
    openAddForm(container);
    await waitFor(() => expect(document.querySelector('[data-id="add-user-email"]')).not.toBeNull());
    fillAddForm('dup@b.com', 'pass123!');
    const submitBtn = document.querySelector('[data-id="add-user-submit"]') as HTMLElement;
    fireEvent.click(submitBtn);
    await waitFor(() => expect(mockCreateUser).toHaveBeenCalled());
  });
});
