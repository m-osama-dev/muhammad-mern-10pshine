import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function initials(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function Profile() {
  const { user, loading, logout, updateProfile, dark, setDark } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [loading, user, navigate]);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  if (loading || !user) return null;

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Name cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ name: trimmedName });
      setName(trimmedName);
      setSuccess('Profile updated successfully.');
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

 async function handleLogout() {
    try {
      await logout();
    } catch {
      // even if server-side logout fails, we still proceed to
      // clear the session locally and send the user to login
    } finally {
      navigate('/login');
    }
  }

  return (
    <div className="min-h-screen bg-paper font-body dark:bg-ink transition-colors">

      {/* Navbar */}
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
            onClick={handleLogout}
            className="rounded-lg border border-paper-line px-4 py-1.5 text-sm text-ink-muted hover:border-danger hover:text-danger dark:border-slate-700 dark:text-slate-400 dark:hover:border-danger dark:hover:text-danger transition"
          >
            Log out
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-xl px-6 py-12">

        {/* Profile card */}
        <div className="rounded-2xl border border-paper-line bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-ink-soft">

          {/* Avatar + name header */}
          <div className="flex items-center gap-5 border-b border-paper-line pb-6 dark:border-slate-700">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink dark:bg-slate-700 font-display text-xl text-gold">
              {initials(user.name)}
            </div>
            <div>
              <h2 className="font-display text-xl text-ink dark:text-white">{user.name}</h2>
              <p className="mt-0.5 text-sm text-ink-muted dark:text-slate-400">{user.email}</p>
            </div>
          </div>

          {/* Feedback messages */}
          {error && (
            <div role="alert" className="mt-5 rounded-lg border border-danger/20 bg-danger-light dark:bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}
          {success && (
            <div role="status" className="mt-5 rounded-lg border border-teal/20 bg-teal/5 px-4 py-3 text-sm text-teal">
              {success}
            </div>
          )}

          {/* Edit form or read-only view */}
          {editing ? (
            <form onSubmit={handleSave} noValidate className="mt-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="profile-name" className="text-sm font-medium text-ink dark:text-slate-200">
                  Full name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border border-paper-line bg-paper px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none dark:border-slate-700 dark:bg-ink dark:text-white dark:focus:border-gold transition"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink dark:text-slate-200">Email</label>
                <div className="rounded-xl border border-paper-line bg-paper-soft px-4 py-3 text-sm text-ink-muted dark:border-slate-700 dark:bg-ink dark:text-slate-500 cursor-not-allowed">
                  {user.email}
                  <span className="ml-2 text-xs text-stone-300 dark:text-slate-600">(cannot be changed)</span>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-white hover:bg-gold-dark disabled:opacity-50 transition"
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditing(false); setName(user.name); setError(''); }}
                  className="rounded-xl border border-paper-line px-5 py-2.5 text-sm text-ink-muted hover:border-gold hover:text-ink dark:border-slate-700 dark:text-slate-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-6">
              <p className="font-mono text-xs uppercase tracking-widest text-ink-muted dark:text-slate-500">
                Member since {formatDate(user.createdAt)}
              </p>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="mt-5 rounded-xl border border-paper-line px-5 py-2.5 text-sm text-ink-muted hover:border-gold hover:text-ink dark:border-slate-700 dark:text-slate-400 dark:hover:text-white transition"
              >
                Edit profile
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
