import EmailPassword from "supertokens-node/recipe/emailpassword";
import Session from "supertokens-node/recipe/session";
import UserRoles from "supertokens-node/recipe/userroles";
import supertokens from "supertokens-node";
import { v4 as uuidv4 } from "uuid";
import type { Database } from "../../logger/db";
import * as pagination from "../../shared/pagination/pagination";
import {
  type ApplicationUser,
  EmailAlreadyExistsError,
  type User,
  UserNotFoundError,
  WrongCredentialsError,
} from "./models";

/** Maps API field names to DB column names for users. */
export const userColumnMap: Record<string, string> = {
  displayName: "display_name",
  email: "email",
  isDisabled: "is_disabled",
  dateCreated: "date_created",
};

interface UserRow {
  id: string;
  supertokens_id: string;
  email: string;
  display_name: string;
  is_disabled: boolean;
  date_created: string;
  last_modified: string;
}

function rowToUser(row: UserRow): ApplicationUser {
  return {
    id: row.id,
    supertokensId: row.supertokens_id,
    email: row.email,
    displayName: row.display_name,
    isDisabled: row.is_disabled,
    roles: [],
    dateCreated: row.date_created,
    lastModified: row.last_modified,
  };
}

/** Handles auth interactions: SuperTokens for credentials, postgres for application users. */
export class Datasource {
  constructor(private readonly db: Database) {}

  /** Creates a new user via SuperTokens. */
  async signUp(email: string, password: string): Promise<string> {
    const resp = await EmailPassword.signUp("public", email, password);
    if (resp.status === "EMAIL_ALREADY_EXISTS_ERROR") {
      throw new EmailAlreadyExistsError();
    }
    return resp.user.id;
  }

  /** Authenticates a user via SuperTokens. */
  async signIn(email: string, password: string): Promise<string> {
    const resp = await EmailPassword.signIn("public", email, password);
    if (resp.status === "WRONG_CREDENTIALS_ERROR") {
      throw new WrongCredentialsError();
    }
    return resp.user.id;
  }

  /** Retrieves SuperTokens user information. */
  async getUser(userId: string): Promise<User> {
    const userInfo = await supertokens.getUser(userId);
    if (!userInfo) {
      throw new UserNotFoundError();
    }
    return {
      id: userInfo.id,
      email: userInfo.emails[0] ?? "",
      name: userInfo.emails[0] ?? "",
      roles: [{ name: "admin" }],
    };
  }

  /** Inserts a new row into the users table and assigns roles. */
  async createApplicationUser(
    supertokensId: string,
    email: string,
    displayName: string,
    roles: string[],
  ): Promise<ApplicationUser> {
    const now = new Date().toISOString();
    const id = uuidv4();
    await this.db.query(
      `INSERT INTO users (id, supertokens_id, email, display_name, date_created, last_modified)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, supertokensId, email, displayName, now, now],
    );
    for (const role of roles) {
      await UserRoles.addRoleToUser("public", supertokensId, role);
    }
    return {
      id,
      supertokensId,
      email,
      displayName,
      isDisabled: false,
      roles,
      dateCreated: now,
      lastModified: now,
    };
  }

  /** Looks up the application user by SuperTokens user ID. */
  async getApplicationUserBySupertokensId(supertokensId: string): Promise<ApplicationUser> {
    const result = await this.db.query<UserRow>(
      `SELECT id, supertokens_id, email, display_name, is_disabled, date_created, last_modified
       FROM users WHERE supertokens_id = $1`,
      [supertokensId],
    );
    if (result.rowCount === 0) {
      throw new UserNotFoundError();
    }
    return rowToUser(result.rows[0]);
  }

  /** Looks up an application user by their application ID. */
  async getApplicationUserById(id: string): Promise<ApplicationUser> {
    const result = await this.db.query<UserRow>(
      `SELECT id, supertokens_id, email, display_name, is_disabled, date_created, last_modified
       FROM users WHERE id = $1`,
      [id],
    );
    if (result.rowCount === 0) {
      throw new UserNotFoundError();
    }
    return rowToUser(result.rows[0]);
  }

  /** Verifies the old password then updates it via SuperTokens. */
  async changePassword(email: string, oldPassword: string, newPassword: string): Promise<void> {
    const signInResp = await EmailPassword.signIn("public", email, oldPassword);
    if (signInResp.status === "WRONG_CREDENTIALS_ERROR") {
      throw new WrongCredentialsError();
    }
    const userId = signInResp.user.id;
    const updateResp = await EmailPassword.updateEmailOrPassword({
      recipeUserId: signInResp.user.loginMethods[0].recipeUserId,
      password: newPassword,
    });
    if (updateResp.status === "UNKNOWN_USER_ID_ERROR") {
      throw new UserNotFoundError();
    }
    void userId;
  }

  /** Returns a paged list of application users matching the given params. */
  async listUsers(p: pagination.ResolvedParams) {
    const args: unknown[] = [];
    let argIdx = 1;
    const conditions: string[] = [];

    for (const f of p.filters) {
      switch (f.op) {
        case "eq":
          conditions.push(`${f.column} = $${argIdx++}`);
          args.push(f.value);
          break;
        case "contains":
          conditions.push(`${f.column} ILIKE $${argIdx++}`);
          args.push(`%${f.value}%`);
          break;
        case "gt":
          conditions.push(`${f.column} > $${argIdx++}`);
          args.push(f.value);
          break;
        case "gte":
          conditions.push(`${f.column} >= $${argIdx++}`);
          args.push(f.value);
          break;
        case "lt":
          conditions.push(`${f.column} < $${argIdx++}`);
          args.push(f.value);
          break;
        case "lte":
          conditions.push(`${f.column} <= $${argIdx++}`);
          args.push(f.value);
          break;
      }
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const sortCol = p.sort || "display_name";
    const orderBy = `ORDER BY ${sortCol} ${p.sortDir.toUpperCase()}`;

    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) FROM users ${where}`,
      args,
    );
    const total = Number(countResult.rows[0].count);

    const dataArgs = [...args, p.pageSize, pagination.offset(p)];
    const dataQuery = `SELECT id, supertokens_id, email, display_name, is_disabled, date_created, last_modified
       FROM users ${where} ${orderBy} LIMIT $${argIdx} OFFSET $${argIdx + 1}`;
    const dataResult = await this.db.query<UserRow>(dataQuery, dataArgs);

    return {
      data: dataResult.rows.map(rowToUser),
      total,
      page: p.page,
      pageSize: p.pageSize,
    };
  }

