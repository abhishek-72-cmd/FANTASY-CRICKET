
// require('dotenv').config();
// const axios = require('axios');
// const db = require('../../../../config/db.js');


// const API_TOKEN = process.env.CRICKET_API_KEY;



// function mapEventType(scoreName, runs) {
//   const name = scoreName.trim().toUpperCase();

//   if (name.includes('CATCH OUT')) {
//     return 'CATCH';
//   }
//   if (name.includes('STUMP OUT')) {
//     return 'STUMPING';
//   }
//   if (name.includes('CLEAN BOWLED')) {
//     return 'BOWLED';
//   }
//   if (name.includes('LBW OUT')) {
//     return 'LBW';
//   }
//   if (name.includes('RUN OUT')) {
//     return 'RUNOUT';
//   }
//   if (name.includes('WIDE')) {
//     return 'WIDE';
//   }
//   if (name.includes('NO BALL')) {
//     return 'NO_BALL';
//   }
//   if (name.includes('BYE') || name.includes('LEG BYE')) {
//     return 'BYES';
//   }
//   if (name.includes('FOUR')) {
//     return 'FOUR';
//   }
//   if (name.includes('SIX')) {
//     return 'SIX';
//   }
//   if (name.includes('NO RUN') || runs === 0) {
//     return 'DOTBALL';
//   }

//   // Out scenarios not yet explicitly handled
//   if (
//     name.includes('RETIRED') ||
//     name.includes('HIT WICKET') ||
//     name.includes('OBSTRUCTING') ||
//     name.includes('ABSENT')
//   ) {
//     return 'WICKET';
//   }

//   return 'RUN';
// }

// const matchEvents = async (req, res) => {
//   const { matchId } = req.params;
//   console.log('Received matchId:', matchId);

//   if (!matchId) {
//     return res.status(400).json({ message: 'matchId is required' });
//   }

//   try {
//     const apiUrl = `https://cricket.sportmonks.com/api/v2.0/fixtures/${matchId}`;
//     const { data } = await axios.get(apiUrl, {
//       params: {
//         include: 'balls',
//         api_token: API_TOKEN,
//       },
//     });

//     if (!data || !data.data || !data.data.balls || data.data.balls.length === 0) {
//       return res.status(404).json({ message: 'No ball data found for this match' });
//     }

//     const balls = data.data.balls;

//     console.log(`Fetched ${balls.length} balls for match ${matchId}`);

//     let inserted = 0;

//     // track score per inning
//     const inningScores = {};

//     for (const ball of balls) {
//       const overNum = Math.floor(ball.ball);
//       const ballNum = Math.round((ball.ball - overNum) * 10);

//       const inning = ball.scoreboard || 'NA';
//       const runs = ball.score?.runs || 0;

//       // update inning score
//       if (!inningScores[inning]) {
//         inningScores[inning] = { runs: 0, wickets: 0 };
//       }
//       inningScores[inning].runs += runs;

//       const scoreName = ball.score?.name || '';
//       const eventType = mapEventType(scoreName, runs);

//       if (['CATCH', 'BOWLED', 'LBW', 'STUMPING', 'RUNOUT', 'WICKET'].includes(eventType)) {
//         inningScores[inning].wickets += 1;
//       }

//       const matchScore = `${inningScores[inning].runs}/${inningScores[inning].wickets}`;

//       const assistId = ball.catchstump_id || ball.runout_by_id || null;

//       const sql = `
//         INSERT INTO match_events
//         (match_id,  over_number, ball_number, event_type, runs_scored,
//          batsman_id, bowler_id, assist_player_id, batting_team_id, bowling_team_id,
//          time_stamp, match_score)
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//       const params = [
//         ball.fixture_id,
//         overNum,
//         ballNum,
//         eventType,
//         runs,
//         ball.batsman.id,
//         ball.bowler.id,
//         assistId,
//         ball.team.id,
//         ball.team.id === data.data.localteam_id ? data.data.visitorteam_id : data.data.localteam_id,
//         new Date(ball.updated_at),
//         matchScore,
//       ];

//       await db.query(sql, params);
//       inserted++;
//     }

//     res.json({ message: `Saved ${inserted} ball events for match ${matchId}` });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to save match events', error: err.message });
//   }
// };

// module.exports = matchEvents;





