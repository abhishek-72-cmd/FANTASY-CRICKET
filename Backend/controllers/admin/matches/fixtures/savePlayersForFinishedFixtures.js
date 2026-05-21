const { json } = require('body-parser')
const db = require('../../../../config/db/db')
const save22PlayersService = require('../../players/save22players')


const saveAllFinishedPlayers = async () => {
  const [fixtures] = await db.query(
    `SELECT id FROM fixtures WHERE status = 'finished'`
  );

  const results = [];

  for (const fixture of fixtures) {
    const match_id = fixture.id;
    console.log(`[PROCESSING] Fetching lineup for match_id: ${match_id}`);

    try {
      const savedCount = await save22PlayersService(match_id);
      results.push({ match_id, savedCount, status: 'success' });
    } catch (err) {
      const errMsg = err.response?.data || err.message;
      console.error(`[ERROR] Failed for match_id ${match_id}:`, errMsg);
      results.push({ match_id, error: errMsg, status: 'failed' });

      // Optional: You can continue silently if lineup not found
      if (errMsg?.message?.includes("lineup") || errMsg?.includes("No lineup found")) {
        continue;
      }

    res.status(200).json({message: 'squad saved '})

    }
  }

  console.log('=== DONE saving all finished fixtures ===');
    res.status(200).json({message: 'squad saved '})
  return results;
      
};
module.exports = saveAllFinishedPlayers;