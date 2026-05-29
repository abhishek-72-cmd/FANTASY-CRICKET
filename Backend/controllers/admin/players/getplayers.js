const axios = require ('axios');
const db = require('../../../config/db/db');
const save22PlayersService = require('../players/save22players')
const savePlayersForFixture = require('./savePlayersForFixture');


// this code is updated with image pth and bowling style and getting all the players from cache 
// without refereace to its match id and team id 

// const getPlayers = async (req, res) => {
//   const { match_id } = req.params;
//   if (!match_id) return res.status(400).json({ message: 'match_id is required' });

//   // 🔹 Fetch from 22_match_players
//   const fetchFrom22MatchPlayers = async () => {
//     const [players] = await db.query(
//       `SELECT 
//          p.player_id,
//          p.team_id,
//          p.fullname,
//          p.is_substitute,
//          p.position,
//          p.points,
//          p.image_path,
//          p.battingstyle,
//          p.bowlingstyle,
//          t.name AS team_name
//        FROM 22_match_players p
//        LEFT JOIN teams t ON p.team_id = t.id
//        WHERE p.match_id = ?
//        ORDER BY p.team_id, p.fullname`,
//       [match_id]
//     );
//     return players;
//   };

//   // 🔹 Fallback from player_point_cache (no match_id used)
  
//   const fetchFromPlayerPointCache = async () => {
//     const [players] = await db.query(
//       `SELECT 
//          p.player_id,
//          p.team_id,
//          pl.fullname,
//          p.last_known_points AS points,
//          p.position,
//          pl.image_path,
//          pl.battingstyle,
//          pl.bowlingstyle,
//          t.name AS team_name
//        FROM player_points_cache p
//        JOIN players pl ON pl.player_id = p.player_id
//        LEFT JOIN teams t ON p.team_id = t.id
//        ORDER BY p.team_id, pl.fullname`
//     );
//     return players;
//   };

//   try {
//     console.log(`[getPlayers] Attempting to fetch players from 22_match_players for match_id ${match_id}`);
//     let players = await fetchFrom22MatchPlayers();
//     console.log(`[getPlayers] Found ${players.length} players in 22_match_players`);
//     let lineupStatus = 'confirmed';

//     // If not found, try fetching via API
// if (!players.length) {
//   try {
//     console.log(`[getPlayers] No players found. Calling save22PlayersService for match_id ${match_id}`);
//     const savedCount = await save22PlayersService(match_id);
//     console.log(`[getPlayers] save22PlayersService completed: ${savedCount} players saved`);
//   } catch (fetchErr) {
//     console.error('[getPlayers] Error inside save22PlayersService:', fetchErr.message);
//   }

//   players = await fetchFrom22MatchPlayers();
//   console.log(`[getPlayers] Fetched ${players.length} players from 22_match_players after save`);
// }

//     // Fallback
//     if (!players.length) {
//        console.warn('[getPlayers] Still no players in 22_match_players. Checking fallback from player_point_cache...')
//       players = await fetchFromPlayerPointCache();
//       console.log(`[getPlayers] Found ${players.length} players in player_point_cache`);
//       if (!players.length) {
//         return res.status(404).json({ message: 'No data available in 22_match_players or fallback cache.' });
//       }

//       lineupStatus = 'fallback';
//       players = players.map(p => ({
//         ...p,
//         is_substitute: null,
//         played_last_match: true
//       }));
//     }

//     // ✅ Group by team
//     const grouped = players.reduce((acc, p) => {
//       const tid = p.team_id;
//       if (!acc[tid]) {
//         acc[tid] = {
//           team_id: tid,
//           team_name: p.team_name,
//           players: []
//         };
//       }
//       acc[tid].players.push({
//         player_id: p.player_id,
//         fullname: p.fullname,
//         is_substitute: p.is_substitute,
//         position: p.position,
//         points: p.points,
//         image_path: p.image_path,
//         battingstyle: p.battingstyle,
//         bowlingstyle: p.bowlingstyle,
//         played_last_match: p.played_last_match || false
//       });
//       return acc;
//     }, {});

