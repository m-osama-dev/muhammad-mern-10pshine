import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import Dashboard from '../src/pages/Dashboard';
import * as api from '../src/services/api';
import * as noteService from '../src/services/noteService';

jest.mock('../src/services/api');
jest.mock('../src/services/noteService');

function renderWithProviders(ui, { route = '/dashboard' } = {}) {
  return render(
    <MemoryRouter
      initialEntries={[route]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>
  );
}

const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  createdAt: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => {
  window.localStorage.clear();
  jest.clearAllMocks();
  window.localStorage.setItem('inkwell_token', 'fake-token');
  api.getMe.mockResolvedValue({ success: true, data: mockUser });
});

describe('Dashboard page', () => {
  it('shows an empty state when there are no notes', async () => {
    noteService.getNotes.mockResolvedValue({ success: true, count: 0, data: [] });

    renderWithProviders(<Dashboard />);

    expect(await screen.findByText(/no notes yet/i)).toBeInTheDocument();
  });

  it('renders a list of notes', async () => {
    noteService.getNotes.mockResolvedValue({
      success: true,
      count: 2,
      data: [
        { _id: 'a', title: 'First note', content: '<p>Hello</p>', updatedAt: '2026-01-01T00:00:00.000Z' },
        { _id: 'b', title: 'Second note', content: '<p>World</p>', updatedAt: '2026-01-02T00:00:00.000Z' },
      ],
    });

    renderWithProviders(<Dashboard />);

    expect(await screen.findByText('First note')).toBeInTheDocument();
    expect(screen.getByText('Second note')).toBeInTheDocument();
  });

it('deletes a note after confirming in the dialog', async () => {
    noteService.getNotes.mockResolvedValue({
      success: true,
      count: 1,
      data: [{ _id: 'a', title: 'Delete me', content: '', updatedAt: '2026-01-01T00:00:00.000Z' }],
    });
    noteService.deleteNote.mockResolvedValue({ success: true });

    const user = userEvent.setup();
    renderWithProviders(<Dashboard />);

    await screen.findByText('Delete me');
    await user.click(screen.getByRole('button', { name: /delete delete me/i }));

    expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    await waitFor(() => {
      expect(noteService.deleteNote).toHaveBeenCalledWith('a');
    });
  });

  it('cancels deletion when Cancel is clicked in the dialog', async () => {
    noteService.getNotes.mockResolvedValue({
      success: true,
      count: 1,
      data: [{ _id: 'a', title: 'Keep me', content: '', updatedAt: '2026-01-01T00:00:00.000Z' }],
    });

    const user = userEvent.setup();
    renderWithProviders(<Dashboard />);

    await screen.findByText('Keep me');
    await user.click(screen.getByRole('button', { name: /delete keep me/i }));

    expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
    expect(noteService.deleteNote).not.toHaveBeenCalled();
  });

  it('shows an error message if fetching notes fails', async () => {
    noteService.getNotes.mockRejectedValue(new Error('Network error'));

    renderWithProviders(<Dashboard />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/network error/i);
  });
});