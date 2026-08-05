const express = require('express');
const authRoutes = require('./authRoutes');
const noteRoutes = require('./noteRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/notes', noteRoutes);

module.exports = router;
