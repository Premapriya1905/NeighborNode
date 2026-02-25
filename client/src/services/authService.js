import api from './api';

class AuthService {
  async register(userData) {
    try {
      const { data } = await api.post('auth/register', userData);

      // Backend returns: { user, accessToken, refreshToken }
      if (data?.accessToken) {
        this.setAuthData(data);
      }

      return data;
    } catch (error) {
      return error.message ? error : {
        message: "Registration failed",
      };
    }
  }

  async login(credentials) {
    try {
      const { data } = await api.post('auth/login', credentials);

      if (data?.accessToken) {
        this.setAuthData(data);
      }

      return data;
    } catch (error) {
      return error.message ? error : {
        message: "Login failed",
      };
    }
  }

  async logout() {
    try {
      await api.post('auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  async getMe() {
    const { data } = await api.get('auth/me');
    return data;
  }

  async updatePassword(passwords) {
    const { data } = await api.put('auth/update-password', passwords);
    return data;
  }

  setAuthData({ user, accessToken, refreshToken }) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
  }

  clearAuthData() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  }
}

export default new AuthService();
