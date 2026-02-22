import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Main hook from context - this is the recommended way to use auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default useAuth;
