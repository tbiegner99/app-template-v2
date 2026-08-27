import { LoadingState } from '@__SLUG__/components';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSessionContext } from 'supertokens-auth-react/recipe/session';
import { fetchMe } from '../domains/auth/datasource';
import type { Role, User } from '../domains/auth/models'; // used by LoadingState generics below

export type { Role, User } from '../domains/auth/models';

export interface UserContextValue {
  user: LoadingState<User>;
  roles: LoadingState<Role[]>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const sessionContext = useSessionContext();
  const [user, setUser] = useState<LoadingState<User>>(LoadingState.unloaded());
  const [roles, setRoles] = useState<LoadingState<Role[]>>(LoadingState.unloaded());

  useEffect(() => {
    const fetchUserData = async () => {
      if (sessionContext.loading) {
        return;
      }

      // Check if session exists by checking if we have a valid session context
      const userId = 'userId' in sessionContext ? sessionContext.userId : undefined;

      if (!userId) {
        setUser(LoadingState.unloaded());
        setRoles(LoadingState.unloaded());
        return;
      }

      try {
        setUser(LoadingState.loading());
        const { user: fetchedUser, roles: fetchedRoles } = await fetchMe(userId);
        setUser(LoadingState.loaded(fetchedUser));
        setRoles(LoadingState.loaded(fetchedRoles));
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setUser(LoadingState.error(err as Error));
      }
    };

    fetchUserData();
  }, [sessionContext]);

  return <UserContext.Provider value={{ user, roles }}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextValue => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserContextProvider');
  }
  return context;
};
