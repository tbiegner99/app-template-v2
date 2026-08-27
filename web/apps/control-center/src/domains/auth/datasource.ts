import { DuplicateEmailError, UpdateUserRequest, User, WrongPasswordError } from './models';
import { mapRoles, mapUser, mapPagedUsers, PagedUsersResponse } from './mapper';
import type { Role } from './models';
import type { TableParams } from '@__SLUG__/components';
import { httpClient, ApiError } from '../../lib/httpClient';

const BASE = '/api/__SLUG__/auth';

export async function fetchMe(userId: string): Promise<{ user: User; roles: Role[] }> {
  const res = await httpClient(`${BASE}/me`, { credentials: 'include' });
  const raw = await res.json();
  return { user: mapUser(raw, userId), roles: mapRoles(raw) };
}

export async function createUser(
  email: string,
  password: string,
  displayName: string,
  roles: string[] = []
): Promise<User> {
  try {
    const res = await httpClient(`${BASE}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, displayName, roles }),
    });
    const raw = await res.json();
    return mapUser(raw);
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) throw new DuplicateEmailError();
    throw err;
  }
}

export async function fetchUsers(params: TableParams): Promise<PagedUsersResponse> {
  const res = await httpClient(`${BASE}/users/list`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(params),
  });
  const raw = await res.json();
  return mapPagedUsers(raw);
}

export async function updateUser(id: string, req: UpdateUserRequest): Promise<User> {
  try {
    const res = await httpClient(`${BASE}/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(req),
    });
    const raw = await res.json();
    return mapUser(raw);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) throw new Error('User not found');
    if (err instanceof ApiError && err.status === 409) throw new DuplicateEmailError();
    throw err;
  }
}

export async function resetUserPassword(id: string, newPassword: string): Promise<void> {
  try {
    await httpClient(`${BASE}/users/${id}/password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ newPassword }),
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) throw new Error('User not found');
    throw err;
  }
}

export async function disableUser(id: string): Promise<void> {
  try {
    await httpClient(`${BASE}/users/${id}/disable`, {
      method: 'PATCH',
      credentials: 'include',
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 400) throw new Error('Cannot disable your own account');
    if (err instanceof ApiError && err.status === 404) throw new Error('User not found');
    throw err;
  }
}

export async function enableUser(id: string): Promise<void> {
  try {
    await httpClient(`${BASE}/users/${id}/enable`, {
      method: 'PATCH',
      credentials: 'include',
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) throw new Error('User not found');
    throw err;
  }
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<void> {
  try {
    await httpClient(`${BASE}/change-password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 400) throw new WrongPasswordError();
    throw err;
  }
}
