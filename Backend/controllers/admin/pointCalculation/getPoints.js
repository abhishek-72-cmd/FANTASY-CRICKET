const db = require('../../../config/db/db.js');

const getpoints = async (req, res) => {
  const matchId = req.params.matchId;

  try {
    const [[fixture]] = await db.query(
      `SELECT league_id, localteam_id, visitorteam_id FROM fixtures WHERE id = ?`,
      [matchId]
    );

    if (!fixture) {
      return res.status(404).json({ message: 'Fixture not found' });
    }

    const [[finalRows]] = await db.query(
      `SELECT COUNT(*) AS count FROM 22_match_players WHERE match_id = ?`,
      [matchId]
    );

    const useFinalLineup = Number(finalRows?.count || 0) > 0;

    const [rows] = useFinalLineup
      ? await db.query(
          `SELECT
             COUNT(*) AS totalPlayers,
             SUM(CASE WHEN ppc.last_known_credit_points IS NOT NULL AND ppc.last_known_credit_points > 0 THEN 1 ELSE 0 END) AS playersWithCredits
           FROM 22_match_players mp
           LEFT JOIN player_points_cache ppc
             ON ppc.player_id = mp.player_id
            AND ppc.league_id = mp.league_id
           WHERE mp.match_id = ?`,
          [matchId]
        )
      : await db.query(
          `SELECT
             COUNT(*) AS totalPlayers,
             SUM(CASE WHEN ppc.last_known_credit_points IS NOT NULL AND ppc.last_known_credit_points > 0 THEN 1 ELSE 0 END) AS playersWithCredits
           FROM players p
           LEFT JOIN player_points_cache ppc
             ON ppc.player_id = p.player_id
            AND ppc.league_id = ?
           WHERE p.team_id IN (?, ?)`,
          [fixture.league_id, fixture.localteam_id, fixture.visitorteam_id]
        );

    const totalPlayers = Number(rows[0]?.totalPlayers || 0);
    const playersWithCredits = Number(rows[0]?.playersWithCredits || 0);

    res.json({
      pointsAvailable: totalPlayers > 0 && totalPlayers === playersWithCredits,
      totalPlayers,
      playersWithCredits,
      missingCredits: Math.max(totalPlayers - playersWithCredits, 0),
      source: useFinalLineup ? 'final_lineup' : 'tentative_squad',
    });
  } catch (err) {
    console.error('Error fetching credit points status:', err);
    res.status(500).json({ message: 'Error fetching credit points status', error: err.message });
  }
};

module.exports = getpoints;
