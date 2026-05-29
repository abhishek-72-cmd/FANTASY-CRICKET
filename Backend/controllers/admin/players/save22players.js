require('dotenv').config();
const axios = require('axios');
const db = require('../../../config/db/db');

// code is working when you directly hit the api but not woek wor getplayers function 


// const save22Players = async (req, res) => {
//   const { match_id } = req.params;
//   if (!match_id) return res.status(400).json({ message: 'match_id is required' });

//   try {
//     const API_TOKEN = process.env.CRICKET_API_KEY;
//     const url = `https://cricket.sportmonks.com/api/v2.0/fixtures/${match_id}?include=lineup,localteam,visitorteam&api_token=${API_TOKEN}`;

//     const { data } = await axios.get(url);
//     const lineup = data?.data?.lineup;
//     const localteam_id = data?.data?.localteam_id;
//     const visitorteam_id = data?.data?.visitorteam_id;

//     if (!lineup || lineup.length === 0) {
//       return res.status(404).json({ message: 'No lineup found' });
//     }

//     let savedCount = 0;
//     for (const player of lineup) {
//       const team_id = player.lineup?.team_id;
//       if (!team_id) continue;

//       const playerId = player.id;
//       const fullname = player.fullname;
//       const is_substitute = player.lineup?.substitution ? 0 : 1;
//       const position = player.position?.name || null;

//       // Get previous match points
//       const [existing] = await db.query(
//         `SELECT points FROM 22_match_players WHERE match_id = ? AND player_id = ?`,
//         [match_id, playerId]
//       );

//       let points = existing?.points || null;
//       if (points === null) {
//         points = await getPreviousPlayerPoints(team_id, playerId);
//       }

//       // Get static info from `players` table
//       const [metaRows] = await db.query(
//         `SELECT image_path, battingstyle, bowlingstyle FROM players WHERE player_id = ?`,
//         [playerId]
//       );
//       const meta = metaRows[0] || {};

//       // Insert or update in 22_match_players
//       await db.query(
//         `INSERT INTO 22_match_players
//          (match_id, player_id, team_id, fullname, is_substitute, position, points, image_path, battingstyle, bowlingstyle)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//          ON DUPLICATE KEY UPDATE
//            team_id = VALUES(team_id),
//            fullname = VALUES(fullname),
//            is_substitute = VALUES(is_substitute),
//            position = VALUES(position),
//            points = VALUES(points),
//            image_path = VALUES(image_path),
//            battingstyle = VALUES(battingstyle),
//            bowlingstyle = VALUES(bowlingstyle)`,
//         [
//           match_id, playerId, team_id, fullname,
//           is_substitute, position, points,
//           meta.image_path || null,
//           meta.battingstyle || null,
//           meta.bowlingstyle || null
//         ]
//       );

//       // Save to player_points_cache IF points are not null
//       if (points !== null) {
//         await db.query(
//           `INSERT INTO player_points_cache (player_id, team_id, last_known_points, position)
//            VALUES (?, ?, ?, ?)
//            ON DUPLICATE KEY UPDATE
//            last_known_points = VALUES(last_known_points),
//            team_id = VALUES(team_id),
//            position = VALUES(position)`,
//           [playerId, team_id, points, position]
//         );
//       }

//       savedCount++;
//     }

//     return res.status(200).json({ message: `Saved/updated ${savedCount} players` });

//   } catch (err) {
//     console.error('save22Players error:', err);
//     return res.status(500).json({ message: 'Failed to save players', error: err.message });
//   }
// };

// module.exports = save22Players;





const save22PlayersService = async (match_id) => {
  const API_TOKEN = process.env.CRICKET_API_KEY;
  const url = `https://cricket.sportmonks.com/api/v2.0/fixtures/${match_id}?include=lineup,localteam,visitorteam&api_token=${API_TOKEN}`;

  const { data } = await axios.get(url);
  const lineup = data?.data?.lineup;
  const localteam_id = data?.data?.localteam_id;
  const visitorteam_id = data?.data?.visitorteam_id;

  if (!lineup || lineup.length === 0) {
    throw new Error('No lineup found');
  }

const league_id = data?.data?.league_id;
if (!league_id) throw new Error('league_id missing in fixture');

  let savedCount = 0;
  for (const player of lineup) {
    const team_id = player.lineup?.team_id;
    if (!team_id) continue;

    const playerId = player.id;
    const fullname = player.fullname;
    const is_substitute = player.lineup?.substitution ? 0 : 1;
    const position = player.position?.name || null;

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
        playerId,
        team_id,
        data?.data?.season_id || null,
        fullname,
        position,
        player.image_path || null,
        player.battingstyle || null,
        player.bowlingstyle || null
      ]
    );

    const [metaRows] = await db.query(
      `SELECT image_path, battingstyle, bowlingstyle FROM players WHERE player_id = ?`,
      [playerId]
    );
    const meta = metaRows[0] || {};

    await db.query(
      `INSERT INTO 22_match_players
       (match_id, league_id, player_id, team_id, fullname, is_substitute, position, image_path, battingstyle, bowlingstyle)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         team_id = VALUES(team_id),
         fullname = VALUES(fullname),
         is_substitute = VALUES(is_substitute),
         position = VALUES(position),
         image_path = VALUES(image_path),
         battingstyle = VALUES(battingstyle),
         bowlingstyle = VALUES(bowlingstyle),
         league_id = VALUES(league_id)
         `,
         
      [
        match_id,league_id, playerId, team_id, fullname,
        is_substitute, position,
        meta.image_path || null,
        meta.battingstyle || null,
        meta.bowlingstyle || null
      ]
    );

    savedCount++;
  }
  return savedCount;
};

module.exports = save22PlayersService;
