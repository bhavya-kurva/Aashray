import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  // Set default authorization header if token exists
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get('http://localhost:8000/api/auth/me');
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user context", error);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = async (phone, password) => {
    const response = await axios.post('http://localhost:8000/api/auth/login', { phone, password });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('authToken', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (name, phone, password, role, email = "") => {
    const payload = { name, phone, password, role };
    if (email) payload.email = email;
    const response = await axios.post('http://localhost:8000/api/auth/register', payload);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
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
