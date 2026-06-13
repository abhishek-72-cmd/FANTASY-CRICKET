require('dotenv').config();
const db = require('../../../config/db/db');
const axios = require('axios');

const savePlayersForFixture = async (match_id) => {
  const [fixtureRows] = await db.query(
    'SELECT league_id, localteam_id, visitorteam_id, season_id FROM fixtures WHERE id = ?',
    [match_id]
  );

  if (fixtureRows.length === 0) {
    throw new Error('Match not found');
  }

  const fixture = fixtureRows[0];
  const { league_id, localteam_id, visitorteam_id, season_id } = fixture;

  if (!season_id) {
    throw new Error('Season ID missing for this match');
  }

  const api_token = process.env.CRICKET_API_KEY;

  const fetchAndSaveTeam = async (teamId) => {
    const response = await axios.get(
      `https://cricket.sportmonks.com/api/v2.0/teams/${teamId}/squad/${season_id}`,
      { params: { api_token }, timeout: 20000 }
    );

    const players = response.data.data.squad;

    for (const player of players) {
      await db.query(
        `INSERT INTO players
         (player_id, team_id, season_id, fullname, position, image_path, battingstyle, bowlingstyle)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           team_id = VALUES(team_id),
           season_id = VALUES(season_id),
           fullname = VALUES(fullname),
           position = VALUES(position),
           image_path = VALUES(image_path),
           battingstyle = VALUES(battingstyle),
           bowlingstyle = VALUES(bowlingstyle)`,
        [
          player.id,
          teamId,
          season_id,
          player.fullname,
          player.position?.name || null,
          player.image_path,
          player.battingstyle,
          player.bowlingstyle
        ]
      );

      await db.query(
        `INSERT INTO player_points_cache
         (player_id, team_id, league_id, last_known_credit_points, last_known_points, position)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           team_id = VALUES(team_id),
           position = VALUES(position)`,
        [
          player.id,
          teamId,
          league_id || 0,
          player.credit_points ?? 0,
          player.credit_points ?? 0,
          player.position?.name || null
        ]
      );
    }
  };

  await fetchAndSaveTeam(localteam_id);
  await fetchAndSaveTeam(visitorteam_id);

  return true;
};

module.exports = savePlayersForFixture;
