require('dotenv').config();
const db = require('../../config/db/db');



const calculateUserTeamPoints = async (req, res) => {
  const { matchId } = req.params;

  if (!matchId) {
    return res.status(400).json({ message: 'matchId is required' });
  }

  try {
    const [userTeams] = await db.query(
      'SELECT * FROM user_teams WHERE match_id = ?',
      [matchId]
    );

    if (!userTeams.length) {
      return res.status(404).json({ message: 'No user teams found for this match' });
    }

    const [playerPointsRows] = await db.query(
      'SELECT player_id, points FROM player_match_points WHERE match_id = ?',
      [matchId]
    );

    const playerPointsMap = {};
    playerPointsRows.forEach(row => {
      playerPointsMap[row.player_id] = row.points;
    });

    const results = [];

    for (const team of userTeams) {
      const players = JSON.parse(team.players);

      let totalPoints = 0;

      for (const p of players) {
        const playerId = parseInt(p.playerId, 10);
        const role = p.role;

        const basePoints = playerPointsMap[playerId] || 0;

        let multiplier = 1;
        if (role === 'Captain') multiplier = 2;
        else if (role === 'Vice Captain') multiplier = 1.5;

        totalPoints += basePoints * multiplier;
      }

      results.push({
        user_id: team.user_id,
        match_id: matchId,
        user_team_id: team.id,
        total_points: totalPoints
      });

      // Optional: save in DB
      await db.query(
        `INSERT INTO user_team_points (user_team_id, match_id, user_id, points)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE points = ?`,
        [team.id, matchId, team.user_id, totalPoints, totalPoints]
      );
    }

    res.json({
      message: `Calculated user team points for match ${matchId}`,
      results
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to calculate user team points', error: err.message });
  }
};

module.exports = calculateUserTeamPoints;
