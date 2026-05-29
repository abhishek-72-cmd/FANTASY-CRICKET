SET NAMES utf8mb4;

DELIMITER $$

CREATE PROCEDURE drop_index_if_exists(
  IN table_name_in VARCHAR(64),
  IN index_name_in VARCHAR(64)
)
BEGIN
  IF EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = table_name_in
      AND INDEX_NAME = index_name_in
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `', table_name_in, '` DROP INDEX `', index_name_in, '`');
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$

CREATE PROCEDURE add_index_if_missing(
  IN table_name_in VARCHAR(64),
  IN index_name_in VARCHAR(64),
  IN index_definition_in TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = table_name_in
      AND INDEX_NAME = index_name_in
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `', table_name_in, '` ADD ', index_definition_in);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$

DELIMITER ;

UPDATE player_points_cache
SET last_known_credit_points = COALESCE(last_known_credit_points, last_known_points)
WHERE last_known_credit_points IS NULL;

CALL drop_index_if_exists('player_points_cache', 'uk_player_points_cache_player_team_league');

CALL add_index_if_missing(
  'player_points_cache',
  'uk_player_points_cache_player_league',
  'UNIQUE KEY `uk_player_points_cache_player_league` (`player_id`, `league_id`)'
);

CALL add_index_if_missing(
  'player_points_cache',
  'idx_player_points_cache_team_league',
  'KEY `idx_player_points_cache_team_league` (`team_id`, `league_id`)'
);

DROP PROCEDURE drop_index_if_exists;
DROP PROCEDURE add_index_if_missing;
