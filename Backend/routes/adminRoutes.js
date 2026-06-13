
const express = require('express');
const router = express.Router();



router.use('/auth', require('../subRoutes/admin/adminAuthRoutes'));
router.use('/sync', require('../subRoutes/admin/allSyncRoutes'));
router.use('/points', require('../subRoutes/admin/calculatePointRoute'));
router.use('/contests', require('../subRoutes/admin/contestRoutes'));
router.use('/fixtures', require('../subRoutes/admin/fixturesRoutes'));
router.use('/match-events', require('../subRoutes/admin/matchEventRoutes'));
router.use('/squads', require('../subRoutes/admin/squadRoutes'));
router.use ('/activation', require('../subRoutes/admin/activationRoutes.js'),)
router.use('/automation', require('../subRoutes/admin/automationRoutes.js'))

 
module.exports = router;