import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({ baseURL });

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('inkwell_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function extractError(error) {
  return error?.response?.data?.message || 'Something went wrong. Please try again.';
}

export async function signup({ name, email, password }) {
  try {
    const res = await apiClient.post('/auth/signup', { name, email, password });
    return res.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
}

export async function login({ email, password }) {
  try {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
}

export async function logout() {
  try {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
}

export async function getMe() {
  try {
    const res = await apiClient.get('/auth/me');
    return res.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
}

export async function updateMe({ name }) {
  try {
    const res = await apiClient.put('/auth/me', { name });
    return res.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
}
