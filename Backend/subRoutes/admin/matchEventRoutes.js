const express = require('express');
const router =  express.Router();



const matchEventsHandler = require('../../controllers/admin/matches/events/matchEventsPerBall');
const fetchAndDumpMatch = require('../../controllers/admin/_depricate/fetchAndDumpMatch');


router.post('/fetch-match-events/:matchId', matchEventsHandler);
router.post('/dump-match-data/:matchId', fetchAndDumpMatch);


module.exports = router;
