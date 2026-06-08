import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { getApiErrorMessage } from '../lib/apiErrors';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'CREATOR' | 'EVENTEE';
  hasPassword: boolean;
}

interface UpdateProfilePayload {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: 'CREATOR' | 'EVENTEE') => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
  sendTestEmail: () => Promise<string>;
  deleteAccount: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('eventful_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      setToken(savedToken);

      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
        localStorage.setItem('eventful_user', JSON.stringify(response.data));
      } catch {
        localStorage.removeItem('eventful_token');
        localStorage.removeItem('eventful_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const persistSession = (access_token: string, userData: User) => {
    localStorage.setItem('eventful_token', access_token);
    localStorage.setItem('eventful_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user: userData } = response.data;
      persistSession(access_token, userData);
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (idToken: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/google', { idToken });
      const { access_token, user: userData } = response.data;
      persistSession(access_token, userData);
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err, 'Google login failed'));
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: 'CREATOR' | 'EVENTEE') => {
    setLoading(true);
    try {
      await api.post('/auth/register', { email, password, name, role });
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('eventful_token');
    localStorage.removeItem('eventful_user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (payload: UpdateProfilePayload) => {
    const response = await api.patch('/auth/me', payload);
    setUser(response.data);
    localStorage.setItem('eventful_user', JSON.stringify(response.data));
  };

  const sendTestEmail = async () => {
    const response = await api.post('/auth/me/test-email');
    return response.data.message as string;
  };

  const deleteAccount = async () => {
    await api.delete('/auth/me');
    logout();
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        googleLogin,
        register,
        updateProfile,
        sendTestEmail,
        deleteAccount,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
