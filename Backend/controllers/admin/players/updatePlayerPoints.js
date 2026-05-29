const db = require('../../../config/db/db.js');

const updatePlayersPoints = async (req, res) => {
  const { match_id } = req.params;
  const { pointsData } = req.body;

  if (!match_id || !Array.isArray(pointsData)) {
    return res.status(400).json({ message: 'Invalid match_id or credit points data' });
  }

  try {
    const [[fixture]] = await db.query(
      `SELECT league_id, is_activated FROM fixtures WHERE id = ?`,
      [match_id]
    );

    if (!fixture) {
      return res.status(404).json({ message: 'Fixture not found' });
    }

    if (Number(fixture.is_activated) === 1) {
      return res.status(403).json({
        message: 'Match is activated. Credit points are locked.',
      });
    }

    let updatedCount = 0;
    const missingPlayers = [];

    for (const row of pointsData) {
      const player_id = row.player_id;
      const creditPoints = Number(row.credit_points ?? row.points);

      if (!player_id || Number.isNaN(creditPoints)) {
        missingPlayers.push({ player_id, reason: 'Invalid player_id or credit_points' });
        continue;
      }

      const [[player]] = await db.query(
        `SELECT player_id, team_id, position
         FROM players
         WHERE player_id = ?`,
        [player_id]
      );

      if (!player) {
        missingPlayers.push({ player_id, reason: 'Player not found in players table' });
        continue;
      }

      await db.query(
        `INSERT INTO player_points_cache
          (player_id, team_id, league_id, last_known_credit_points, last_known_points, position)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           last_known_credit_points = VALUES(last_known_credit_points),
           last_known_points = VALUES(last_known_points),
           team_id = VALUES(team_id),
           position = VALUES(position)`,
        [
          player_id,
          player.team_id,
          fixture.league_id || 0,
          creditPoints,
          creditPoints,
          player.position || null,
        ]
      );

      updatedCount++;
    }

    return res.status(200).json({
      message: 'Credit points updated successfully',
      updatedCount,
      missingPlayers,
    });
  } catch (err) {
    console.error('Error in updatePlayersPoints:', err);
    return res.status(500).json({ message: 'Failed to update credit points', error: err.message });
  }
};

module.exports = updatePlayersPoints;
