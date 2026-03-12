import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedUser = authService.getStoredUser();

      if (storedUser && authService.isAuthenticated()) {
        const response = await authService.getMe();

        if (response?.user) {
          setUser(response.user);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      authService.clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await authService.login(credentials);

    if (response?.accessToken) {
      setUser(response.user);
      setIsAuthenticated(true);
      toast.success('Welcome back!');
    } else {
      toast.error(response?.message || 'Login failed');
    }

    return response;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);

    if (response?.accessToken) {
      setUser(response.user);
      setIsAuthenticated(true);
      toast.success('Account created successfully!');
    } else {
      toast.error(response?.message || 'Registration failed');
    }

    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const updateUser = (userData) => {
    setUser((prev) => {
      const updatedUser = { ...prev, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
