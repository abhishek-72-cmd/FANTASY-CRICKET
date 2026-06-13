const cron = require('node-cron');
const updateFixtureStatuses = require('./updateFixtureStatuses');

cron.schedule('*/30 * * * *', async () => {

  await updateFixtureStatuses(
    `
      status='NS'
      AND starting_at > DATE_ADD(NOW(), INTERVAL 1 HOUR)
      AND starting_at <= DATE_ADD(NOW(), INTERVAL 14 DAY)
    `,
    'FAR MATCHES'
  );

});