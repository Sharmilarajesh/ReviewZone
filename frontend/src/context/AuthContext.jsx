import { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, register as apiRegister, getProfile } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const { data } = await getProfile();
      setUser(data);
    } catch (error) {
      console.error('Load user error:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (formData) => {
    try {
      console.log('Login attempt with:', formData); // Debug
      const { data } = await apiLogin(formData);
      console.log('Login response:', data); // Debug
      
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data;
    } catch (error) {
      console.log('Login error details:', error.response?.data); // Debug
      throw error;
    }
  };

  const register = async (formData) => {
    try {
      console.log('Register attempt with:', formData); // Debug
      const { data } = await apiRegister(formData);
      console.log('Register response:', data); // Debug
      return data;
    } catch (error) {
      console.log('Register error:', error.response?.data); // Debug
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin: user?.role === 'admin',
    isCustomer: user?.role === 'customer'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};