const express = require('express');
const router =  express.Router();
const savePlayers = require('../../controllers/admin/players/savePlayers.js')
const getOrFetchPlayers = require('../../controllers/admin/players/getOrFetchPlayers.js');
const { save22PlayersHandler } = require('../../controllers/admin/players/save22players.js')
const getplayers = require ('../../controllers/admin/players/getplayers.js')
const updatepoints = require ('../../controllers/admin/players/updatePlayerPoints.js')


router.post('/fetch-squads/:match_id',savePlayers)
router.get('/get-or-fetch-players/:match_id', getOrFetchPlayers);
router.post('/fetch-22-players/:match_id', save22PlayersHandler);
router.get('/fetch-players/:match_id',getplayers)
router.post('/update-points/:match_id', updatepoints)

module.exports = router;
