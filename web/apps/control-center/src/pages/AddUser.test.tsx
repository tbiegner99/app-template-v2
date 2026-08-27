import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider } from '@__SLUG__/components';
import { MemoryRouter } from 'react-router-dom';
import { DuplicateEmailError } from '../domains/auth/models';
import { ApiError } from '../lib/httpClient';

vi.mock('../domains/auth/datasource', () => ({
  createUser: vi.fn(),
}));

import { createUser } from '../domains/auth/datasource';
const mockCreateUser = vi.mocked(createUser);

import AddUser from './AddUser';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider><MemoryRouter>{children}</MemoryRouter></ThemeProvider>
);

beforeEach(() => vi.clearAllMocks());

function fillAndSubmit(email = 'a@b.com', password = 'pass', displayName = 'Alice') {
  fireEvent.change(screen.getByPlaceholderText('Display Name'), { target: { name: 'displayName', value: displayName } });
  fireEvent.change(screen.getByPlaceholderText('Email'), { target: { name: 'email', value: email } });
  fireEvent.change(screen.getByPlaceholderText('Password'), { target: { name: 'password', value: password } });
  fireEvent.click(screen.getByText('Create User'));
}

describe('AddUser', () => {
  it('renders the form', () => {
    render(<AddUser />, { wrapper });
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('shows success message on successful submit', async () => {
    mockCreateUser.mockResolvedValueOnce({ id: 'u1', email: 'a@b.com', displayName: 'Alice', isDisabled: false, roles: [] });
    render(<AddUser />, { wrapper });
    fillAndSubmit();
    await waitFor(() => expect(mockCreateUser).toHaveBeenCalled());
  });

  it('shows duplicate email error on 409', async () => {
    mockCreateUser.mockRejectedValueOnce(new DuplicateEmailError());
    render(<AddUser />, { wrapper });
    fillAndSubmit();
    await waitFor(() => {
      expect(screen.getByText(/already exists/i)).toBeInTheDocument();
    });
  });

  it('shows trace ID error on ApiError', async () => {
    mockCreateUser.mockRejectedValueOnce(new ApiError('server error', 'trace-123', 500));
    render(<AddUser />, { wrapper });
    fillAndSubmit();
    await waitFor(() => {
      expect(screen.getByText(/trace-123/i)).toBeInTheDocument();
    });
  });

  it('shows generic error on unknown error', async () => {
    mockCreateUser.mockRejectedValueOnce(new Error('unknown'));
    render(<AddUser />, { wrapper });
    fillAndSubmit();
    await waitFor(() => {
      expect(screen.getByText(/Failed to create user/i)).toBeInTheDocument();
    });
  });
});
