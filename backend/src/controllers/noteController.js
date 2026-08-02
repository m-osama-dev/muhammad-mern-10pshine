const Note = require('../models/Note');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const logger = require('../config/logger');

const getNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({ user: req.user.id }).sort({ updatedAt: -1 });
  res.status(200).json({ success: true, count: notes.length, data: notes });
});

const getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
  if (!note) {
    throw new AppError('Note not found', 404);
  }
  res.status(200).json({ success: true, data: note });
});

const createNote = asyncHandler(async (req, res) => {
  const { title, content } = req.body;

  if (!title) {
    throw new AppError('Title is required', 400);
  }

  const note = await Note.create({
    title,
    content: content || '',
    user: req.user.id,
  });

  logger.info({ userId: req.user.id, noteId: note.id }, 'Note created');

  res.status(201).json({ success: true, data: note });
});

const updateNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
  if (!note) {
    throw new AppError('Note not found', 404);
  }

  const { title, content } = req.body;
  if (title !== undefined) note.title = title;
  if (content !== undefined) note.content = content;

  await note.save();

  logger.info({ userId: req.user.id, noteId: note.id }, 'Note updated');

  res.status(200).json({ success: true, data: note });
});

const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
  if (!note) {
    throw new AppError('Note not found', 404);
  }

  await note.deleteOne();

  logger.info({ userId: req.user.id, noteId: req.params.id }, 'Note deleted');

  res.status(200).json({ success: true, message: 'Note deleted successfully' });
});

module.exports = { getNotes, getNoteById, createNote, updateNote, deleteNote };
