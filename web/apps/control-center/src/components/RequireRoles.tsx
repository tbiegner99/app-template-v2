import React, { ReactNode } from 'react';
import { Role, useUser } from '../context/UserContext';

interface RequireRolesProps {
  requiredRoles: (Role | string)[];
  children: ReactNode;
  accessDeniedComponent?: ReactNode;
}

export const RequireRoles: React.FC<RequireRolesProps> = ({
  requiredRoles,
  children,
  accessDeniedComponent = null,
}) => {
  const { roles, user } = useUser();

  if (!user.isLoaded() || !roles.isLoaded()) {
    return null;
  }
  const roleMatches = (userRole: Role | string, requiredRole: Role | string): boolean => {
    if (typeof userRole === 'string' && typeof requiredRole === 'string') {
      return userRole === requiredRole;
    } else if (typeof userRole === 'object' && typeof requiredRole === 'object') {
      return userRole.name === requiredRole.name && userRole.contextId === requiredRole.contextId;
    } else if (typeof userRole === 'object' && typeof requiredRole === 'string') {
      return userRole.name === requiredRole;
    } else if (typeof userRole === 'string' && typeof requiredRole === 'object') {
      return userRole === requiredRole.name;
    }
    return false;
  };
  // Check if user has any of the required roles
  const hasAccess = roles.value.some((role) => {
    return requiredRoles.some((reqRole) => roleMatches(role, reqRole));
  });

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{accessDeniedComponent}</>;
};
