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

import { apiClient } from '../src/services/api';
import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from '../src/services/noteService';

describe('noteService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotes', () => {
    it('returns list of notes on success', async () => {
      apiClient.get.mockResolvedValueOnce({ data: [{ id: '1', title: 'Note 1' }] });

      const result = await getNotes();

      expect(apiClient.get).toHaveBeenCalledWith('/notes');
      expect(result).toEqual([{ id: '1', title: 'Note 1' }]);
    });

    it('throws extracted error message on failure', async () => {
      apiClient.get.mockRejectedValueOnce({
        response: { data: { message: 'Could not fetch notes' } },
      });

      await expect(getNotes()).rejects.toThrow('Could not fetch notes');
    });
  });

  describe('getNoteById', () => {
    it('returns a single note on success', async () => {
      apiClient.get.mockResolvedValueOnce({ data: { id: '1', title: 'Note 1' } });

      const result = await getNoteById('1');

      expect(apiClient.get).toHaveBeenCalledWith('/notes/1');
      expect(result).toEqual({ id: '1', title: 'Note 1' });
    });

    it('throws on failure', async () => {
      apiClient.get.mockRejectedValueOnce(new Error('fail'));

      await expect(getNoteById('1')).rejects.toThrow('Something went wrong. Please try again.');
    });
  });

  describe('createNote', () => {
    it('creates a note and returns it', async () => {
      apiClient.post.mockResolvedValueOnce({ data: { id: '2', title: 'New Note' } });

      const result = await createNote({ title: 'New Note', content: 'Content' });

      expect(apiClient.post).toHaveBeenCalledWith('/notes', {
        title: 'New Note',
        content: 'Content',
      });
      expect(result).toEqual({ id: '2', title: 'New Note' });
    });

    it('throws on failure', async () => {
      apiClient.post.mockRejectedValueOnce({
        response: { data: { message: 'Title is required' } },
      });

      await expect(createNote({ title: '', content: '' })).rejects.toThrow('Title is required');
    });
  });

  describe('updateNote', () => {
    it('updates a note and returns it', async () => {
      apiClient.put.mockResolvedValueOnce({ data: { id: '1', title: 'Updated' } });

      const result = await updateNote('1', { title: 'Updated', content: 'New content' });

      expect(apiClient.put).toHaveBeenCalledWith('/notes/1', {
        title: 'Updated',
        content: 'New content',
      });
      expect(result).toEqual({ id: '1', title: 'Updated' });
    });

    it('throws on failure', async () => {
      apiClient.put.mockRejectedValueOnce(new Error('fail'));

      await expect(updateNote('1', { title: 'x', content: 'y' })).rejects.toThrow(
        'Something went wrong. Please try again.'
      );
    });
  });

  describe('deleteNote', () => {
    it('deletes a note successfully', async () => {
      apiClient.delete.mockResolvedValueOnce({ data: { success: true } });

      const result = await deleteNote('1');

      expect(apiClient.delete).toHaveBeenCalledWith('/notes/1');
      expect(result).toEqual({ success: true });
    });

    it('throws on failure', async () => {
      apiClient.delete.mockRejectedValueOnce(new Error('fail'));

      await expect(deleteNote('1')).rejects.toThrow('Something went wrong. Please try again.');
    });
  });
});