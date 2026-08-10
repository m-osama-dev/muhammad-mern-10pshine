import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as noteService from '../services/noteService';
import NoteCard from '../components/NoteCard';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Dashboard() {
  const { user, logout, dark, setDark } = useAuth();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noteToDelete, setNoteToDelete] = useState(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await noteService.getNotes();
      setNotes(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

async function confirmDelete() {
    const id = noteToDelete;
    setNoteToDelete(null);
    try {
      await noteService.deleteNote(id);
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // proceed to login regardless
    } finally {
      navigate('/login');
    }
  }

  return (
    <div className="min-h-screen bg-paper font-body dark:bg-ink transition-colors">
      <nav className="flex items-center justify-between border-b border-paper-line bg-white px-8 py-4 dark:border-slate-800 dark:bg-ink-soft">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gold/60 font-mono text-xs text-gold">
            I
          </div>
          <span className="font-display text-lg text-ink dark:text-white">Inkwell</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDark(!dark)}
            className="rounded-full p-2 text-ink-muted hover:bg-paper-soft dark:text-slate-400 dark:hover:bg-ink transition"
            aria-label="Toggle dark mode"
          >
            {dark ? '☀️' : '🌙'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="text-sm text-ink-muted hover:text-ink dark:text-slate-400 dark:hover:text-white transition"
          >
            {user?.name}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-paper-line px-4 py-1.5 text-sm text-ink-muted hover:border-danger hover:text-danger dark:border-slate-700 dark:text-slate-400 transition"
          >
            Log out
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-ink dark:text-white">Your notes</h2>
            <p className="mt-1 font-mono text-xs uppercase tracking-wide text-ink-muted dark:text-slate-500">
              {notes.length} note{notes.length === 1 ? '' : 's'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/notes/new')}
            className="rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-white hover:bg-gold-dark transition"
          >
            + New note
          </button>
        </div>

        {error && (
          <div role="alert" className="mb-6 rounded-lg border border-danger/20 bg-danger-light dark:bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        {loading ? (
          <p className="font-mono text-sm text-ink-muted dark:text-slate-500">Loading your notes…</p>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-paper-line py-24 text-center dark:border-slate-700">
            <p className="text-ink-muted dark:text-slate-400">No notes yet. Start with your first one.</p>
            <button
              type="button"
              onClick={() => navigate('/notes/new')}
              className="rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-white hover:bg-gold-dark transition"
            >
              Create a note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onOpen={(id) => navigate(`/notes/${id}`)}
                onDelete={(id) => setNoteToDelete(id)}
              />
            ))}
          </div>
        )}
      </main>

      <ConfirmDialog
        open={Boolean(noteToDelete)}
        title="Delete this note?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setNoteToDelete(null)}
      />
    </div>
  );
}