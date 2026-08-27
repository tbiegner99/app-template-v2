import { Role, User } from './models';

interface UserResponse {
  id?: string;
  email?: string;
  displayName?: string;
  name?: string;
  isDisabled?: boolean;
  roles?: Array<{ name: string; contextId?: string } | string>;
}

export function mapUser(raw: UserResponse, fallbackId = ''): User {
  return {
    id: raw.id ?? fallbackId,
    email: raw.email ?? '',
    displayName: raw.displayName ?? raw.name ?? '',
    isDisabled: raw.isDisabled ?? false,
    roles: mapRoleStrings(raw),
  };
}

function mapRoleStrings(raw: UserResponse): string[] {
  return (raw.roles ?? []).map((r) => (typeof r === 'string' ? r : r.name));
}

export function mapRoles(raw: UserResponse): Role[] {
  return (raw.roles ?? [])
    .filter((r): r is { name: string; contextId?: string } => typeof r !== 'string')
    .map((r) => (r.contextId ? { name: r.name, contextId: r.contextId } : { name: r.name }));
}

export function mapUsers(raw: UserResponse[]): User[] {
  return raw.map((u) => mapUser(u));
}

export interface PagedUsersResponse {
  data: User[];
  total: number;
  page: number;
  pageSize: number;
}

export function mapPagedUsers(raw: { data: UserResponse[]; total: number; page: number; pageSize: number }): PagedUsersResponse {
  return {
    data: raw.data.map((u) => mapUser(u)),
    total: raw.total,
    page: raw.page,
    pageSize: raw.pageSize,
  };
}
