INSERT INTO properties (name, timezone, currency)
VALUES ('Elysian Retreat', 'Europe/Athens', 'EUR')
ON CONFLICT DO NOTHING;

INSERT INTO room_types (slug, category, name, short_description, description, base_price_cents, max_adults, max_children, area_m2, bed_type)
VALUES
('deluxe-sea-view-room','Room','Deluxe Sea View Room','Sunlit spaces with panoramic views and refined modern interiors.','A calm, light-filled retreat with a private balcony looking across the Aegean. Natural stone, linen textures and quiet details create a restorative stay.',58000,2,1,40,'King Bed'),
('infinity-suite','Suite','Infinity Suite','A private sanctuary above the sea, featuring an expansive terrace.','The Infinity Suite blends contemporary luxury with the timeless charm of the Mediterranean, offering panoramic views, an expansive terrace, and a private infinity pool for moments of pure indulgence.',125000,2,1,85,'King Bed'),
('premier-villa','Villa','Premier Villa','Secluded luxury with unmatched vistas and generous living spaces.','A secluded villa composed around the landscape, with a private pool, layered terraces and thoughtful service for slow Mediterranean days.',280000,4,2,150,'King Bed'),
('garden-terrace-suite','Suite','Garden Terrace Suite','A tranquil retreat surrounded by Mediterranean gardens.','A restorative hideaway wrapped in fragrant gardens, with a generous terrace for morning coffee and long, unhurried lunches.',75000,2,1,55,'King Bed'),
('signature-junior-suite','Suite','Signature Junior Suite','Sophisticated interiors with a generous terrace overlooking the caldera.','An intimate suite with a generous sea-facing terrace, warm oak detailing and the quiet luxury of a deeply comfortable stay.',98000,2,1,70,'King Bed'),
('elysian-grand-villa','Villa','Elysian Grand Villa','The ultimate expression of luxury, with multiple bedrooms and a private infinity pool.','A private residence for longer escapes, designed around sunset views, generous gathering spaces and bespoke service.',450000,6,2,250,'King Beds'),
('caldera-pool-suite','Suite','Caldera Pool Suite','A private pool suite framed by uninterrupted caldera views.','A serene suite with a heated plunge pool, shaded terrace and a front-row seat to the changing colours of the Aegean.',165000,2,1,95,'King Bed'),
('olive-grove-villa','Villa','Olive Grove Villa','A secluded garden residence for relaxed island living.','Tucked into fragrant olive groves, this spacious villa combines a private pool, outdoor kitchen and generous interiors for families or friends.',320000,4,2,180,'King Beds')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, base_price_cents=EXCLUDED.base_price_cents, updated_at=now();

INSERT INTO room_units (room_type_id, code)
SELECT rt.id, units.code
FROM room_types rt
JOIN (VALUES
  ('deluxe-sea-view-room','DS-101'),('deluxe-sea-view-room','DS-102'),('deluxe-sea-view-room','DS-103'),
  ('infinity-suite','IS-201'),('infinity-suite','IS-202'),('infinity-suite','IS-203'),
  ('premier-villa','PV-301'),('premier-villa','PV-302'),
  ('garden-terrace-suite','GT-401'),('garden-terrace-suite','GT-402'),
  ('signature-junior-suite','SJ-501'),('signature-junior-suite','SJ-502'),('signature-junior-suite','SJ-503'),
  ('elysian-grand-villa','EG-601'),
  ('caldera-pool-suite','CP-701'),('caldera-pool-suite','CP-702'),
  ('olive-grove-villa','OG-801')
) AS units(slug, code) ON units.slug = rt.slug
ON CONFLICT (code) DO NOTHING;

INSERT INTO amenities (name) VALUES
('Sea View'),('Private Pool'),('Private Infinity Pool'),('Private Terrace'),('Butler Service'),('Spa Access'),('Complimentary Breakfast'),('Airport Transfer')
ON CONFLICT (name) DO NOTHING;

