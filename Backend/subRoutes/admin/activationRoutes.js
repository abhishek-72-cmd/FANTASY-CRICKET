const express = require('express');
const router =  express.Router();


const activateMatch = require('../../controllers/admin/matches/activation/activateMatch.js');
const fetchActivationStatus = require('../../controllers/admin/matches/activation/fetchActivationStatus .js');
const checkAdmin = require('../../middlewares/checkAdmin.js');

router.post('/admin/activate-match/:matchId', checkAdmin, activateMatch)
router.get('/admin/activation-status/:matchId', fetchActivationStatus)


module.exports = router;
