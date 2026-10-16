CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS properties (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Europe/Athens',
  currency CHAR(3) NOT NULL DEFAULT 'EUR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','super_admin','hotel_manager','front_desk','reservations_staff','housekeeping','content_editor')),
  email_verified_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  csrf_token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS room_types (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('Room','Suite','Villa')),
  name TEXT NOT NULL,
  short_description TEXT NOT NULL,
  description TEXT NOT NULL,
  base_price_cents INTEGER NOT NULL CHECK (base_price_cents >= 0),
  max_adults INTEGER NOT NULL CHECK (max_adults > 0),
  max_children INTEGER NOT NULL DEFAULT 0 CHECK (max_children >= 0),
  area_m2 INTEGER NOT NULL CHECK (area_m2 > 0),
  bed_type TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS room_units (
  id BIGSERIAL PRIMARY KEY,
  room_type_id BIGINT NOT NULL REFERENCES room_types(id),
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','occupied','maintenance','out_of_service')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS room_images (
  id BIGSERIAL PRIMARY KEY,
  room_type_id BIGINT NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS amenities (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS room_type_amenities (
  room_type_id BIGINT NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
  amenity_id BIGINT NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (room_type_id, amenity_id)
);

CREATE TABLE IF NOT EXISTS rate_plans (
  id BIGSERIAL PRIMARY KEY,
  room_type_id BIGINT NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  breakfast_included BOOLEAN NOT NULL DEFAULT false,
  cancellation_window_days INTEGER NOT NULL DEFAULT 7 CHECK (cancellation_window_days >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (room_type_id, slug)
);

CREATE TABLE IF NOT EXISTS seasonal_rates (
  id BIGSERIAL PRIMARY KEY,
  room_type_id BIGINT NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
  rate_plan_id BIGINT NOT NULL REFERENCES rate_plans(id) ON DELETE CASCADE,
  starts_on DATE NOT NULL,
  ends_on DATE NOT NULL,
  nightly_price_cents INTEGER NOT NULL CHECK (nightly_price_cents >= 0),
  CHECK (ends_on > starts_on)
);

CREATE TABLE IF NOT EXISTS maintenance_blocks (
  id BIGSERIAL PRIMARY KEY,
  room_unit_id BIGINT NOT NULL REFERENCES room_units(id) ON DELETE CASCADE,
  starts_on DATE NOT NULL,
  ends_on DATE NOT NULL,
  reason TEXT NOT NULL,
  CHECK (ends_on > starts_on)
);

CREATE TABLE IF NOT EXISTS bookings (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  room_type_id BIGINT NOT NULL REFERENCES room_types(id),
  room_unit_id BIGINT REFERENCES room_units(id),
  rate_plan_id BIGINT REFERENCES rate_plans(id),
  status TEXT NOT NULL DEFAULT 'held' CHECK (status IN ('held','awaiting_payment','confirmed','checked_in','checked_out','cancelled','expired','no_show')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','pending','paid','failed','refunded','partially_refunded')),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  adults INTEGER NOT NULL CHECK (adults > 0),
  children INTEGER NOT NULL DEFAULT 0 CHECK (children >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'EUR',
  subtotal_cents INTEGER NOT NULL CHECK (subtotal_cents >= 0),
  discount_cents INTEGER NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
  tax_cents INTEGER NOT NULL DEFAULT 0 CHECK (tax_cents >= 0),
  service_fee_cents INTEGER NOT NULL DEFAULT 0 CHECK (service_fee_cents >= 0),
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  nightly_rates JSONB NOT NULL DEFAULT '[]'::jsonb,
  cancellation_policy JSONB NOT NULL DEFAULT '{}'::jsonb,
  guest_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (check_out > check_in)
);

CREATE INDEX IF NOT EXISTS bookings_search_idx ON bookings (check_in, check_out, room_type_id);
CREATE INDEX IF NOT EXISTS bookings_user_idx ON bookings (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings (status, check_in);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS bookings_idempotency_key_idx ON bookings (idempotency_key) WHERE idempotency_key IS NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_no_overlapping_unit_reservations') THEN
    ALTER TABLE bookings ADD CONSTRAINT bookings_no_overlapping_unit_reservations
      EXCLUDE USING gist (room_unit_id WITH =, daterange(check_in, check_out, '[)') WITH &&)
      WHERE (room_unit_id IS NOT NULL AND status IN ('held','awaiting_payment','confirmed','checked_in'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS reservation_holds (
  id BIGSERIAL PRIMARY KEY,
  hold_token TEXT NOT NULL UNIQUE,
  room_type_id BIGINT NOT NULL REFERENCES room_types(id),
  room_unit_id BIGINT NOT NULL REFERENCES room_units(id),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','converted','expired','released')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (check_out > check_in)
);

CREATE INDEX IF NOT EXISTS reservation_holds_active_idx ON reservation_holds (room_unit_id, check_in, check_out, status, expires_at);

CREATE TABLE IF NOT EXISTS booking_events (
  id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  actor_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('demo','pay_at_property','stripe')),
  status TEXT NOT NULL CHECK (status IN ('unpaid','pending','paid','failed','refunded','partially_refunded')),
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'EUR',
  provider_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_events (
  id BIGSERIAL PRIMARY KEY,
  payment_id BIGINT REFERENCES payments(id) ON DELETE CASCADE,
  provider_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS refunds (
  id BIGSERIAL PRIMARY KEY,
  payment_id BIGINT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  status TEXT NOT NULL CHECK (status IN ('pending','succeeded','failed')),
  provider_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS spa_services (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS spa_appointments (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  service_id BIGINT NOT NULL REFERENCES spa_services(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','confirmed','declined','cancelled','completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS spa_appointments_date_idx ON spa_appointments (appointment_date, appointment_time, status);

CREATE TABLE IF NOT EXISTS dining_venues (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  cuisine TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS dining_reservations (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  venue_id BIGINT NOT NULL REFERENCES dining_venues(id),
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  party_size INTEGER NOT NULL CHECK (party_size > 0),
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','confirmed','declined','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS experiences (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price_cents INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS experience_bookings (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  experience_id BIGINT NOT NULL REFERENCES experiences(id),
  experience_date DATE NOT NULL,
  guest_count INTEGER NOT NULL CHECK (guest_count > 0),
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','confirmed','declined','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_inquiries (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  topic TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_progress','resolved','spam')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_pages (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  published_at TIMESTAMPTZ,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS content_pages_public_idx ON content_pages (status, slug);
