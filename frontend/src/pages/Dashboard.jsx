import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

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

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') setMenuOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

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
    setMenuOpen(false);
    try {
      await logout();
    } catch {
      // proceed to login regardless
    } finally {
      navigate('/login');
    }
  }

  const avatarInitial = user?.name ? user.name.trim()[0].toUpperCase() : '';

  return (
    <div className="min-h-screen bg-paper font-body dark:bg-ink transition-colors">
      <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-paper-line bg-white px-4 py-3 sm:px-8 sm:py-4 dark:border-slate-800 dark:bg-ink-soft">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2.5"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gold/60 font-mono text-xs text-gold">
            I
          </div>
          <span className="font-display text-lg text-ink dark:text-white">Inkwell</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            type="button"
            onClick={() => setDark(!dark)}
            className="rounded-full p-2 text-ink-muted hover:bg-paper-soft dark:text-slate-400 dark:hover:bg-ink transition"
            aria-label="Toggle dark mode"
          >
            {dark ? '☀️' : '🌙'}
          </button>

          {/* Profile dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 text-sm text-ink-muted hover:bg-paper-soft dark:text-slate-400 dark:hover:bg-ink transition"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink font-display text-xs text-gold dark:bg-slate-700">
                {avatarInitial}
              </span>
              <svg
                className={`h-3.5 w-3.5 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-paper-line bg-white shadow-lg dark:border-slate-700 dark:bg-ink-soft"
              >
                <div className="border-b border-paper-line px-4 py-3 dark:border-slate-700">
                  <p className="truncate text-sm font-medium text-ink dark:text-white">{user?.name}</p>
                  <p className="truncate text-xs text-ink-muted dark:text-slate-400">{user?.email}</p>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/profile');
                  }}
                  className="block w-full px-4 py-2.5 text-left text-sm text-ink hover:bg-paper-soft dark:text-slate-200 dark:hover:bg-ink transition"
                >
                  Profile
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="block w-full px-4 py-2.5 text-left text-sm text-danger hover:bg-danger-light dark:hover:bg-danger/10 transition"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl text-ink dark:text-white sm:text-2xl">Your notes</h2>
            <p className="mt-1 font-mono text-xs uppercase tracking-wide text-ink-muted dark:text-slate-500">
              {notes.length} note{notes.length === 1 ? '' : 's'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/notes/new')}
            className="w-full rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-white hover:bg-gold-dark transition sm:w-auto"
          >
            + New note
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-danger/20 bg-danger-light px-4 py-3 text-sm text-danger dark:bg-danger/10"
          >
            {error}
          </div>
        )}

        {loading ? (
          <p className="font-mono text-sm text-ink-muted dark:text-slate-500">Loading your notes…</p>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-paper-line px-6 py-16 text-center dark:border-slate-700 sm:py-24">
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