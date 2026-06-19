const express = require('express');
const router = express.Router();


//path
// const getUpcomingMatches = require('../../controllers/FetchFromDB/getUpcomingMatches');
 const getFixtures = require ('../../controllers/admin/matches/fixtures/getFixturesFromDb.js');
 const fixturesCopy = require('../../controllers/admin/_depricate/fixturesCopy.js');
const saveFixtures = require ('../../controllers/admin/matches/fixtures/saveFixturesToDb.js');
const authanticate = require ('../../middlewares/authanticate.js');
const savePlayersForFinishedFixtures = require('../../controllers/admin/matches/fixtures/savePlayersForFinishedFixtures.js');



// prev 
//${API_URL}/api/admin/fixtures(use any of the route)


//route
// router.get('/get_upcomingMatches', getUpcomingMatches)
router.get ('/FetchFromDB/getFixtures',getFixtures)
router.post('/admin/savefixtures',authanticate, saveFixtures )
router.get('/admin/copy_fixture', fixturesCopy )
router.get('/admin/status/finished', savePlayersForFinishedFixtures)


module.exports = router;