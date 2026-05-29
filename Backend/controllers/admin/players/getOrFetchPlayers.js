const db = require('../../../config/db/db');
const savePlayersForFixture = require('./savePlayersForFixture');

const getOrFetchPlayers = async (req, res) => {
  const { match_id } = req.params;

  if (!match_id) {
    return res.status(400).json({ success: false, error: 'match_id is required' });
  }

  try {
    // 🔷 Step 1: Get fixture details (local & visitor team IDs)
    const [fixtureRows] = await db.query(
      'SELECT league_id, localteam_id, visitorteam_id FROM fixtures WHERE id = ?',
      [match_id]
    );

    if (!fixtureRows.length) {
      return res.status(404).json({ success: false, error: 'Fixture not found' });
    }

    const { league_id, localteam_id, visitorteam_id } = fixtureRows[0];

    // 🔷 Step 2: Helper function to get players for a team
    const getPlayersForTeam = async (teamId) => {
      const [rows] = await db.query(
        `SELECT
           p.*,
           COALESCE(ppc.last_known_credit_points, 0) AS credit_points,
           COALESCE(ppc.last_known_credit_points, 0) AS points
         FROM players p
         LEFT JOIN player_points_cache ppc
           ON ppc.player_id = p.player_id
          AND ppc.league_id = ?
         WHERE p.team_id = ?`,
        [league_id, teamId]
      );
      return rows;
    };

    let localPlayers = await getPlayersForTeam(localteam_id);
    let visitorPlayers = await getPlayersForTeam(visitorteam_id);

    // 🔷 Step 3: If any players missing → fetch from Sportmonks & save
    if (!localPlayers.length || !visitorPlayers.length) {
      console.log('📡 Players missing in DB — fetching from Sportmonks…');
      await savePlayersForFixture(match_id); // Fetch & save players
      // Re-query after saving
      localPlayers = await getPlayersForTeam(localteam_id);
      visitorPlayers = await getPlayersForTeam(visitorteam_id);
    }

    res.json({
      success: true,
      localPlayers,
      visitorPlayers
    });
  } catch (err) {
    console.error('❌ Error in getOrFetchPlayers:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = getOrFetchPlayers;
