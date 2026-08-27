import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchMe,
  createUser,
  fetchUsers,
  updateUser,
  resetUserPassword,
  disableUser,
  enableUser,
  changePassword,
} from './datasource';
import { ApiError } from '../../lib/httpClient';
import { DuplicateEmailError, WrongPasswordError } from './models';

vi.mock('../../lib/httpClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../lib/httpClient')>();
  return { ...actual, httpClient: vi.fn() };
});

import { httpClient } from '../../lib/httpClient';
const mockHttpClient = vi.mocked(httpClient);

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('fetchMe', () => {
  it('returns user and roles on success', async () => {
    mockHttpClient.mockResolvedValueOnce(jsonResponse({ id: 'u1', email: 'a@b.com', displayName: 'Alice', roles: [{ name: 'admin' }] }));
    const result = await fetchMe('u1');
    expect(result.user.id).toBe('u1');
    expect(result.roles).toHaveLength(1);
  });
});

describe('createUser', () => {
  it('returns mapped user on success', async () => {
    mockHttpClient.mockResolvedValueOnce(jsonResponse({ id: 'u1', email: 'a@b.com', displayName: 'Alice' }));
    const user = await createUser('a@b.com', 'pass', 'Alice');
    expect(user.email).toBe('a@b.com');
  });

  it('throws DuplicateEmailError on 409', async () => {
    mockHttpClient.mockRejectedValueOnce(new ApiError('conflict', '', 409));
    await expect(createUser('a@b.com', 'pass', 'Alice')).rejects.toBeInstanceOf(DuplicateEmailError);
  });

  it('rethrows other errors', async () => {
    mockHttpClient.mockRejectedValueOnce(new ApiError('server error', '', 500));
    await expect(createUser('a@b.com', 'pass', 'Alice')).rejects.toBeInstanceOf(ApiError);
  });
});

describe('fetchUsers', () => {
  it('returns paged users on success', async () => {
    mockHttpClient.mockResolvedValueOnce(jsonResponse({ data: [{ id: 'u1' }], total: 1, page: 0, pageSize: 25 }));
    const result = await fetchUsers({ page: 0, pageSize: 25, sort: '', sortDir: 'asc', filters: [] });
    expect(result.total).toBe(1);
    expect(result.data).toHaveLength(1);
  });
});

describe('updateUser', () => {
  it('returns updated user on success', async () => {
    mockHttpClient.mockResolvedValueOnce(jsonResponse({ id: 'u1', email: 'new@b.com', displayName: 'Bob' }));
    const user = await updateUser('u1', { email: 'new@b.com', displayName: 'Bob', roles: [] });
    expect(user.email).toBe('new@b.com');
  });

  it('throws DuplicateEmailError on 409', async () => {
    mockHttpClient.mockRejectedValueOnce(new ApiError('conflict', '', 409));
    await expect(updateUser('u1', { email: 'x', displayName: 'x', roles: [] })).rejects.toBeInstanceOf(DuplicateEmailError);
  });

  it('throws generic error on 404', async () => {
    mockHttpClient.mockRejectedValueOnce(new ApiError('not found', '', 404));
    await expect(updateUser('u1', { email: 'x', displayName: 'x', roles: [] })).rejects.toThrow('User not found');
  });
});

describe('resetUserPassword', () => {
  it('resolves on success', async () => {
    mockHttpClient.mockResolvedValueOnce(jsonResponse({}));
    await expect(resetUserPassword('u1', 'newPass!')).resolves.toBeUndefined();
  });

  it('throws on 404', async () => {
    mockHttpClient.mockRejectedValueOnce(new ApiError('not found', '', 404));
    await expect(resetUserPassword('u1', 'newPass!')).rejects.toThrow('User not found');
  });
});

describe('disableUser', () => {
  it('resolves on success', async () => {
    mockHttpClient.mockResolvedValueOnce(jsonResponse({}));
    await expect(disableUser('u1')).resolves.toBeUndefined();
  });

  it('throws on 400 (own account)', async () => {
    mockHttpClient.mockRejectedValueOnce(new ApiError('bad request', '', 400));
    await expect(disableUser('u1')).rejects.toThrow('Cannot disable your own account');
  });

  it('throws on 404', async () => {
    mockHttpClient.mockRejectedValueOnce(new ApiError('not found', '', 404));
    await expect(disableUser('u1')).rejects.toThrow('User not found');
  });
});

describe('enableUser', () => {
  it('resolves on success', async () => {
    mockHttpClient.mockResolvedValueOnce(jsonResponse({}));
    await expect(enableUser('u1')).resolves.toBeUndefined();
  });

  it('throws on 404', async () => {
    mockHttpClient.mockRejectedValueOnce(new ApiError('not found', '', 404));
    await expect(enableUser('u1')).rejects.toThrow('User not found');
  });
});

describe('changePassword', () => {
  it('resolves on success', async () => {
    mockHttpClient.mockResolvedValueOnce(jsonResponse({}));
    await expect(changePassword('old', 'new')).resolves.toBeUndefined();
  });

  it('throws WrongPasswordError on 400', async () => {
    mockHttpClient.mockRejectedValueOnce(new ApiError('bad request', '', 400));
    await expect(changePassword('old', 'new')).rejects.toBeInstanceOf(WrongPasswordError);
  });

  it('rethrows other errors', async () => {
    mockHttpClient.mockRejectedValueOnce(new ApiError('server error', '', 500));
    await expect(changePassword('old', 'new')).rejects.toBeInstanceOf(ApiError);
  });
});

// Additional rethrow coverage tests
describe('updateUser rethrow', () => {
  it('rethrows non-404/409 errors', async () => {
    mockHttpClient.mockRejectedValueOnce(new ApiError('server error', '', 500));
    await expect(updateUser('u1', { email: 'a@b.com', displayName: 'A', roles: [] })).rejects.toBeInstanceOf(ApiError);
  });
});

describe('resetUserPassword rethrow', () => {
  it('rethrows non-404 errors', async () => {
    mockHttpClient.mockRejectedValueOnce(new ApiError('server error', '', 500));
    await expect(resetUserPassword('u1', 'newpass')).rejects.toBeInstanceOf(ApiError);
  });
});

describe('disableUser rethrow', () => {
  it('rethrows non-400/404 errors', async () => {
    mockHttpClient.mockRejectedValueOnce(new ApiError('server error', '', 500));
    await expect(disableUser('u1')).rejects.toBeInstanceOf(ApiError);
  });
});

describe('enableUser rethrow', () => {
  it('rethrows non-404 errors', async () => {
    mockHttpClient.mockRejectedValueOnce(new ApiError('server error', '', 500));
    await expect(enableUser('u1')).rejects.toBeInstanceOf(ApiError);
  });
});
