const express = require('express');
const router =  express.Router();


const {calculateAllPoints} = require('../../controllers/admin/pointCalculation/calculateAllPoints.js');
const calculateUserTeamPoints  = require('../../sportmonks/_deprecated/calculateUserTeamPoints.js');
const getpoints = require('../../controllers/admin/pointCalculation/getPoints.js');


router.post('/calculate-points/:matchId', calculateAllPoints)
router.post('/calculate-user-team-points/:matchId', calculateUserTeamPoints);
router.get ('/get-points/:matchId', getpoints)


module.exports = router;
