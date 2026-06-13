const cron = require('node-cron');
const updateFixtureStatuses = require('./updateFixtureStatuses');

cron.schedule('*/5 * * * *', async () => {

  await updateFixtureStatuses(
    `
      status='NS'
      AND starting_at BETWEEN NOW()
      AND DATE_ADD(NOW(), INTERVAL 1 HOUR)
    `,
    'NEAR MATCHES'
  );

});