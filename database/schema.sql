CREATE TABLE IF NOT EXISTS reports (
  id CHAR(36) NOT NULL PRIMARY KEY,
  owner_id CHAR(36) NOT NULL,
  type ENUM('lost', 'found') NOT NULL,
  item_name VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(160) NOT NULL DEFAULT '',
  occurred_at DATETIME(3) NULL,
  image_data MEDIUMBLOB NULL,
  image_mime VARCHAR(32) NULL,
  status ENUM('open', 'resolved', 'closed') NOT NULL DEFAULT 'open',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX reports_owner_created (owner_id, created_at),
  INDEX reports_browse (status, type, created_at),
  FULLTEXT INDEX reports_search (item_name, description, location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS claims (
  id CHAR(36) NOT NULL PRIMARY KEY,
  report_id CHAR(36) NOT NULL,
  report_owner_id CHAR(36) NOT NULL,
  claimant_id CHAR(36) NOT NULL,
  claimant_name VARCHAR(100) NOT NULL,
  message VARCHAR(1000) NOT NULL,
  status ENUM('pending', 'accepted', 'declined') NOT NULL DEFAULT 'pending',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE INDEX claims_report_claimant (report_id, claimant_id),
  INDEX claims_owner_status (report_owner_id, status, created_at),
  INDEX claims_claimant_status (claimant_id, status, created_at),
  CONSTRAINT claims_report_fk FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS sightings (
  id CHAR(36) NOT NULL PRIMARY KEY,
  report_id CHAR(36) NOT NULL,
  reporter_id CHAR(36) NOT NULL,
  description VARCHAR(500) NOT NULL DEFAULT '',
  location VARCHAR(160) NOT NULL DEFAULT '',
  occurred_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX sightings_report_created (report_id, created_at),
  INDEX sightings_reporter_created (reporter_id, created_at),
  CONSTRAINT sightings_report_fk FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS found_responses (
  id CHAR(36) NOT NULL PRIMARY KEY,
  lost_report_id CHAR(36) NOT NULL,
  found_report_id CHAR(36) NOT NULL,
  finder_id CHAR(36) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX found_responses_report_finder (lost_report_id, finder_id),
  INDEX found_responses_found_report (found_report_id),
  INDEX found_responses_lost_created (lost_report_id, created_at),
  CONSTRAINT found_responses_lost_fk FOREIGN KEY (lost_report_id) REFERENCES reports(id) ON DELETE CASCADE,
  CONSTRAINT found_responses_found_fk FOREIGN KEY (found_report_id) REFERENCES reports(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS notifications (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  kind VARCHAR(40) NOT NULL,
  title VARCHAR(120) NOT NULL,
  body VARCHAR(500) NOT NULL,
  href VARCHAR(255) NOT NULL,
  read_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX notifications_user_read_created (user_id, read_at, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
