export interface User {
  id: string;
  email: string;
  displayName: string;
  isDisabled: boolean;
  roles: string[];
}

export interface UpdateUserRequest {
  email: string;
  displayName: string;
  roles: string[];
}

export interface ResetPasswordRequest {
  newPassword: string;
}

export interface Role {
  name: string;
  contextId?: string;
}

export class DuplicateEmailError extends Error {
  constructor() {
    super('A user with that email already exists.');
  }
}

export class WrongPasswordError extends Error {
  constructor() {
    super('Old password is incorrect.');
  }
}
