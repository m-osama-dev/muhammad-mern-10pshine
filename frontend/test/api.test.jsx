import axios from 'axios';

jest.mock('axios', () => {
  const mockAxiosInstance = {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
    },
  };
  return {
    create: jest.fn(() => mockAxiosInstance),
  };
});

import { apiClient, signup, login, logout, getMe, updateMe } from '../src/services/api';

describe('api service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('returns data on success', async () => {
      apiClient.post.mockResolvedValueOnce({ data: { success: true, token: 'abc' } });

      const result = await signup({ name: 'Osama', email: 'o@test.com', password: 'pw123' });

      expect(apiClient.post).toHaveBeenCalledWith('/auth/signup', {
        name: 'Osama',
        email: 'o@test.com',
        password: 'pw123',
      });
      expect(result).toEqual({ success: true, token: 'abc' });
    });

    it('throws extracted error message on failure', async () => {
      apiClient.post.mockRejectedValueOnce({
        response: { data: { message: 'Email already exists' } },
      });

      await expect(
        signup({ name: 'Osama', email: 'o@test.com', password: 'pw123' })
      ).rejects.toThrow('Email already exists');
    });

    it('throws generic message when no response data', async () => {
      apiClient.post.mockRejectedValueOnce(new Error('network down'));

      await expect(
        signup({ name: 'Osama', email: 'o@test.com', password: 'pw123' })
      ).rejects.toThrow('Something went wrong. Please try again.');
    });
  });

  describe('login', () => {
    it('returns data on success', async () => {
      apiClient.post.mockResolvedValueOnce({ data: { success: true, token: 'xyz' } });

      const result = await login({ email: 'o@test.com', password: 'pw123' });

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'o@test.com',
        password: 'pw123',
      });
      expect(result).toEqual({ success: true, token: 'xyz' });
    });

    it('throws on invalid credentials', async () => {
      apiClient.post.mockRejectedValueOnce({
        response: { data: { message: 'Invalid email or password' } },
      });

      await expect(login({ email: 'o@test.com', password: 'wrong' })).rejects.toThrow(
        'Invalid email or password'
      );
    });
  });

  describe('logout', () => {
    it('returns data on success', async () => {
      apiClient.post.mockResolvedValueOnce({ data: { success: true } });

      const result = await logout();

      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
      expect(result).toEqual({ success: true });
    });

    it('throws on failure', async () => {
      apiClient.post.mockRejectedValueOnce(new Error('fail'));

      await expect(logout()).rejects.toThrow('Something went wrong. Please try again.');
    });
  });

  describe('getMe', () => {
    it('returns user data on success', async () => {
      apiClient.get.mockResolvedValueOnce({ data: { id: '1', name: 'Osama' } });

      const result = await getMe();

      expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual({ id: '1', name: 'Osama' });
    });

    it('throws on failure', async () => {
      apiClient.get.mockRejectedValueOnce(new Error('fail'));

      await expect(getMe()).rejects.toThrow('Something went wrong. Please try again.');
    });
  });

  describe('updateMe', () => {
    it('returns updated data on success', async () => {
      apiClient.put.mockResolvedValueOnce({ data: { id: '1', name: 'New Name' } });

      const result = await updateMe({ name: 'New Name' });

      expect(apiClient.put).toHaveBeenCalledWith('/auth/me', { name: 'New Name' });
      expect(result).toEqual({ id: '1', name: 'New Name' });
    });

    it('throws on failure', async () => {
      apiClient.put.mockRejectedValueOnce({
        response: { data: { message: 'Email already in use' } },
      });

      await expect(updateMe({ name: 'X' })).rejects.toThrow('Email already in use');
    });
  });
});