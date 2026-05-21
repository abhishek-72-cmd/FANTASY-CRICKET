const express = require('express');
const router =  express.Router();


const saveLeagues = require('../../sportmonks/dataSync/saveLeagues.js');
const saveTeams = require('../../sportmonks/dataSync/saveTeams.js');


router.post('/admin/leagues', saveLeagues  )
router.post('/admin/Teams', saveTeams  )



module.exports = router;

