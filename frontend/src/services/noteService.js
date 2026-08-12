import { apiClient } from './api';

function extractError(error) {
  return error?.response?.data?.message || 'Something went wrong. Please try again.';
}

export async function getNotes() {
  try {
    const res = await apiClient.get('/notes');
    return res.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
}

export async function getNoteById(id) {
  try {
    const res = await apiClient.get(`/notes/${id}`);
    return res.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
}

export async function createNote({ title, content }) {
  try {
    const res = await apiClient.post('/notes', { title, content });
    return res.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
}

export async function updateNote(id, { title, content }) {
  try {
    const res = await apiClient.put(`/notes/${id}`, { title, content });
    return res.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
}

export async function deleteNote(id) {
  try {
    const res = await apiClient.delete(`/notes/${id}`);
    return res.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
}