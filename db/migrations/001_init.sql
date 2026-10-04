CREATE TABLE IF NOT EXISTS operator_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  company text NOT NULL,
  phone_e164 text NOT NULL,
  email text NOT NULL,
  country text NOT NULL,
  fleet_size text NOT NULL,
  help_type text NOT NULL,
  current_ticketing text NOT NULL,
  current_system_name text,
  message text,
  marketing_consent boolean NOT NULL DEFAULT false,
  marketing_consent_at timestamptz,
  privacy_notice_version text NOT NULL,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS operator_enquiries_created_at_idx ON operator_enquiries (created_at DESC);

CREATE TABLE IF NOT EXISTS contact_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone_e164 text,
  enquiry_type text NOT NULL,
  message text NOT NULL,
  privacy_notice_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contact_enquiries_created_at_idx ON contact_enquiries (created_at DESC);

CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text
);

CREATE TABLE IF NOT EXISTS admin_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rate_limits (
  key text NOT NULL,
  window_start timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 1,
  PRIMARY KEY (key, window_start)
);

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  succeeded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_login_attempts_lookup_idx ON admin_login_attempts (ip_hash, created_at DESC);

INSERT INTO site_settings (key, value) VALUES ('instatickets_status', 'prelaunch') ON CONFLICT (key) DO NOTHING;