// cron job is scheduled to fetch the match events from external API 
// 4 am and  4 pm which gets the match status of fixtures if status is finished it fetches the events for that perticular match 
// and save it to the DB (match_events)

require('dotenv').config();
const axios = require('axios');
const db = require('../../../../config/db/db')




const API_TOKEN = process.env.CRICKET_API_KEY;

function mapEventType(scoreName, runs) {
  const name = scoreName.trim().toUpperCase();

  if (name.includes('CATCH OUT')) return 'CATCH';
  if (name.includes('STUMP OUT')) return 'STUMPING';
  if (name.includes('CLEAN BOWLED')) return 'BOWLED';
  if (name.includes('LBW OUT')) return 'LBW';
  if (name.includes('RUN OUT')) return 'RUNOUT';
  if (name.includes('WIDE')) return 'WIDE';
  if (name.includes('NO BALL')) return 'NO_BALL';
  if (name.includes('BYE') || name.includes('LEG BYE')) return 'BYES';
  if (name.includes('FOUR')) return 'FOUR';
  if (name.includes('SIX')) return 'SIX';
  if (name.includes('NO RUN') || runs === 0) return 'DOTBALL';

  if (
    name.includes('RETIRED') ||
    name.includes('HIT WICKET') ||
    name.includes('OBSTRUCTING') ||
    name.includes('ABSENT')
  ) return 'WICKET';

  return 'RUN';
}

const fetchMatchEventsForMatch = async (matchId, force = false) => {
  if (!matchId) throw new Error('matchId is required');

  const [[existing]] = await db.query(
    'SELECT COUNT(*) as count FROM match_events WHERE match_id = ?',
    [matchId]
  );

  if (existing.count > 0 && !force) {
    console.log(` Events already exist for match ${matchId}, skipping.`);
    return { skipped: true, inserted: 0 };
  }

  const apiUrl = `https://cricket.sportmonks.com/api/v2.0/fixtures/${matchId}`;
  const { data } = await axios.get(apiUrl, {
    params: {
      include: 'balls',
      api_token: API_TOKEN,
    },
  });

  if (!data?.data?.balls || data.data.balls.length === 0) {
    console.warn(` No ball data found for match ${matchId}`);
    return { skipped: false, inserted: 0 };
  }

  const balls = data.data.balls;
  console.log(`📥 Fetched ${balls.length} balls for match ${matchId}`);

  const inningScores = {};
  let inserted = 0;

  for (const ball of balls) {
    const overNum = Math.floor(ball.ball);
    const ballNum = Math.round((ball.ball - overNum) * 10);

    const inning = ball.scoreboard || 'NA';
    const runs = ball.score?.runs || 0;

    if (!inningScores[inning]) inningScores[inning] = { runs: 0, wickets: 0 };
    inningScores[inning].runs += runs;

    const scoreName = ball.score?.name || '';
    const eventType = mapEventType(scoreName, runs);

    if (['CATCH', 'BOWLED', 'LBW', 'STUMPING', 'RUNOUT', 'WICKET'].includes(eventType)) {
      inningScores[inning].wickets += 1;
    }

    const matchScore = `${inningScores[inning].runs}/${inningScores[inning].wickets}`;
    const assistId = ball.catchstump_id || ball.runout_by_id || null;

    const sql = `
      INSERT IGNORE INTO match_events
      (match_id, over_number, ball_number, event_type, runs_scored,
       batsman_id, bowler_id, assist_player_id, batting_team_id, bowling_team_id,
       time_stamp, match_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
      ball.fixture_id,
      overNum,
      ballNum,
      eventType,
      runs,
      ball.batsman.id,
      ball.bowler.id,
      assistId,
      ball.team.id,
      ball.team.id === data.data.localteam_id ? data.data.visitorteam_id : data.data.localteam_id,
      new Date(ball.updated_at),
      matchScore,
    ];

    await db.query(sql, params);
    inserted++;
  }

  console.log(` Inserted ${inserted} events for match ${matchId}`);
  return { skipped: false, inserted };
};

// Route handler
const matchEventsHandler = async (req, res) => {
  try {
    console.log ('|| updatinf match events ||')
    const { matchId } = req.params;
    const result = await fetchMatchEventsForMatch(matchId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = matchEventsHandler;
module.exports.fetchMatchEventsForMatch = fetchMatchEventsForMatch;
