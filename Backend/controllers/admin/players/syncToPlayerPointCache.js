// Credit points are now owned by player_points_cache directly.
// This helper remains as a no-op for older imports.
const syncToPlayerPointCache = async () => {
  console.log('[syncToPlayerPointCache] Skipped: player_points_cache is the credit source of truth.');
  return 0;
};

module.exports = syncToPlayerPointCache;
