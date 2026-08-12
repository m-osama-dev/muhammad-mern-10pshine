import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, dark, setDark } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    const emailPattern = /^\S+@\S+\.\S+$/;
    if (!emailPattern.test(email)) {
      setError('Enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen font-body bg-paper dark:bg-ink">

      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-ink dark:bg-ink-soft p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink-soft to-[#0a0f1e] opacity-90" />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute -bottom-24 -right-12 w-80 h-80 rounded-full bg-teal/5 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/60 text-sm font-mono text-gold">
              I
            </div>
            <span className="font-display text-xl text-white">Inkwell</span>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="font-display text-4xl font-medium leading-tight text-white">
            Pick up right<br />where you left off.
          </h1>
          <p className="mt-4 text-slate-400 leading-relaxed max-w-xs">
            Every note, organized and waiting — log back in and get straight to it.
          </p>
        </div>

        <div className="relative z-10 font-mono text-xs uppercase tracking-widest text-slate-600">
          Cohort 9 · Notes App By M Osama 10Pearls
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-paper dark:bg-ink">

        <button
          type="button"
          onClick={() => setDark(!dark)}
          className="absolute top-5 right-5 rounded-full p-2 text-ink-muted hover:bg-paper-soft dark:text-slate-400 dark:hover:bg-ink-soft transition"
          aria-label="Toggle dark mode"
        >
          {dark ? '☀️' : '🌙'}
        </button>

        <div className="w-full max-w-sm">
          <span className="block font-mono text-xs uppercase tracking-widest text-gold mb-2">
            Welcome back
          </span>
          <h2 className="font-display text-3xl font-medium text-ink dark:text-white">
            Log in
          </h2>
          <p className="mt-2 text-sm text-ink-muted dark:text-slate-400">
            Enter your details to access your notes.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-4">
            {error && (
              <div role="alert" className="rounded-lg border border-danger/20 bg-danger-light dark:bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-ink dark:text-slate-200">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-xl border border-paper-line bg-white px-4 py-3 text-sm text-ink placeholder:text-stone-300 focus:border-gold focus:outline-none dark:border-slate-700 dark:bg-ink-soft dark:text-white dark:placeholder:text-slate-600 dark:focus:border-gold transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-ink dark:text-slate-200">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="rounded-xl border border-paper-line bg-white px-4 py-3 text-sm text-ink placeholder:text-stone-300 focus:border-gold focus:outline-none dark:border-slate-700 dark:bg-ink-soft dark:text-white dark:placeholder:text-slate-600 dark:focus:border-gold transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 rounded-xl bg-gold py-3 text-sm font-semibold text-white hover:bg-gold-dark disabled:opacity-50 transition"
            >
              {submitting ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-muted dark:text-slate-400">
            New here?{' '}
            <Link to="/signup" className="font-medium text-gold hover:text-gold-dark">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
