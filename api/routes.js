const express = require('express');
const router = express.Router();

// Import route handlers
const authRoutes = require('./auth');
const leadershipRoutes = require('./leadership');
const resourcesRoutes = require('./resources');
const storeRoutes = require('./store');
const galleryRoutes = require('./gallery');
const studentProjectsRoutes = require('./student-projects');
const eventsRoutes = require('./events');
const announcementsRoutes = require('./announcements');
const usersRoutes = require('./users');
const homeRoutes = require('./home');
const executivesRoutes = require('./executives');

// Route grouping keeps each content type in its own file while exposing one
// /api namespace to the frontend.
router.use('/auth', authRoutes);
router.use('/leadership', leadershipRoutes);
router.use('/resources', resourcesRoutes);
router.use('/store', storeRoutes);
router.use('/gallery', galleryRoutes);
router.use('/student-projects', studentProjectsRoutes);
router.use('/events', eventsRoutes);
router.use('/announcements', announcementsRoutes);
router.use('/users', usersRoutes);
router.use('/home', homeRoutes);
router.use('/executives', executivesRoutes);

module.exports = router;
