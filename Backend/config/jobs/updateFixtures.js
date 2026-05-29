const cron = require('node-cron');
const { saveFixturesService } = require('../../controllers/admin/matches/fixtures/saveFixturesToDb');

// Updates only the next 7 days of upcoming fixtures to keep near-term dates/times fresh.


cron.schedule('0 2 * * *', async () => {

    console.log ('||| updating fixtures ||| ')

  console.log(` Running fixtures cron at ${new Date().toISOString()}`);

  try {
    const result = await saveFixturesService({
      includeFinished: false,
      includeUpcoming: true,
      upcomingDays: 7,
    });
    console.log(`[SUCCESS] Fixtures cron result: ${result.message}`);
  } catch (err) {
    console.error(`[ERROR] Fixtures cron failed:`, err.message);
  }
});

