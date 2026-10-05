-- TrackStar website: database tables.
--
-- How to run: Hepsia control panel > Databases > phpMyAdmin > open your database
-- (the one named in api/config.php) > "SQL" tab > paste this whole file > "Go".
-- It is safe to run again: tables that already exist are left alone.
--
-- All times are stored in UTC.

CREATE TABLE IF NOT EXISTS operator_enquiries (
  id                      CHAR(36)      NOT NULL,
  full_name               VARCHAR(120)  NOT NULL,
  company                 VARCHAR(160)  NOT NULL,
  phone_e164              VARCHAR(20)   NOT NULL,
  email                   VARCHAR(254)  NOT NULL,
  country                 VARCHAR(100)  NOT NULL,
  fleet_size              VARCHAR(10)   NOT NULL,
  help_type               VARCHAR(40)   NOT NULL,
  current_ticketing       VARCHAR(20)   NOT NULL,
  current_system_name     VARCHAR(120)  NULL,
  message                 TEXT          NULL,
  marketing_consent       TINYINT(1)    NOT NULL DEFAULT 0,
  marketing_consent_at    DATETIME      NULL,
  privacy_notice_version  VARCHAR(40)   NOT NULL,
  utm_source              VARCHAR(100)  NULL,
  utm_medium              VARCHAR(100)  NULL,
  utm_campaign            VARCHAR(100)  NULL,
  created_at              DATETIME      NOT NULL,
  PRIMARY KEY (id),
  KEY operator_enquiries_created_at_idx (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contact_enquiries (
  id                      CHAR(36)      NOT NULL,
  name                    VARCHAR(120)  NOT NULL,
  email                   VARCHAR(254)  NOT NULL,
  phone_e164              VARCHAR(20)   NULL,
  enquiry_type            VARCHAR(20)   NOT NULL,
  message                 TEXT          NOT NULL,
  privacy_notice_version  VARCHAR(40)   NOT NULL,
  created_at              DATETIME      NOT NULL,
  PRIMARY KEY (id),
  KEY contact_enquiries_created_at_idx (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Spam protection: how many submissions each (scrambled) visitor address made in each
-- 10 minute window. Old rows are cleaned up automatically.
CREATE TABLE IF NOT EXISTS rate_limits (
  limiter_key   VARCHAR(100)  NOT NULL,
  window_start  DATETIME      NOT NULL,
  hits          INT UNSIGNED  NOT NULL DEFAULT 1,
  PRIMARY KEY (limiter_key, window_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
