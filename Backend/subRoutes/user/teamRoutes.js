const express = require('express');
const router = express.Router();

const saveUserTeam = require('../../controllers/user/teams/saveUserTeams.js');
const viewUserTeams = require('../../controllers/user/teams/viewUserTeams.js');
const deleteUserTeam = require('../../controllers/user/teams/deleteUserTeam.js');
const editTeam = require ('../../controllers/user/teams/editUserTeam.js')


router.put('/edit_team/:teamId', editTeam)
router.post('/save/:matchId', saveUserTeam);
router.get("/my_teams",viewUserTeams)
router.delete('/delete/:teamId',deleteUserTeam)



router.get('/test', (req, res) => {
  res.status(200).json({ working: true });
});

module.exports = router;
