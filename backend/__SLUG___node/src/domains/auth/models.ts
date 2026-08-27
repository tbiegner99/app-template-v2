export interface UserRole {
  name: string;
  contextId?: string;
}

/** User is the business model for a SuperTokens-backed user. */
export interface User {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  metadata?: Record<string, unknown>;
}

/** ApplicationUser is the application-owned user record in the users table. */
export interface ApplicationUser {
  id: string;
  supertokensId: string;
  email: string;
  displayName: string;
  isDisabled: boolean;
  roles: string[];
  dateCreated: string;
  lastModified: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export class EmailAlreadyExistsError extends Error {
  constructor() {
    super("email already exists");
    this.name = "EmailAlreadyExistsError";
  }
}

export class WrongCredentialsError extends Error {
  constructor() {
    super("wrong credentials");
    this.name = "WrongCredentialsError";
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super("user not found");
    this.name = "UserNotFoundError";
  }
}

export class SelfDisableError extends Error {
  constructor() {
    super("cannot disable your own account");
    this.name = "SelfDisableError";
  }
}
