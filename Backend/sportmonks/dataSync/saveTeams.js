const axios = require("axios");
const db = require ('../../config/db/db.js')

require("dotenv").config();

const saveTeams = async (req, res) => {
  try {
    // 1. Make the API request (await was missing)
    const response = await axios.get('https://cricket.sportmonks.com/api/v2.0/teams', {
      params: {
        api_token: process.env.CRICKET_API_KEY,
        include: 'country' // Optional: if you want country data
      }
    });

    // 2. Check if data exists
    if (!response.data || !response.data.data) {
      throw new Error('No team data received from API');
    }

    const teams = response.data.data;

    // 3. Process each team
    for (const team of teams) {
      try {
        await db.query(
          `INSERT INTO teams (id, name, code, image_path, country_id, national_team, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
             name = VALUES(name), 
             code = VALUES(code), 
             image_path = VALUES(image_path),
             country_id = VALUES(country_id),
             national_team = VALUES(national_team),
             updated_at = VALUES(updated_at)`,
          [
            team.id,
            team.name,
            team.code,
            team.image_path,
            team.country_id,
            team.national_team,
            team.updated_at ? new Date(team.updated_at) : new Date()
          ]
        );
        console.log(`Saved team: ${team.name}`);
      } catch (err) {
        console.error(`Error saving team ${team.id}:`, err.message);
      }
    }

    res.status(200).json({ 
      success: true,
      message: `Successfully processed ${teams.length} teams` 
    });

  } catch (err) {
    console.error("Error saving teams:", err.message);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch/save teams",
      error: err.message 
    });
  }
};

module.exports = saveTeams;