//     return res.status(200).json({
//       message: 'Fetched successfully',
//       data: Object.values(grouped),
//       lineup_status: lineupStatus
//     });

//   } catch (err) {
//     console.error('Error fetching players:', err);
//     return res.status(500).json({ message: 'Failed to fetch players', error: err.message });
//   }
// };

// module.exports = getPlayers;






const getPlayers = async (req, res) => {
  const { match_id } = req.params;
  if (!match_id) return res.status(400).json({ message: 'match_id is required' });



  const [[fixtureInfo]] = await db.query(
  'SELECT league_id, localteam_id, visitorteam_id FROM fixtures WHERE id = ?',
  [match_id]
);
console.log("fixtureInfo:", fixtureInfo);
if (!fixtureInfo) {
  return res.status(404).json({ message: 'Fixture not found' });
}
const { league_id, localteam_id, visitorteam_id } = fixtureInfo;


  // 🔹 Fetch from 22_match_players
  const fetchFrom22MatchPlayers = async () => {
    const [players] = await db.query(
      `SELECT 
         p.player_id,
         p.team_id,
         p.fullname,
         p.is_substitute,
         p.position,
         COALESCE(ppc.last_known_credit_points, 0) AS credit_points,
         COALESCE(ppc.last_known_credit_points, 0) AS points,
         p.image_path,
         p.battingstyle,
         p.bowlingstyle,
         t.name AS team_name
       FROM 22_match_players p
       LEFT JOIN teams t ON p.team_id = t.id
       LEFT JOIN player_points_cache ppc
         ON ppc.player_id = p.player_id
        AND ppc.league_id = p.league_id
       WHERE p.match_id = ? AND p.league_id = ?
       ORDER BY p.team_id, p.fullname`,
      [match_id, league_id]
    );
    return players;
  };

  // 🔹 Fetch from player_point_cache by team_ids
 const fetchFromPlayerPointCache = async (teamIds, league_id) => {
  if (!teamIds || teamIds.length !== 2) return [];

  const [players] = await db.query(
    `SELECT 
       p.player_id,
       p.team_id,
       pl.fullname,
       COALESCE(p.last_known_credit_points, 0) AS credit_points,
       COALESCE(p.last_known_credit_points, 0) AS points,
       p.position,
       pl.image_path,
       pl.battingstyle,
       pl.bowlingstyle,
       t.name AS team_name
     FROM player_points_cache p
     JOIN players pl ON pl.player_id = p.player_id
     LEFT JOIN teams t ON p.team_id = t.id
     WHERE p.team_id IN (?, ?) AND p.league_id = ?
     ORDER BY p.team_id, pl.fullname`,
    [teamIds[0], teamIds[1], league_id]
  );
  return players;
};

  const fetchFromPlayersTable = async (teamIds, league_id) => {
    if (!teamIds || teamIds.length !== 2) return [];

    const [players] = await db.query(
      `SELECT 
         pl.player_id,
         pl.team_id,
         pl.fullname,
         NULL AS is_substitute,
         pl.position,
         COALESCE(ppc.last_known_credit_points, 0) AS credit_points,
         COALESCE(ppc.last_known_credit_points, 0) AS points,
         pl.image_path,
         pl.battingstyle,
         pl.bowlingstyle,
         t.name AS team_name
       FROM players pl
       LEFT JOIN player_points_cache ppc
         ON ppc.player_id = pl.player_id
        AND ppc.league_id = ?
       LEFT JOIN teams t ON pl.team_id = t.id
       WHERE pl.team_id IN (?, ?)
       ORDER BY pl.team_id, pl.fullname`,
      [league_id, teamIds[0], teamIds[1]]
    );

    return players;
  };



  try {
    console.log(`[getPlayers] Attempting to fetch players from 22_match_players for match_id ${match_id}`);
    let players = await fetchFrom22MatchPlayers();
    console.log(`[getPlayers] Found ${players.length} players in 22_match_players`);
    let lineupStatus = 'confirmed';

    // 🔄 Try saving players from external API if not found
    if (!players.length) {
      try {
        console.log(`[getPlayers] No players found. Calling save22PlayersService for match_id ${match_id}`);
        const savedCount = await save22PlayersService(match_id);
        console.log(`[getPlayers] save22PlayersService completed: ${savedCount} players saved`);
      } catch (fetchErr) {
        console.error('[getPlayers] Error inside save22PlayersService:', fetchErr.message);
      }

      players = await fetchFrom22MatchPlayers();
      console.log(`[getPlayers] Fetched ${players.length} players from 22_match_players after save`);
    }

    // 🔄 Fallback to player_point_cache using fixture's teams
    if (!players.length) {
      console.warn('[getPlayers] Still no players in 22_match_players. Checking fallback from players table...');

      const teamIds = [localteam_id, visitorteam_id];
      console.log(`[getPlayers] Squad fallback using team_ids: ${localteam_id}, ${visitorteam_id}`);

      players = await fetchFromPlayersTable(teamIds, league_id);
      console.log(`[getPlayers] Found ${players.length} players in players table for squad fallback`);

      if (!players.length) {
        try {
          console.log(`[getPlayers] Players table empty. Calling savePlayersForFixture for match_id ${match_id}`);
          await savePlayersForFixture(match_id);
        } catch (squadErr) {
          console.error('[getPlayers] Error inside savePlayersForFixture:', squadErr.message);
        }

        players = await fetchFromPlayersTable(teamIds, league_id);
        console.log(`[getPlayers] Fetched ${players.length} players from players table after squad save`);
      }

      if (players.length) {
        lineupStatus = 'squad';
        players = players.map(p => ({
          ...p,
          played_last_match: false
        }));
      }
    }

    if (!players.length) {
      console.warn('[getPlayers] Still no players in players table. Checking fallback from player_point_cache...');

      // Get localteam and visitorteam IDs
      const [fixtureRows] = await db.query(
        `SELECT localteam_id, visitorteam_id FROM fixtures WHERE id = ?`,
        [match_id]
      );

      if (!fixtureRows.length) {
        console.error(`[getPlayers] No fixture found for match_id ${match_id}`);
        return res.status(404).json({ message: 'No fixture found for given match_id' });
      }

      const { localteam_id, visitorteam_id } = fixtureRows[0];
      console.log(`[getPlayers] Fallback using team_ids: ${localteam_id}, ${visitorteam_id}`);

      players = await fetchFromPlayerPointCache([localteam_id, visitorteam_id], league_id);
      console.log(`[getPlayers] Found ${players.length} players in player_point_cache for fallback`);

      if (!players.length) {
        return res.status(404).json({ message: 'No data available in 22_match_players, players table, or fallback cache.' });
      }

      lineupStatus = 'fallback';
      players = players.map(p => ({
        ...p,
        is_substitute: null,
        played_last_match: true
      }));
    }

    // ✅ Group players by team
    const grouped = players.reduce((acc, p) => {
      const tid = p.team_id;
      if (!acc[tid]) {
        acc[tid] = {
          team_id: tid,
          team_name: p.team_name,
          players: []
        };
      }
      acc[tid].players.push({
        player_id: p.player_id,
        fullname: p.fullname,
        is_substitute: p.is_substitute,
        position: p.position,
        credit_points: p.credit_points,
        points: p.credit_points,
        image_path: p.image_path,
        battingstyle: p.battingstyle,
        bowlingstyle: p.bowlingstyle,
        played_last_match: p.played_last_match || false
      });
      return acc;
    }, {});

    return res.status(200).json({
      message: 'Fetched successfully',
      data: Object.values(grouped),
      lineup_status: lineupStatus
    });

  } catch (err) {
    console.error('Error fetching players:', err);
    return res.status(500).json({ message: 'Failed to fetch players', error: err.message });
  }
};

module.exports = getPlayers;
