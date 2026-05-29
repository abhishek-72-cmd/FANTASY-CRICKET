SET NAMES utf8mb4;

DELIMITER $$

CREATE PROCEDURE add_column_if_missing(
  IN table_name_in VARCHAR(64),
  IN column_name_in VARCHAR(64),
  IN column_definition_in TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = table_name_in
      AND COLUMN_NAME = column_name_in
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `', table_name_in, '` ADD COLUMN `', column_name_in, '` ', column_definition_in);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$

DELIMITER ;

CALL add_column_if_missing('players', 'credit_points', 'DECIMAL(10,2) NULL DEFAULT 0 AFTER `position`');
CALL add_column_if_missing('22_match_players', 'credit_points', 'DECIMAL(10,2) NULL AFTER `position`');
CALL add_column_if_missing('player_points_cache', 'last_known_credit_points', 'DECIMAL(10,2) NULL AFTER `league_id`');
CALL add_column_if_missing('player_match_points', 'fantasy_points', 'DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER `player_id`');
CALL add_column_if_missing('user_team_points', 'fantasy_points', 'DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER `user_team_id`');

UPDATE `players`
SET `credit_points` = COALESCE(`credit_points`, 0);

UPDATE `22_match_players`
SET `credit_points` = COALESCE(`credit_points`, `points`)
WHERE `credit_points` IS NULL;

UPDATE `player_points_cache`
SET `last_known_credit_points` = COALESCE(`last_known_credit_points`, `last_known_points`)
WHERE `last_known_credit_points` IS NULL;

UPDATE `player_match_points`
SET `fantasy_points` = COALESCE(`fantasy_points`, `points`, 0);

UPDATE `user_team_points`
SET `fantasy_points` = COALESCE(`fantasy_points`, `points`, 0);

DROP PROCEDURE add_column_if_missing;
