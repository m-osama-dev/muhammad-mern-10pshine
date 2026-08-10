import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import * as api from '../services/api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'inkwell_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(() => localStorage.getItem('inkwell_theme') === 'dark');

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('inkwell_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('inkwell_theme', 'light');
    }
  }, [dark]);

  const loadCurrentUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.getMe();
      setUser(res.data);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  async function signup(payload) {
    try {
      const res = await api.signup(payload);
      localStorage.setItem(TOKEN_KEY, res.token);
      setUser(res.data);
      return res;
    } catch (err) {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      throw err;
    }
  }

  async function login(payload) {
    try {
      const res = await api.login(payload);
      localStorage.setItem(TOKEN_KEY, res.token);
      setUser(res.data);
      return res;
    } catch (err) {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      throw err;
    }
  }

 async function logout() {
    try {
      await api.logout();
    } catch {
      // server-side logout failing (e.g. network issue) shouldn't block
      // the user from being logged out locally
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    }
  }

  async function updateProfile(payload) {
    try {
      const res = await api.updateMe(payload);
      setUser(res.data);
      return res;
    } catch (err) {
      throw err;
    }
  }

  const value = { user, loading, dark, setDark, signup, login, logout, updateProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
