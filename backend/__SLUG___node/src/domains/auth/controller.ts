import type { Request, Response } from "express";
import type { SessionRequest } from "supertokens-node/framework/express";
import Session from "supertokens-node/recipe/session";
import RecipeUserId from "supertokens-node/lib/build/recipeUserId";
import { loggerFromContext, traceIdFromContext } from "../../logger/logger";
import * as pagination from "../../shared/pagination/pagination";
import type { Service } from "./service";
import * as mapper from "./mapper";
import {
  EmailAlreadyExistsError,
  SelfDisableError,
  UserNotFoundError,
  WrongCredentialsError,
} from "./models";

function writeError(res: Response, status: number, msg: string): void {
  res.status(status).json({ error: msg, trace_id: traceIdFromContext() });
}

/** Resolves the authenticated SuperTokens user ID from the request session, or writes 401 and returns undefined. */
function supertokensIdFromSession(req: SessionRequest, res: Response): string | undefined {
  const session = req.session;
  if (!session) {
    writeError(res, 401, "unauthorized");
    return undefined;
  }
  return session.getUserId();
}

export class Controller {
  constructor(private readonly service: Service) {}

  signUp = async (req: Request, res: Response): Promise<void> => {
    const dto = req.body as mapper.SignUpRequestDTO;
    if (!dto?.email || !dto?.password) {
      writeError(res, 400, "invalid request body");
      return;
    }
    const displayName = dto.displayName || dto.email;

    try {
      const appUser = await this.service.signUp(
        { email: dto.email, password: dto.password },
        displayName,
        dto.roles ?? [],
      );
      await Session.createNewSession(req, res, "public", new RecipeUserId(appUser.supertokensId), {
        userId: appUser.id,
      });
      res.status(201).json(mapper.applicationUserToDTO(appUser));
    } catch (err) {
      if (err instanceof EmailAlreadyExistsError) {
        writeError(res, 409, err.message);
        return;
      }
      loggerFromContext().error({ err }, "signup error");
      writeError(res, 500, "internal server error");
    }
  };

  signIn = async (req: Request, res: Response): Promise<void> => {
    const dto = req.body as mapper.SignInRequestDTO;
    if (!dto?.email || !dto?.password) {
      writeError(res, 400, "invalid request body");
      return;
    }

    try {
      const supertokensId = await this.service.signIn({ email: dto.email, password: dto.password });
      const appUser = await this.service.resolveApplicationUser(supertokensId);
      await Session.createNewSession(req, res, "public", new RecipeUserId(supertokensId), {
        userId: appUser.id,
      });
      res.status(200).json(mapper.applicationUserToDTO(appUser));
    } catch (err) {
      if (err instanceof WrongCredentialsError) {
        writeError(res, 401, err.message);
        return;
      }
      loggerFromContext().error({ err }, "signin error");
      writeError(res, 500, "internal server error");
    }
  };

  signOut = async (req: SessionRequest, res: Response): Promise<void> => {
    const session = req.session;
    if (session) {
      try {
        await session.revokeSession();
      } catch (err) {
        loggerFromContext().error({ err }, "signout error");
        writeError(res, 500, "internal server error");
        return;
      }
    }
    res.status(200).json({ message: "signed out successfully" });
  };

  getMe = async (req: SessionRequest, res: Response): Promise<void> => {
    const supertokensId = supertokensIdFromSession(req, res);
    if (!supertokensId) return;
    try {
      const appUser = await this.service.resolveApplicationUser(supertokensId);
      res.status(200).json(mapper.applicationUserToDTO(appUser));
    } catch (err) {
      loggerFromContext().error({ err, supertokens_id: supertokensId }, "get me error");
      writeError(res, 500, "internal server error");
    }
  };

  changePassword = async (req: SessionRequest, res: Response): Promise<void> => {
    const supertokensId = supertokensIdFromSession(req, res);
    if (!supertokensId) return;

    const dto = req.body as mapper.ChangePasswordRequestDTO;
    if (!dto?.oldPassword || !dto?.newPassword) {
      writeError(res, 400, "oldPassword and newPassword are required");
      return;
    }

    try {
      const appUser = await this.service.resolveApplicationUser(supertokensId);
      await this.service.changePassword(appUser.email, dto.oldPassword, dto.newPassword);
      res.status(200).json({ status: "OK" });
    } catch (err) {
      if (err instanceof WrongCredentialsError) {
        writeError(res, 400, "old password is incorrect");
        return;
      }
      loggerFromContext().error({ err, supertokens_id: supertokensId }, "change password error");
      writeError(res, 500, "internal server error");
    }
  };

  listUsers = async (req: Request, res: Response): Promise<void> => {
    let params: pagination.Params;
    try {
      params = pagination.decode(req);
    } catch (err) {
      writeError(res, 400, (err as Error).message);
      return;
    }
    try {
      const result = await this.service.listUsers(params);
      res.status(200).json(mapper.applicationUserPageToDTO(result));
    } catch (err) {
      if (err instanceof pagination.InvalidFieldError) {
        writeError(res, 400, err.message);
        return;
      }
      loggerFromContext().error({ err }, "list users error");
      writeError(res, 500, "internal server error");
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    const dto = req.body as mapper.UpdateUserRequestDTO;
    try {
      const appUser = await this.service.updateUser(id, dto.email, dto.displayName, dto.roles ?? []);
      res.status(200).json(mapper.applicationUserToDTO(appUser));
    } catch (err) {
      if (err instanceof UserNotFoundError) {
        writeError(res, 404, err.message);
        return;
      }
      if (err instanceof EmailAlreadyExistsError) {
        writeError(res, 409, err.message);
        return;
      }
      loggerFromContext().error({ err, user_id: id }, "update user error");
      writeError(res, 500, "internal server error");
    }
  };

  adminResetPassword = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    const dto = req.body as mapper.AdminResetPasswordRequestDTO;
    if (!dto?.newPassword) {
      writeError(res, 400, "newPassword is required");
      return;
    }
    try {
      await this.service.adminResetPassword(id, dto.newPassword);
      res.status(200).json({ status: "OK" });
    } catch (err) {
      if (err instanceof UserNotFoundError) {
        writeError(res, 404, err.message);
        return;
      }
      loggerFromContext().error({ err, user_id: id }, "admin reset password error");
      writeError(res, 500, "internal server error");
    }
  };

  disableUser = async (req: SessionRequest, res: Response): Promise<void> => {
    const id = req.params.id;
    const adminSupertokensId = supertokensIdFromSession(req, res);
    if (!adminSupertokensId) return;
    try {
      await this.service.disableUser(adminSupertokensId, id);
      res.status(200).json({ status: "OK" });
    } catch (err) {
      if (err instanceof SelfDisableError) {
        writeError(res, 400, err.message);
        return;
      }
      if (err instanceof UserNotFoundError) {
        writeError(res, 404, err.message);
        return;
      }
      loggerFromContext().error({ err, user_id: id }, "disable user error");
      writeError(res, 500, "internal server error");
    }
  };

  enableUser = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    try {
      await this.service.enableUser(id);
      res.status(200).json({ status: "OK" });
    } catch (err) {
      if (err instanceof UserNotFoundError) {
        writeError(res, 404, err.message);
        return;
      }
      loggerFromContext().error({ err, user_id: id }, "enable user error");
      writeError(res, 500, "internal server error");
    }
  };
}
