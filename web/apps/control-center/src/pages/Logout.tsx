import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'supertokens-auth-react/recipe/session';

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    signOut().then(() => navigate('/auth', { replace: true }));
  }, [navigate]);

  return null;
}

export default Logout;
