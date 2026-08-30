import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const BASE_URL = 'https://aashray-backend-ir1k.onrender.com/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(() => {
    const fetchMe = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (!storedToken) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        const response = await axios.get(`${BASE_URL}/auth/me`);
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user context", error);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token, logout]);

  const login = async (phone, password) => {
    const cleanPhone = phone ? String(phone).trim() : '';
    const response = await axios.post(`${BASE_URL}/auth/login`, { phone: cleanPhone, password });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('authToken', access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (name, phone, password, role, email = "") => {
    const cleanPhone = phone ? String(phone).trim() : '';
    const payload = { name: name.trim(), phone: cleanPhone, password, role };
    if (email && email.trim()) payload.email = email.trim();
    const response = await axios.post(`${BASE_URL}/auth/register`, payload);
    return response.data;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
