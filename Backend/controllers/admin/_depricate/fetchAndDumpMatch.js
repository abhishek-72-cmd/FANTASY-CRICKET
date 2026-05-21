require('dotenv').config();
const axios = require('axios');
const db = require ('../../../config/db/db.js')

const API_TOKEN = process.env.CRICKET_API_KEY

const fetchAndDumpMatch = async (req, res) => {
  const { matchId } = req.params;

  if (!matchId) {
    return res.status(400).json({ message: 'matchId is required' });
  }
  console.log(`Fetching and dumping match: ${matchId}`);

  try {
    const apiUrl = `https://cricket.sportmonks.com/api/v2.0/fixtures/${matchId}`;
    const { data } = await axios.get(apiUrl, {
      params: {
        include: 'balls',
        api_token: API_TOKEN,
      },
    });

    if (!data || !data.data || !data.data.balls || data.data.balls.length === 0) {
      return res.status(404).json({ message: 'No ball data found for this match' });
    }

    const balls = data.data.balls;

    let inserted = 0;

    for (const ball of balls) {
    const sql = `
  INSERT INTO match_ball_dump
  (ball_id, fixture_id, inning, ball_number, team_id,
   batsman_one_on_creeze_id, batsman_two_on_creeze_id, batsman_id,
   bowler_id, batsmanout_id, catchstump_id, runout_by_id,
   score_id, score_name, runs, four, six, bye, leg_bye, noball, noball_runs,
   is_wicket, \`out\`, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

      const params = [
        ball.id,
        ball.fixture_id,
        ball.scoreboard || 'NA',
        ball.ball,
        ball.team_id,
        ball.batsman_one_on_creeze_id || null,
        ball.batsman_two_on_creeze_id || null,
        ball.batsman_id,
        ball.bowler_id,
        ball.batsmanout_id || null,
        ball.catchstump_id || null,
        ball.runout_by_id || null,
        ball.score?.id || null,
        ball.score?.name || null,
        ball.score?.runs || 0,
        ball.score?.four || 0,
        ball.score?.six || 0,
        ball.score?.bye || 0,
        ball.score?.leg_bye || 0,
        ball.score?.noball || 0,
        ball.score?.noball_runs || 0,
        ball.score?.is_wicket ? 1 : 0,
        ball.score?.out ? 1 : 0,
        new Date(ball.updated_at)
      ];

      await db.query(sql, params);
      inserted++;
    }

    res.json({ message: `Dumped ${inserted} ball events for match ${matchId}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to dump match data', error: err.message });
  }
};

module.exports = fetchAndDumpMatch;
