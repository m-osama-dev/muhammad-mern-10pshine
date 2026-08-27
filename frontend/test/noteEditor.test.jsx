import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import NoteEditor from '../src/pages/NoteEditor';
import * as noteService from '../src/services/noteService';

jest.mock('../src/services/noteService');

// ReactQuill relies on browser APIs not available in jsdom; replace it with
// a simple textarea-like stand-in that still calls onChange.
jest.mock('react-quill-new', () => {
  return function MockReactQuill({ value, onChange, placeholder }) {
    return (
      <textarea
        aria-label="note content"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };
});

function renderWithRoute(route) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/notes/:id" element={<NoteEditor />} />
      </Routes>
    </MemoryRouter>
  );
}

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('NoteEditor page', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('creating a new note', () => {
    it('renders an empty form for a new note', () => {
      renderWithRoute('/notes/new');

      expect(screen.getByPlaceholderText(/note title/i)).toHaveValue('');
      expect(screen.getByRole('button', { name: /save note/i })).toBeInTheDocument();
    });

    it('shows an error when saving without a title', async () => {
      const user = userEvent.setup();
      renderWithRoute('/notes/new');

      await user.click(screen.getByRole('button', { name: /save note/i }));

      expect(await screen.findByRole('alert')).toHaveTextContent(/give your note a title/i);
      expect(noteService.createNote).not.toHaveBeenCalled();
    });

    it('creates a note and navigates to dashboard on save', async () => {
      noteService.createNote.mockResolvedValue({ success: true, data: { _id: '1' } });

      const user = userEvent.setup();
      renderWithRoute('/notes/new');

      await user.type(screen.getByPlaceholderText(/note title/i), 'My New Note');
      await user.click(screen.getByRole('button', { name: /save note/i }));

      await waitFor(() => {
        expect(noteService.createNote).toHaveBeenCalledWith({
          title: 'My New Note',
          content: '',
        });
      });
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('shows an error message if create fails', async () => {
      noteService.createNote.mockRejectedValue(new Error('Could not save note'));

      const user = userEvent.setup();
      renderWithRoute('/notes/new');

      await user.type(screen.getByPlaceholderText(/note title/i), 'My New Note');
      await user.click(screen.getByRole('button', { name: /save note/i }));

      expect(await screen.findByRole('alert')).toHaveTextContent(/could not save note/i);
    });

    it('navigates to dashboard when Cancel is clicked', async () => {
      const user = userEvent.setup();
      renderWithRoute('/notes/new');

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('editing an existing note', () => {
    it('shows a loading state while fetching the note', () => {
      noteService.getNoteById.mockImplementation(() => new Promise(() => {}));

      renderWithRoute('/notes/abc123');

      expect(screen.getByText(/loading note/i)).toBeInTheDocument();
    });

    it('loads and displays an existing note', async () => {
      noteService.getNoteById.mockResolvedValue({
        success: true,
        data: { title: 'Existing Note', content: 'Some content' },
      });

      renderWithRoute('/notes/abc123');

      expect(await screen.findByDisplayValue('Existing Note')).toBeInTheDocument();
      expect(noteService.getNoteById).toHaveBeenCalledWith('abc123');
    });

    it('updates an existing note and navigates to dashboard on save', async () => {
      noteService.getNoteById.mockResolvedValue({
        success: true,
        data: { title: 'Existing Note', content: 'Some content' },
      });
      noteService.updateNote.mockResolvedValue({ success: true });

      const user = userEvent.setup();
      renderWithRoute('/notes/abc123');

      await screen.findByDisplayValue('Existing Note');
      await user.click(screen.getByRole('button', { name: /save note/i }));

      await waitFor(() => {
        expect(noteService.updateNote).toHaveBeenCalledWith('abc123', {
          title: 'Existing Note',
          content: 'Some content',
        });
      });
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('shows an error message if loading the note fails', async () => {
      noteService.getNoteById.mockRejectedValue(new Error('Note not found'));

      renderWithRoute('/notes/abc123');

      expect(await screen.findByRole('alert')).toHaveTextContent(/note not found/i);
    });
  });
});