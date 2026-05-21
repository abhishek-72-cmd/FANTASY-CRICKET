const db = require ('../../../config/db/db.js')


// utils/carryForwardPoints.js
const getPreviousPlayerPoints = async (team_id, player_id) => {
  const [rows] = await db.query(
    `SELECT points FROM 22_match_players
     WHERE team_id = ? AND player_id = ? AND points IS NOT NULL
     ORDER BY created_at DESC LIMIT 1`,
    [team_id, player_id]
  );
  return rows.length ? rows[0].points : null;
};

module.exports = getPreviousPlayerPoints
