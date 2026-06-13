SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(190) NOT NULL,
  `phone_number` VARCHAR(20) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  UNIQUE KEY `uk_users_phone_number` (`phone_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `admins` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(190) NOT NULL,
  `phone_number` VARCHAR(20) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_admins_email` (`email`),
  UNIQUE KEY `uk_admins_phone_number` (`phone_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_wallet` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `balance` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_wallet_user_id` (`user_id`),
  CONSTRAINT `fk_user_wallet_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `wallet_transactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `transaction_type` VARCHAR(50) NOT NULL,
  `balance_before` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `balance_after` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `remarks` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_wallet_transactions_user_id` (`user_id`),
  KEY `idx_wallet_transactions_type` (`transaction_type`),
  CONSTRAINT `fk_wallet_transactions_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `leagues` (
  `id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `code` VARCHAR(80) NULL,
  `image_path` TEXT NULL,
  `type` VARCHAR(80) NULL,
  `season_id` BIGINT UNSIGNED NULL,
  `country_id` BIGINT UNSIGNED NULL,
  `updated_at` DATETIME NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_leagues_season_id` (`season_id`),
  KEY `idx_leagues_country_id` (`country_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `teams` (
  `id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `code` VARCHAR(80) NULL,
  `image_path` TEXT NULL,
  `country_id` BIGINT UNSIGNED NULL,
  `national_team` TINYINT(1) NOT NULL DEFAULT 0,
  `updated_at` DATETIME NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_teams_country_id` (`country_id`),
  KEY `idx_teams_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `fixtures` (
  `id` BIGINT UNSIGNED NOT NULL,
  `league_id` BIGINT UNSIGNED NULL,
  `season_id` BIGINT UNSIGNED NULL,
  `stage_id` BIGINT UNSIGNED NULL,
  `round` VARCHAR(255) NULL,
  `localteam_id` BIGINT UNSIGNED NULL,
  `visitorteam_id` BIGINT UNSIGNED NULL,
  `starting_at` DATETIME NULL,
  `type` VARCHAR(80) NULL,
  `live` TINYINT(1) NOT NULL DEFAULT 0,
  `status` VARCHAR(80) NULL,
  `note` TEXT NULL,
  `venue_id` BIGINT UNSIGNED NULL,
  `toss_won_team_id` BIGINT UNSIGNED NULL,
  `winner_team_id` BIGINT UNSIGNED NULL,
  `draw_noresult` VARCHAR(80) NULL,
  `elected` VARCHAR(80) NULL,
  `super_over` TINYINT(1) NOT NULL DEFAULT 0,
  `follow_on` TINYINT(1) NOT NULL DEFAULT 0,
  `localteam_dl_score` INT NULL,
  `localteam_dl_overs` DECIMAL(5,2) NULL,
  `localteam_dl_wickets` INT NULL,
  `visitorteam_dl_score` INT NULL,
  `visitorteam_dl_overs` DECIMAL(5,2) NULL,
  `visitorteam_dl_wickets` INT NULL,
  `is_activated` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_fixtures_starting_at` (`starting_at`),
  KEY `idx_fixtures_status` (`status`),
  KEY `idx_fixtures_league_id` (`league_id`),
  KEY `idx_fixtures_localteam_id` (`localteam_id`),
  KEY `idx_fixtures_visitorteam_id` (`visitorteam_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `players` (
  `player_id` BIGINT UNSIGNED NOT NULL,
  `team_id` BIGINT UNSIGNED NULL,
  `season_id` BIGINT UNSIGNED NULL,
  `fullname` VARCHAR(255) NOT NULL,
  `position` VARCHAR(100) NULL,
  `credit_points` DECIMAL(10,2) NULL DEFAULT 0,
  `image_path` TEXT NULL,
  `battingstyle` VARCHAR(100) NULL,
  `bowlingstyle` VARCHAR(100) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`player_id`),
  KEY `idx_players_team_id` (`team_id`),
  KEY `idx_players_season_id` (`season_id`),
  KEY `idx_players_fullname` (`fullname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `22_match_players` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `match_id` BIGINT UNSIGNED NOT NULL,
  `league_id` BIGINT UNSIGNED NULL,
  `player_id` BIGINT UNSIGNED NOT NULL,
  `team_id` BIGINT UNSIGNED NULL,
  `fullname` VARCHAR(255) NOT NULL,
  `is_substitute` TINYINT(1) NULL,
  `position` VARCHAR(100) NULL,
  `credit_points` DECIMAL(10,2) NULL,
  `points` DECIMAL(10,2) NULL,
  `image_path` TEXT NULL,
  `battingstyle` VARCHAR(100) NULL,
  `bowlingstyle` VARCHAR(100) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_22_match_players_match_player` (`match_id`, `player_id`),
  KEY `idx_22_match_players_match_id` (`match_id`),
  KEY `idx_22_match_players_league_id` (`league_id`),
  KEY `idx_22_match_players_team_id` (`team_id`),
  KEY `idx_22_match_players_player_id` (`player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `player_points_cache` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `player_id` BIGINT UNSIGNED NOT NULL,
  `team_id` BIGINT UNSIGNED NOT NULL,
  `league_id` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `last_known_credit_points` DECIMAL(10,2) NULL,
  `last_known_points` DECIMAL(10,2) NULL,
  `position` VARCHAR(100) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_player_points_cache_player_league` (`player_id`, `league_id`),
  KEY `idx_player_points_cache_team_league` (`team_id`, `league_id`),
  KEY `idx_player_points_cache_player_id` (`player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `match_events` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `match_id` BIGINT UNSIGNED NOT NULL,
  `over_number` INT NOT NULL,
  `ball_number` INT NOT NULL,
  `event_type` VARCHAR(40) NOT NULL,
  `runs_scored` INT NOT NULL DEFAULT 0,
  `batsman_id` BIGINT UNSIGNED NULL,
  `bowler_id` BIGINT UNSIGNED NULL,
  `assist_player_id` BIGINT UNSIGNED NULL,
  `batting_team_id` BIGINT UNSIGNED NULL,
  `bowling_team_id` BIGINT UNSIGNED NULL,
  `time_stamp` DATETIME NULL,
  `match_score` VARCHAR(30) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_match_events_ball` (`match_id`, `over_number`, `ball_number`, `batsman_id`, `bowler_id`, `event_type`),
  KEY `idx_match_events_match_id` (`match_id`),
  KEY `idx_match_events_batsman_id` (`batsman_id`),
  KEY `idx_match_events_bowler_id` (`bowler_id`),
  KEY `idx_match_events_event_type` (`event_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `fantasy_point_rules` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category` VARCHAR(80) NOT NULL,
  `action` VARCHAR(120) NOT NULL,
  `points` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `unit` VARCHAR(40) NULL,
  `min_value` DECIMAL(10,2) NULL,
  `max_value` DECIMAL(10,2) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fantasy_point_rules_category_action` (`category`, `action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `player_match_points` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `match_id` BIGINT UNSIGNED NOT NULL,
  `player_id` BIGINT UNSIGNED NOT NULL,
  `fantasy_points` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `points` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_player_match_points_match_player` (`match_id`, `player_id`),
  KEY `idx_player_match_points_match_id` (`match_id`),
  KEY `idx_player_match_points_player_id` (`player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_teams` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `match_id` BIGINT UNSIGNED NOT NULL,
  `players` JSON NOT NULL,
  `captain_id` BIGINT UNSIGNED NULL,
  `vice_captain_id` BIGINT UNSIGNED NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_teams_user_id` (`user_id`),
  KEY `idx_user_teams_match_id` (`match_id`),
  KEY `idx_user_teams_user_match` (`user_id`, `match_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_team_points` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `match_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `user_team_id` BIGINT UNSIGNED NOT NULL,
  `fantasy_points` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `points` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_team_points_team_match` (`user_team_id`, `match_id`),
  KEY `idx_user_team_points_match_id` (`match_id`),
  KEY `idx_user_team_points_user_id` (`user_id`),
  KEY `idx_user_team_points_points` (`points`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `contests` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `match_id` BIGINT UNSIGNED NOT NULL,
  `match_title` VARCHAR(255) NULL,
  `prize_pool` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `max_prize_pool` DECIMAL(12,2) NULL,
  `buy_in` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `entry_fee` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `min_players` INT NOT NULL DEFAULT 2,
  `max_players` INT NOT NULL DEFAULT 100,
  `winner_type` VARCHAR(40) NOT NULL,
  `visible_until` DATETIME NULL,
  `registration_opens` DATETIME NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_contests_match_id` (`match_id`),
  KEY `idx_contests_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `fixtures_copy` LIKE `fixtures`;

CREATE TABLE IF NOT EXISTS `match_ball_dump` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ball_id` BIGINT UNSIGNED NOT NULL,
  `fixture_id` BIGINT UNSIGNED NOT NULL,
  `inning` VARCHAR(40) NULL,
  `ball_number` DECIMAL(5,1) NULL,
  `team_id` BIGINT UNSIGNED NULL,
  `batsman_one_on_creeze_id` BIGINT UNSIGNED NULL,
  `batsman_two_on_creeze_id` BIGINT UNSIGNED NULL,
  `batsman_id` BIGINT UNSIGNED NULL,
  `bowler_id` BIGINT UNSIGNED NULL,
  `batsmanout_id` BIGINT UNSIGNED NULL,
  `catchstump_id` BIGINT UNSIGNED NULL,
  `runout_by_id` BIGINT UNSIGNED NULL,
  `score_id` BIGINT UNSIGNED NULL,
  `score_name` VARCHAR(120) NULL,
  `runs` INT NOT NULL DEFAULT 0,
  `four` TINYINT(1) NOT NULL DEFAULT 0,
  `six` TINYINT(1) NOT NULL DEFAULT 0,
  `bye` INT NOT NULL DEFAULT 0,
  `leg_bye` INT NOT NULL DEFAULT 0,
  `noball` TINYINT(1) NOT NULL DEFAULT 0,
  `noball_runs` INT NOT NULL DEFAULT 0,
  `is_wicket` TINYINT(1) NOT NULL DEFAULT 0,
  `out` TINYINT(1) NOT NULL DEFAULT 0,
  `updated_at` DATETIME NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_match_ball_dump_ball_id` (`ball_id`),
  KEY `idx_match_ball_dump_fixture_id` (`fixture_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `upcoming_matches` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `match_id` BIGINT UNSIGNED NULL,
  `match_title` VARCHAR(255) NULL,
  `start_time` DATETIME NOT NULL,
  `localteam_id` BIGINT UNSIGNED NULL,
  `visitorteam_id` BIGINT UNSIGNED NULL,
  `status` VARCHAR(80) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_upcoming_matches_start_time` (`start_time`),
  KEY `idx_upcoming_matches_match_id` (`match_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `fantasy_point_rules`
  (`category`, `action`, `points`, `unit`, `min_value`, `max_value`)
VALUES
  ('Batting', 'Run', 1, NULL, NULL, NULL),
  ('Batting', 'Boundary Bonus', 1, NULL, NULL, NULL),
  ('Batting', 'Six Bonus', 2, NULL, NULL, NULL),
  ('Batting', '25 Runs Bonus', 4, NULL, NULL, NULL),
  ('Batting', '50 Runs Bonus', 8, NULL, NULL, NULL),
  ('Batting', '75 Runs Bonus', 12, NULL, NULL, NULL),
  ('Batting', 'Century Bonus', 16, NULL, NULL, NULL),
  ('Batting', 'Duck Penalty', -2, NULL, NULL, NULL),
  ('Batting', 'Strike Rate 170+', 6, 'SR', 170, NULL),
  ('Batting', 'Strike Rate 150-169.99', 4, 'SR', 150, 169.99),
  ('Batting', 'Strike Rate 130-149.99', 2, 'SR', 130, 149.99),
  ('Batting', 'Strike Rate 60-70', -2, 'SR', 60, 70),
  ('Batting', 'Strike Rate 50-59.99', -4, 'SR', 50, 59.99),
  ('Batting', 'Strike Rate below 50', -6, 'SR', 0, 49.99),
  ('Bowling', 'Wicket', 25, NULL, NULL, NULL),
  ('Bowling', 'LBW/Bowled Bonus', 8, NULL, NULL, NULL),
  ('Bowling', 'Dot Ball', 1, NULL, NULL, NULL),
  ('Bowling', '4 Wickets Bonus', 8, NULL, NULL, NULL),
  ('Bowling', '5 Wickets Bonus', 16, NULL, NULL, NULL),
  ('Bowling', '6 Wickets Bonus', 24, NULL, NULL, NULL),
  ('Fielding', 'Catch', 8, NULL, NULL, NULL),
  ('Fielding', 'Stumping', 12, NULL, NULL, NULL),
  ('Fielding', 'Run Out (Direct hit)', 12, NULL, NULL, NULL),
  ('Fielding', 'Run Out (Not a direct hit)', 6, NULL, NULL, NULL),
  ('General', 'In Starting 11', 4, NULL, NULL, NULL),
  ('General', 'Playing Substitute', 4, NULL, NULL, NULL);

SET FOREIGN_KEY_CHECKS = 1;
