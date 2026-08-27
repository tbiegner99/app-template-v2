import { describe, it, expect } from 'vitest';
import { mapUser, mapUsers, mapRoles, mapPagedUsers } from './mapper';

describe('mapUser', () => {
  it('maps a full user response', () => {
    const user = mapUser({ id: '1', email: 'a@b.com', displayName: 'Alice', isDisabled: false, roles: ['admin'] });
    expect(user.id).toBe('1');
    expect(user.email).toBe('a@b.com');
    expect(user.displayName).toBe('Alice');
    expect(user.isDisabled).toBe(false);
    expect(user.roles).toEqual(['admin']);
  });

  it('falls back to name when displayName is missing', () => {
    const user = mapUser({ name: 'Bob' });
    expect(user.displayName).toBe('Bob');
  });

  it('uses fallbackId when id is missing', () => {
    const user = mapUser({}, 'fallback-id');
    expect(user.id).toBe('fallback-id');
  });

  it('defaults isDisabled to false', () => {
    const user = mapUser({});
    expect(user.isDisabled).toBe(false);
  });

  it('maps role objects by extracting name', () => {
    const user = mapUser({ roles: [{ name: 'editor', contextId: 'site-1' }] });
    expect(user.roles).toEqual(['editor']);
  });

  it('handles empty roles', () => {
    const user = mapUser({ roles: [] });
    expect(user.roles).toEqual([]);
  });
});

describe('mapUsers', () => {
  it('maps array of users', () => {
    const users = mapUsers([{ id: '1', email: 'a@b.com' }, { id: '2', email: 'c@d.com' }]);
    expect(users).toHaveLength(2);
    expect(users[0].email).toBe('a@b.com');
  });
});

describe('mapRoles', () => {
  it('maps role objects with contextId', () => {
    const roles = mapRoles({ roles: [{ name: 'admin', contextId: 'site-1' }] });
    expect(roles).toEqual([{ name: 'admin', contextId: 'site-1' }]);
  });

  it('maps role objects without contextId', () => {
    const roles = mapRoles({ roles: [{ name: 'viewer' }] });
    expect(roles).toEqual([{ name: 'viewer' }]);
  });

  it('filters out string roles', () => {
    const roles = mapRoles({ roles: ['string-role', { name: 'admin' }] });
    expect(roles).toEqual([{ name: 'admin' }]);
  });

  it('returns empty array when no roles', () => {
    const roles = mapRoles({});
    expect(roles).toEqual([]);
  });
});

describe('mapPagedUsers', () => {
  it('maps paged users response', () => {
    const result = mapPagedUsers({ data: [{ id: '1' }], total: 10, page: 1, pageSize: 5 });
    expect(result.total).toBe(10);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(5);
    expect(result.data).toHaveLength(1);
  });
});
