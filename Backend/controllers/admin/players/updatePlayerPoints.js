
const express = require ('express');
const db = require ('../../../config/db/db.js')

const updatePlayersPoints = async (req, res) => {
  const { match_id } = req.params;
  const { pointsData } = req.body;

  if (!match_id || !Array.isArray(pointsData)) {
    return res.status(400).json({ message: 'Invalid match_id or points data' });
  }

  try {
    for (const { player_id, points } of pointsData) {
      await db.query(
        `UPDATE 22_match_players SET points = ? WHERE match_id = ? AND player_id = ?`,
        [points, match_id, player_id]
      );

      const [[player]] = await db.query(
        `SELECT team_id, position FROM 22_match_players WHERE match_id = ? AND player_id = ?`,
        [match_id, player_id]
      );

      if (player?.team_id) {
        console.log(`Caching points:`, {
          player_id,
          team_id: player.team_id,
          position: player.position,
          last_known_points: points
        });

        await db.query(
          `INSERT INTO player_points_cache (player_id, team_id, last_known_points, position)
           VALUES (?, ?, ?, ?)  
           ON DUPLICATE KEY UPDATE 
             last_known_points = VALUES(last_known_points),
             team_id = VALUES(team_id),
             position = VALUES(position)`,
          [player_id, player.team_id, points, player.position || null]
        );
      } else {
        console.warn(`No team_id found for player_id=${player_id} in match_id=${match_id}`);
      }
    }

    return res.status(200).json({ message: 'Points updated successfully' });
  } catch (err) {
    console.error('Error in updatePlayersPoints:', err);
    return res.status(500).json({ message: 'Failed to update points', error: err.message });
  }
};


module.exports = updatePlayersPoints