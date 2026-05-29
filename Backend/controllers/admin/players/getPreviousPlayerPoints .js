const db = require ('../../../config/db/db.js')


const getPreviousPlayerPoints = async (team_id, player_id) => {
  const [rows] = await db.query(
    `SELECT last_known_credit_points
     FROM player_points_cache
     WHERE team_id = ? AND player_id = ? AND last_known_credit_points IS NOT NULL
     ORDER BY updated_at DESC LIMIT 1`,
    [team_id, player_id]
  );
  return rows.length ? rows[0].last_known_credit_points : null;
};

module.exports = getPreviousPlayerPoints
