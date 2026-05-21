const cron = require('node-cron');
const axios = require('axios');

//Add this cron job, scheduled every 6 hours.
// Runs at midnight, 6AM, noon, 6PM.


cron.schedule('0 2 * * *', async () => {

    console.log ('||| updating fixtures ||| ')

  console.log(` Running fixtures cron at ${new Date().toISOString()}`);

  try {
    const res = await axios.post('http://localhost:5000/api/fetch-API-data/admin/fixtures');
    console.log(`[SUCCESS] Fixtures cron result: ${res.data.message}`);
  } catch (err) {
    console.error(`[ERROR] Fixtures cron failed:`, err.message);
  }
});
