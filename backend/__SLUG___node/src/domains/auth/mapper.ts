import type * as pagination from "../../shared/pagination/pagination";
import type { ApplicationUser, User } from "./models";

export interface RoleDTO {
  name: string;
  contextId?: string;
}

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  roles?: RoleDTO[];
  metadata?: Record<string, unknown>;
}

export interface ApplicationUserDTO {
  id: string;
  email: string;
  displayName: string;
  isDisabled: boolean;
  roles: string[];
}

export interface UpdateUserRequestDTO {
  email: string;
  displayName: string;
  roles: string[];
}

export interface AdminResetPasswordRequestDTO {
  newPassword: string;
}

export interface ChangePasswordRequestDTO {
  oldPassword: string;
  newPassword: string;
}

export interface SignUpRequestDTO {
  email: string;
  password: string;
  displayName?: string;
  roles?: string[];
}

export interface SignInRequestDTO {
  email: string;
  password: string;
}

export function userToDTO(user: User): UserDTO {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roles: user.roles.map((r) => ({ name: r.name, contextId: r.contextId })),
    metadata: user.metadata,
  };
}

export function applicationUserToDTO(u: ApplicationUser): ApplicationUserDTO {
  return {
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    isDisabled: u.isDisabled,
    roles: u.roles ?? [],
  };
}

export function applicationUserPageToDTO(
  p: pagination.PagedResponse<ApplicationUser>,
): pagination.PagedResponse<ApplicationUserDTO> {
  return {
    data: p.data.map(applicationUserToDTO),
    total: p.total,
    page: p.page,
    pageSize: p.pageSize,
  };
}
