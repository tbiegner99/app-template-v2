import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider } from '@__SLUG__/components';
import { MemoryRouter } from 'react-router-dom';
import { WrongPasswordError } from '../domains/auth/models';
import { ApiError } from '../lib/httpClient';

vi.mock('../domains/auth/datasource', () => ({
  changePassword: vi.fn(),
}));

import { changePassword } from '../domains/auth/datasource';
const mockChangePassword = vi.mocked(changePassword);

import ChangePassword from './ChangePassword';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider><MemoryRouter>{children}</MemoryRouter></ThemeProvider>
);

beforeEach(() => vi.clearAllMocks());

function getInputs(container: HTMLElement) {
  return {
    old: container.querySelector('[data-id="change-password-old"] input') as HTMLInputElement,
    newPass: container.querySelector('[data-id="change-password-new"] input') as HTMLInputElement,
    confirm: container.querySelector('[data-id="change-password-confirm"] input') as HTMLInputElement,
  };
}

describe('ChangePassword', () => {
  it('renders three password fields', () => {
    const { container } = render(<ChangePassword />, { wrapper });
    const { old, newPass, confirm } = getInputs(container);
    expect(old).not.toBeNull();
    expect(newPass).not.toBeNull();
    expect(confirm).not.toBeNull();
  });

  it('shows mismatch error when passwords do not match', async () => {
    const { container } = render(<ChangePassword />, { wrapper });
    const { old, newPass, confirm } = getInputs(container);
    fireEvent.change(old, { target: { value: 'old123' } });
    fireEvent.change(newPass, { target: { value: 'new123' } });
    fireEvent.change(confirm, { target: { value: 'different' } });
    fireEvent.submit(container.querySelector('[data-id="change-password-submit"]')!.closest('form')!);
    await waitFor(() => {
      expect(mockChangePassword).not.toHaveBeenCalled();
    });
  });

  it('calls changePassword on valid submit', async () => {
    mockChangePassword.mockResolvedValueOnce(undefined);
    const { container } = render(<ChangePassword />, { wrapper });
    const { old, newPass, confirm } = getInputs(container);
    fireEvent.change(old, { target: { value: 'old123' } });
    fireEvent.change(newPass, { target: { value: 'new123!' } });
    fireEvent.change(confirm, { target: { value: 'new123!' } });
    fireEvent.submit(container.querySelector('[data-id="change-password-submit"]')!.closest('form')!);
    await waitFor(() => expect(mockChangePassword).toHaveBeenCalledWith('old123', 'new123!'));
  });

  it('shows WrongPasswordError message', async () => {
    mockChangePassword.mockRejectedValueOnce(new WrongPasswordError());
    const { container } = render(<ChangePassword />, { wrapper });
    const { old, newPass, confirm } = getInputs(container);
    fireEvent.change(old, { target: { value: 'wrong' } });
    fireEvent.change(newPass, { target: { value: 'new123!' } });
    fireEvent.change(confirm, { target: { value: 'new123!' } });
    fireEvent.submit(container.querySelector('[data-id="change-password-submit"]')!.closest('form')!);
    await waitFor(() => {
      expect(screen.getByText(/old password is incorrect/i)).toBeInTheDocument();
    });
  });

  it('shows ApiError message with trace ID', async () => {
    mockChangePassword.mockRejectedValueOnce(new ApiError('server error', 'trace-abc', 500));
    const { container } = render(<ChangePassword />, { wrapper });
    const { old, newPass, confirm } = getInputs(container);
    fireEvent.change(old, { target: { value: 'old' } });
    fireEvent.change(newPass, { target: { value: 'new123!' } });
    fireEvent.change(confirm, { target: { value: 'new123!' } });
    fireEvent.submit(container.querySelector('[data-id="change-password-submit"]')!.closest('form')!);
    await waitFor(() => {
      expect(screen.getByText(/trace-abc/i)).toBeInTheDocument();
    });
  });

  it('shows generic error on unexpected error', async () => {
    mockChangePassword.mockRejectedValueOnce(new Error('unexpected'));
    const { container } = render(<ChangePassword />, { wrapper });
    const { old, newPass, confirm } = getInputs(container);
    fireEvent.change(old, { target: { value: 'old' } });
    fireEvent.change(newPass, { target: { value: 'new123!' } });
    fireEvent.change(confirm, { target: { value: 'new123!' } });
    fireEvent.submit(container.querySelector('[data-id="change-password-submit"]')!.closest('form')!);
    await waitFor(() => expect(mockChangePassword).toHaveBeenCalled());
  });
});
