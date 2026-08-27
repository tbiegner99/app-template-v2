import * as pagination from "../../shared/pagination/pagination";
import type { Datasource } from "./datasource";
import { userColumnMap } from "./datasource";
import {
  type ApplicationUser,
  SelfDisableError,
  type SignInRequest,
  type SignUpRequest,
  UserNotFoundError,
  type User,
  WrongCredentialsError,
} from "./models";

export class Service {
  constructor(private readonly datasource: Datasource) {}

  /**
   * Creates a SuperTokens user then creates the application users row.
   * If the application insert fails, the SuperTokens user is deleted to keep them in sync.
   */
  async signUp(req: SignUpRequest, displayName: string, roles: string[]): Promise<ApplicationUser> {
    const supertokensId = await this.datasource.signUp(req.email, req.password);
    try {
      return await this.datasource.createApplicationUser(supertokensId, req.email, displayName, roles);
    } catch (err) {
      await this.datasource.deleteSupertokensUser(supertokensId);
      throw err;
    }
  }

  /** Authenticates via SuperTokens; rejects if the application user is disabled. */
  async signIn(req: SignInRequest): Promise<string> {
    const supertokensId = await this.datasource.signIn(req.email, req.password);
    let appUser: ApplicationUser;
    try {
      appUser = await this.datasource.getApplicationUserBySupertokensId(supertokensId);
    } catch (err) {
      // Only mask the expected "no app-side row" case as wrong credentials
      // (don't leak whether a SuperTokens identity exists). Any other error
      // propagates so it gets logged as a real error instead of silently
      // looking like a bad password.
      if (err instanceof UserNotFoundError) {
        throw new WrongCredentialsError();
      }
      throw err;
    }
    if (appUser.isDisabled) {
      throw new WrongCredentialsError();
    }
    return supertokensId;
  }

  /** Resolves a SuperTokens user ID to the application user. */
  resolveApplicationUser(supertokensId: string): Promise<ApplicationUser> {
    return this.datasource.getApplicationUserBySupertokensId(supertokensId);
  }

  /** Retrieves SuperTokens user info (used for /me). */
  getUser(userId: string): Promise<User> {
    return this.datasource.getUser(userId);
  }

  changePassword(email: string, oldPassword: string, newPassword: string): Promise<void> {
    return this.datasource.changePassword(email, oldPassword, newPassword);
  }

  /** Returns a paged list of users enriched with their roles. */
  async listUsers(params: pagination.Params): Promise<pagination.PagedResponse<ApplicationUser>> {
    const resolved = pagination.resolve(params, userColumnMap);
    const result = await this.datasource.listUsers(resolved);
    for (const u of result.data) {
      u.roles = await this.datasource.getRolesForUser(u.supertokensId);
    }
    return result;
  }

  updateUser(
    id: string,
    email: string,
    displayName: string,
    roles: string[],
  ): Promise<ApplicationUser> {
    return this.datasource.updateUser(id, email, displayName, roles);
  }

  async adminResetPassword(userId: string, newPassword: string): Promise<void> {
    const appUser = await this.datasource.getApplicationUserById(userId);
    await this.datasource.adminResetPassword(appUser.supertokensId, newPassword);
  }

  /** Disables an account, blocking the self-disable case. */
  async disableUser(adminSupertokensId: string, targetId: string): Promise<void> {
    const target = await this.datasource.getApplicationUserById(targetId);
    if (adminSupertokensId === target.supertokensId) {
      throw new SelfDisableError();
    }
    await this.datasource.disableUser(targetId);
  }

  enableUser(id: string): Promise<void> {
    return this.datasource.enableUser(id);
  }
}
