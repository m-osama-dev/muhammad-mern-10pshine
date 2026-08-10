import React from 'react';
import PropTypes from 'prop-types';

function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html || '';
  return div.textContent || div.innerText || '';
}

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function NoteCard({ note, onOpen, onDelete }) {
  const preview = stripHtml(note.content).slice(0, 140);

  return (
    <div
      onClick={() => onOpen(note._id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpen(note._id);
      }}
      className="group cursor-pointer rounded-2xl border border-paper-line bg-white p-5 transition hover:border-gold hover:shadow-md dark:border-slate-800 dark:bg-ink-soft dark:hover:border-gold"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-lg text-ink line-clamp-1 dark:text-white">
          {note.title}
        </h3>
        <button
          type="button"
          aria-label={`Delete ${note.title}`}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note._id);
          }}
          className="shrink-0 rounded-full px-2 text-lg leading-none text-stone-300 opacity-0 transition hover:bg-danger-light hover:text-danger group-hover:opacity-100 dark:text-slate-600 dark:hover:bg-danger/10"
        >
          ×
        </button>
      </div>
      <p className="mt-2 line-clamp-3 text-sm text-ink-muted dark:text-slate-400">
        {preview || 'No content yet.'}
      </p>
      <span className="mt-3 block font-mono text-xs uppercase tracking-wide text-stone-400 dark:text-slate-600">
        {formatDate(note.updatedAt)}
      </span>
    </div>
  );
}

NoteCard.propTypes = {
  note: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string,
    updatedAt: PropTypes.string,
  }).isRequired,
  onOpen: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};