import React, { ReactNode } from 'react';

export interface RoleObject {
  name: string;
  contextId?: string;
}

export type RoleValue = string | RoleObject;

export interface RequireRolesProps {
  userRoles: RoleValue[];
  requiredRoles: RoleValue[];
  children: ReactNode;
  accessDeniedComponent?: ReactNode;
}

const roleMatches = (userRole: RoleValue, required: RoleValue): boolean => {
  const userName = typeof userRole === 'string' ? userRole : userRole.name;
  const userCtx = typeof userRole === 'object' ? userRole.contextId : undefined;
  const reqName = typeof required === 'string' ? required : required.name;
  const reqCtx = typeof required === 'object' ? required.contextId : undefined;
  if (userName !== reqName) return false;
  if (reqCtx !== undefined) return userCtx === reqCtx;
  return true;
};

export const RequireRoles: React.FC<RequireRolesProps> = ({
  userRoles,
  requiredRoles,
  children,
  accessDeniedComponent = null,
}) => {
  const hasAccess = userRoles.some((ur) => requiredRoles.some((rr) => roleMatches(ur, rr)));
  return hasAccess ? <>{children}</> : <>{accessDeniedComponent}</>;
};
