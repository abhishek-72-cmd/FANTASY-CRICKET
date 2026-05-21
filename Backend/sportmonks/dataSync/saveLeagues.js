require('dotenv').config();
const axios = require('axios');
const db = require ('../../config/db/db.js')

const API_TOKEN = process.env.CRICKET_API_KEY;




const saveLeagues = async (req, res) => {
  try {
    if (!API_TOKEN) {
      return res.status(500).json({ message: 'API_TOKEN not set in .env' });
    }

    console.log('INSIDE saveLeagues');

    // Fetch leagues
    const response = await axios.get(
      'https://cricket.sportmonks.com/api/v2.0/leagues',
      {
        params: {
          api_token: API_TOKEN,
        },
      }
    );

    const leagues = response.data.data;

    if (!leagues || leagues.length === 0) {
      return res.json({ message: '0 leagues saved (no leagues found)' });
    }

    let savedCount = 0;

    for (const league of leagues) {
      const {
        id,
        name,
        code,
        image_path,
        type,
        season_id,
        country_id,
        updated_at,
      } = league;

      // Format updated_at for MySQL
     const mysqlFormattedDate =
  updated_at != null
    ? updated_at.replace('T', ' ').slice(0, 19)
    : null;

      await db.execute(
        `
        INSERT INTO leagues (id, name, code, image_path, type, season_id, country_id, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          code = VALUES(code),
          image_path = VALUES(image_path),
          type = VALUES(type),
          season_id = VALUES(season_id),
          country_id = VALUES(country_id),
          updated_at = VALUES(updated_at)
      `,
        [
          id,
          name,
          code,
          image_path,
          type,
          season_id,
          country_id,
          mysqlFormattedDate,
        ]
      );

      console.log(`Saved league: ${name} (${id})`);
      savedCount++;
    }

    return res.json({ message: `${savedCount} leagues saved to database` });
  } catch (err) {
    console.error('Could not fetch leagues:', err);
    return res.status(500).json({
      message: 'Internal server error',
      error: err.message,
    });
  }
};

module.exports = saveLeagues