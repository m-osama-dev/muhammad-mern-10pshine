import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import * as noteService from '../services/noteService';

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'link'],
    ['clean'],
  ],
};

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNew) return;

    async function loadNote() {
      setLoading(true);
      setError('');
      try {
        const res = await noteService.getNoteById(id);
        setTitle(res.data.title);
        setContent(res.data.content);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadNote();
  }, [id, isNew]);

  async function handleSave() {
    setError('');

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Give your note a title before saving.');
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        await noteService.createNote({ title: trimmedTitle, content });
      } else {
        await noteService.updateNote(id, { title: trimmedTitle, content });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    navigate('/dashboard');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-paper font-body dark:bg-ink">
        <main className="mx-auto max-w-3xl px-6 py-12">
          <p className="font-mono text-sm text-ink-muted dark:text-slate-500">Loading note…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper font-body dark:bg-ink transition-colors">
      <nav className="flex items-center border-b border-paper-line bg-white px-8 py-4 dark:border-slate-800 dark:bg-ink-soft">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gold/60 font-mono text-xs text-gold">
            I
          </div>
          <span className="font-display text-lg text-ink dark:text-white">Inkwell</span>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-2xl border border-paper-line bg-white p-6 dark:border-slate-800 dark:bg-ink-soft">
          {error && (
            <div role="alert" className="mb-5 rounded-lg border border-danger/20 bg-danger-light dark:bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-0 border-b border-paper-line bg-transparent pb-3 font-display text-2xl text-ink placeholder:text-stone-300 focus:border-gold focus:outline-none dark:border-slate-700 dark:text-white dark:placeholder:text-slate-600"
          />

          <div className="editor-quill mt-4">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={QUILL_MODULES}
              placeholder="Start writing…"
            />
          </div>

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-white hover:bg-gold-dark disabled:opacity-50 transition"
            >
              {saving ? 'Saving…' : 'Save note'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-xl border border-paper-line px-5 py-2.5 text-sm text-ink-muted hover:border-gold hover:text-ink dark:border-slate-700 dark:text-slate-400 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}