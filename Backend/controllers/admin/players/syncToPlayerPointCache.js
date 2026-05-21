const db = require('../../../config/db/db')

const syncToPlayerPointCache = async (match_id)=>{
try{
    const [fixtureRows] = await db.query(

        `SELECT localteam_id, visitorteam_id, league_id FROM fixtures WHERE id = ?`, [match_id]
    )

    if(!fixtureRows.length) throw new Error (`no fixture found for match_id${match_id}`);

const {league_id} = fixtureRows[0];

// get all players from 22_match_players for the match 

const [players] = await db.query (

    `SELECT player_id, team_id, position, points FROM 22_match_players WHERE match_id = ?`,
    [match_id]
)

for (const player of players ){
    const  {player_id, team_id, position, points} = player;

    if (points=== null) continue;


 await db.query(
        `INSERT INTO player_points_cache (player_id, team_id, last_known_points, position, league_id)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           last_known_points = VALUES(last_known_points),
           position = VALUES(position),
           league_id = VALUES(league_id)`,
        [player_id, team_id, points, position, league_id]
      );
}
 console.log(`[syncToPlayerPointCache] Synced ${players.length} players to cache for match_id ${match_id}`);
  } catch (err) {
    console.error('[syncToPlayerPointCache] Error syncing cache:', err.message);
  }
}

module.exports = syncToPlayerPointCache;