INSERT INTO room_type_amenities (room_type_id, amenity_id)
SELECT rt.id, a.id FROM room_types rt CROSS JOIN amenities a
WHERE (rt.slug = 'infinity-suite' AND a.name IN ('Sea View','Private Infinity Pool','Private Terrace','Complimentary Breakfast','Airport Transfer'))
   OR (rt.slug = 'deluxe-sea-view-room' AND a.name IN ('Sea View','Private Terrace','Complimentary Breakfast'))
   OR (rt.slug = 'premier-villa' AND a.name IN ('Sea View','Private Pool','Private Terrace','Butler Service'))
   OR (rt.slug = 'garden-terrace-suite' AND a.name IN ('Private Terrace','Spa Access'))
   OR (rt.slug = 'signature-junior-suite' AND a.name IN ('Sea View','Private Terrace'))
   OR (rt.slug = 'elysian-grand-villa' AND a.name IN ('Sea View','Private Infinity Pool','Butler Service','Airport Transfer'))
   OR (rt.slug = 'caldera-pool-suite' AND a.name IN ('Sea View','Private Pool','Private Terrace','Complimentary Breakfast'))
   OR (rt.slug = 'olive-grove-villa' AND a.name IN ('Private Pool','Private Terrace','Butler Service','Airport Transfer'))
ON CONFLICT DO NOTHING;

INSERT INTO room_images (room_type_id, url, alt_text, sort_order)
SELECT rt.id, images.url, images.alt_text, images.sort_order
FROM room_types rt
JOIN (VALUES
  ('deluxe-sea-view-room','https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1400&q=84','Deluxe Sea View Room',0),
  ('deluxe-sea-view-room','https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=84','Deluxe Sea View Room interior',1),
  ('infinity-suite','https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=86','Infinity Suite sea view',0),
  ('infinity-suite','https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=84','Infinity Suite living area',1),
  ('infinity-suite','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=84','Infinity Suite terrace',2),
  ('premier-villa','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=84','Premier Villa',0),
  ('garden-terrace-suite','https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=84','Garden Terrace Suite',0),
  ('signature-junior-suite','https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1400&q=84','Signature Junior Suite',0),
  ('elysian-grand-villa','https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=84','Elysian Grand Villa',0),
  ('caldera-pool-suite','https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=84','Caldera Pool Suite',0),
  ('caldera-pool-suite','https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=84','Caldera Pool Suite pool',1),
  ('olive-grove-villa','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=84','Olive Grove Villa',0),
  ('olive-grove-villa','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=84','Olive Grove Villa garden',1)
) AS images(slug, url, alt_text, sort_order) ON images.slug = rt.slug
WHERE NOT EXISTS (SELECT 1 FROM room_images existing WHERE existing.room_type_id = rt.id AND existing.url = images.url);

INSERT INTO rate_plans (room_type_id, slug, name, breakfast_included, cancellation_window_days)
SELECT rt.id, 'flexible', 'Flexible Rate', true, 7 FROM room_types rt
ON CONFLICT (room_type_id, slug) DO NOTHING;

INSERT INTO spa_services (name, description, duration_minutes, price_cents)
SELECT * FROM (VALUES
  ('Salt & Stone Ritual','A mineral-rich full-body ritual inspired by the island.',90,18500),
  ('Elysian Massage','Personalised restorative massage for deep release.',60,14000),
  ('Stillness Facial','A quiet, luminous facial using Mediterranean botanicals.',60,12500)
) AS service(name, description, duration_minutes, price_cents)
WHERE NOT EXISTS (SELECT 1 FROM spa_services WHERE spa_services.name = service.name);

INSERT INTO dining_venues (name, description, cuisine)
SELECT * FROM (VALUES
  ('The Horizon','Sunset dining above the waterline.','Mediterranean'),
  ('The Courtyard','A garden table for slow afternoons.','Island-inspired')
) AS venue(name, description, cuisine)
WHERE NOT EXISTS (SELECT 1 FROM dining_venues WHERE dining_venues.name = venue.name);

INSERT INTO experiences (slug, name, description, price_cents)
VALUES
('yacht-charters','Yacht Charters','Sail into unforgettable moments.',85000),
('cultural-journeys','Cultural Journeys','Discover a richer perspective.',25000),
('bespoke-excursions','Bespoke Excursions','Tailored to your passions.',NULL)
ON CONFLICT (slug) DO NOTHING;