  /** Returns the role names assigned to a SuperTokens user. */
  async getRolesForUser(supertokensId: string): Promise<string[]> {
    const resp = await UserRoles.getRolesForUser("public", supertokensId);
    return resp.roles;
  }

  /** Updates email, display_name, and roles for a user. */
  async updateUser(
    id: string,
    email: string,
    displayName: string,
    roles: string[],
  ): Promise<ApplicationUser> {
    const now = new Date().toISOString();
    const result = await this.db.query<UserRow>(
      `UPDATE users SET email = $1, display_name = $2, last_modified = $3
       WHERE id = $4
       RETURNING id, supertokens_id, email, display_name, is_disabled, date_created, last_modified`,
      [email, displayName, now, id],
    );
    if (result.rowCount === 0) {
      throw new UserNotFoundError();
    }
    const u = rowToUser(result.rows[0]);

    const currentRolesResp = await UserRoles.getRolesForUser("public", u.supertokensId);
    const currentRoles = new Set(currentRolesResp.roles);
    const desiredRoles = new Set(roles);

    for (const r of desiredRoles) {
      if (!currentRoles.has(r)) {
        await UserRoles.addRoleToUser("public", u.supertokensId, r);
      }
    }
    for (const r of currentRoles) {
      if (!desiredRoles.has(r)) {
        await UserRoles.removeUserRole("public", u.supertokensId, r);
      }
    }
    u.roles = roles;
    return u;
  }

  /** Resets a user's password without requiring the old password. */
  async adminResetPassword(supertokensId: string, newPassword: string): Promise<void> {
    const userInfo = await supertokens.getUser(supertokensId);
    if (!userInfo) {
      throw new UserNotFoundError();
    }
    const resp = await EmailPassword.updateEmailOrPassword({
      recipeUserId: userInfo.loginMethods[0].recipeUserId,
      password: newPassword,
    });
    if (resp.status === "UNKNOWN_USER_ID_ERROR") {
      throw new UserNotFoundError();
    }
  }

  /** Sets is_disabled=true and revokes all active sessions. */
  async disableUser(id: string): Promise<void> {
    const now = new Date().toISOString();
    const result = await this.db.query<{ supertokens_id: string }>(
      `UPDATE users SET is_disabled = true, last_modified = $1 WHERE id = $2 RETURNING supertokens_id`,
      [now, id],
    );
    if (result.rowCount === 0) {
      throw new UserNotFoundError();
    }
    await Session.revokeAllSessionsForUser(result.rows[0].supertokens_id);
  }

  /** Sets is_disabled=false. */
  async enableUser(id: string): Promise<void> {
    const now = new Date().toISOString();
    const result = await this.db.query(
      `UPDATE users SET is_disabled = false, last_modified = $1 WHERE id = $2`,
      [now, id],
    );
    if (result.rowCount === 0) {
      throw new UserNotFoundError();
    }
  }

  /** Removes a SuperTokens user (best-effort, used for signup rollback). */
  async deleteSupertokensUser(supertokensId: string): Promise<void> {
    try {
      await supertokens.deleteUser(supertokensId);
    } catch {
      // best-effort cleanup
    }
  }
}
