import { useAuth } from '../contexts/AuthContext';

const useUser = () => {
  const { user, loading } = useAuth();
  return { user, loading };
};

export default useUser; 