import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'supertokens-auth-react/recipe/session';
import { UserMenu as UserMenuBase } from '@__SLUG__/components';

export function UserMenu() {
  const navigate = useNavigate();
  const { user } = useUser();

  if (!user.isLoaded()) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <UserMenuBase
      displayName={user.value.displayName}
      email={user.value.email}
      onSignOut={handleSignOut}
    />
  );
}
