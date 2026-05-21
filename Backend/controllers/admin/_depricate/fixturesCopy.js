require('dotenv').config();
const axios = require('axios');
const db = require ('../../../config/db/db.js')


const fixturesCopy = async (req, res) => {
  const API_TOKEN = process.env.CRICKET_API_KEY;
  const BASE_URL = "https://cricket.sportmonks.com/api/v2.0/fixtures";

  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const fourMonthsLater = new Date();
  fourMonthsLater.setMonth(fourMonthsLater.getMonth() + 4);

  const yyyyMmDd = d => d.toISOString().slice(0, 10);
  const todayStr = yyyyMmDd(today);
  const oneMonthAgoStr = yyyyMmDd(oneMonthAgo);
  const fourMonthsLaterStr = yyyyMmDd(fourMonthsLater);

  const urls = [
    {
      type: "Finished",
      url: `${BASE_URL}/?api_token=${API_TOKEN}&filter[status]=Finished&filter[starts_between]=${oneMonthAgoStr},${todayStr}&include=localteam,visitorteam&sort=starting_at&per_page=100`
    },
    {
      type: "NS",
      url: `${BASE_URL}/?api_token=${API_TOKEN}&filter[status]=NS&filter[starts_between]=${todayStr},${fourMonthsLaterStr}&include=localteam,visitorteam&sort=starting_at&per_page=100`
    }
  ];

  let savedCount = 0;

  try {
    for (const { type, url } of urls) {
      console.log(`[INFO] Fetching ${type} fixtures: ${url}`);
      const response = await axios.get(url);
      const fixtures = response.data?.data || [];

      for (const fixture of fixtures) {


        const values = [
          fixture.id,
          fixture.league_id,
          fixture.season_id,
          fixture.stage_id,
          fixture.round,
          fixture.localteam_id,
          fixture.visitorteam_id,
          fixture.starting_at,
          fixture.type,
          fixture.live ? 1 : 0,
          fixture.status,
          fixture.note,
          fixture.venue_id,
          fixture.toss_won_team_id,
          fixture.winner_team_id,
          fixture.draw_noresult,
          fixture.elected,
          fixture.super_over ? 1 : 0,
          fixture.follow_on ? 1 : 0,
          fixture.localteam_dl_data?.score,
          fixture.localteam_dl_data?.overs,
          fixture.localteam_dl_data?.wickets_out,
          fixture.visitorteam_dl_data?.score,
          fixture.visitorteam_dl_data?.overs,
          fixture.visitorteam_dl_data?.wickets_out,
        ];

        await db.query(`
          INSERT INTO fixtures_copy (
            id, league_id, season_id, stage_id, round,
            localteam_id, visitorteam_id, starting_at, type, live,
            status, note, venue_id, toss_won_team_id, winner_team_id,
            draw_noresult, elected, super_over, follow_on,
            localteam_dl_score, localteam_dl_overs, localteam_dl_wickets,
            visitorteam_dl_score, visitorteam_dl_overs, visitorteam_dl_wickets
          ) VALUES (
            ?,?,?,?,?,?,?,?,?,
            ?,?,?,?,?,?,?,?,?,?,
            ?,?,?,?,?,?
          )
          ON DUPLICATE KEY UPDATE
            starting_at = VALUES(starting_at),
            status = VALUES(status),
            live = VALUES(live)
        `, values);

        console.log(`[SUCCESS] Saved fixture ${fixture.id} (${fixture.status})`);
        savedCount++;
      }
    }

    console.log(`[INFO] Total fixtures saved/updated: ${savedCount}`);
    res.json({ message: `${savedCount} fixtures saved/updated in fixtures_copy` });
  } catch (err) {
    console.error('[ERROR] Failed to fetch or save fixtures');
    if (err.sqlMessage) {
      console.error('[SQL ERROR]', err.sqlMessage);
    } else if (err.response?.data) {
      console.error('[API ERROR]', err.response.data);
    } else {
      console.error('[OTHER ERROR]', err.message);
    }
    res.status(500).json({ error: 'Failed to fetch or save fixtures' });
  }
};

module.exports = fixturesCopy;
