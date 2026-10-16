let rooms = [
  {
    slug: 'deluxe-sea-view-room',
    type: 'Room',
    name: 'Deluxe Sea View Room',
    short: 'Sunlit spaces with panoramic views and refined modern interiors.',
    description: 'A calm, light-filled retreat with a private balcony looking across the Aegean. Natural stone, linen textures and quiet details create a restorative stay.',
    price: 580,
    guests: 2,
    area: 40,
    bed: 'King Bed',
    tag: '',
    images: [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=84',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=84',
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=84'
    ],
    amenities: ['2 Adults', '40 m² / 430 ft²', 'Sea View', 'King Bed', 'Private Terrace']
  },
  {
    slug: 'infinity-suite',
    type: 'Suite',
    name: 'Infinity Suite',
    short: 'A private sanctuary above the sea, featuring an expansive terrace.',
    description: 'The Infinity Suite blends contemporary luxury with the timeless charm of the Mediterranean, offering panoramic views, an expansive terrace, and a private infinity pool for moments of pure indulgence.',
    price: 1250,
    guests: 2,
    area: 85,
    bed: 'King Bed',
    tag: 'Most Popular',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=86',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=84',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=84',
      'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=84',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=84'
    ],
    amenities: ['2 Adults (+1 Child optional)', '85 m² / 915 ft²', 'Private Infinity Pool', 'Ocean & Caldera Views', 'King Bed', 'Private Terrace']
  },
  {
    slug: 'premier-villa',
    type: 'Villa',
    name: 'Premier Villa',
    short: 'Secluded luxury with unmatched vistas and generous living spaces.',
    description: 'A secluded villa composed around the landscape, with a private pool, layered terraces and thoughtful service for slow Mediterranean days.',
    price: 2800,
    guests: 4,
    area: 150,
    bed: 'King Bed',
    tag: '',
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=84',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=84',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=84'
    ],
    amenities: ['4 Adults', '150 m² / 1,615 ft²', 'Private Pool', 'Sea View', 'Butler Service']
  },
  {
    slug: 'garden-terrace-suite',
    type: 'Suite',
    name: 'Garden Terrace Suite',
    short: 'A tranquil retreat surrounded by Mediterranean gardens.',
    description: 'A restorative hideaway wrapped in fragrant gardens, with a generous terrace for morning coffee and long, unhurried lunches.',
    price: 750,
    guests: 2,
    area: 55,
    bed: 'King Bed',
    tag: '',
    images: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=84',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=84'
    ],
    amenities: ['2 Adults', '55 m² / 592 ft²', 'Garden View', 'King Bed', 'Terrace']
  },
  {
    slug: 'signature-junior-suite',
    type: 'Suite',
    name: 'Signature Junior Suite',
    short: 'Sophisticated interiors with a generous terrace overlooking the caldera.',
    description: 'An intimate suite with a generous sea-facing terrace, warm oak detailing and the quiet luxury of a deeply comfortable stay.',
    price: 980,
    guests: 2,
    area: 70,
    bed: 'King Bed',
    tag: '',
    images: [
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=84',
      'https://images.unsplash.com/photo-1590490359683-658d3d23f972?auto=format&fit=crop&w=1200&q=84'
    ],
    amenities: ['2 Adults', '70 m² / 753 ft²', 'Caldera View', 'King Bed', 'Sea View']
  },
  {
    slug: 'elysian-grand-villa',
    type: 'Villa',
    name: 'Elysian Grand Villa',
    short: 'The ultimate expression of luxury, with multiple bedrooms and a private infinity pool.',
    description: 'A private residence for longer escapes, designed around sunset views, generous gathering spaces and bespoke service.',
    price: 4500,
    guests: 6,
    area: 250,
    bed: 'King Beds',
    tag: 'Exclusive',
    images: [
      'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=84',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=84'
    ],
    amenities: ['6 Adults', '250 m² / 2,691 ft²', 'Private Infinity Pool', 'Three Bedrooms', 'Butler Service']
  },
  {
    slug: 'caldera-pool-suite',
    type: 'Suite',
    name: 'Caldera Pool Suite',
    short: 'A private pool suite framed by uninterrupted caldera views.',
    description: 'A serene suite with a heated plunge pool, shaded terrace and a front-row seat to the changing colours of the Aegean.',
    price: 1650,
    guests: 2,
    area: 95,
    bed: 'King Bed',
    tag: '',
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=84',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=84'
    ],
    amenities: ['2 Adults', '95 m² / 1,023 ft²', 'Private Pool', 'Caldera View', 'Private Terrace']
  },
  {
    slug: 'olive-grove-villa',
    type: 'Villa',
    name: 'Olive Grove Villa',
    short: 'A secluded garden residence for relaxed island living.',
    description: 'Tucked into fragrant olive groves, this spacious villa combines a private pool, outdoor kitchen and generous interiors for families or friends.',
    price: 3200,
    guests: 4,
    area: 180,
    bed: 'King Beds',
    tag: '',
    images: [
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=84',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=84'
    ],
    amenities: ['4 Adults', '180 m² / 1,938 ft²', 'Private Pool', 'Olive Grove', 'Butler Service']
  }
];

const experiences = [
  { title: 'Yacht Charters', text: 'Sail into unforgettable moments.', image: 'https://images.unsplash.com/photo-1540946485063-a40da27545f8?auto=format&fit=crop&w=900&q=84' },
  { title: 'Cultural Journeys', text: 'Discover a richer perspective.', image: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=900&q=84' },
  { title: 'Bespoke Excursions', text: 'Tailored to your passions.', image: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=900&q=84' }
];

const state = {
  saved: new Set(),
  booking: { room: rooms[1], checkIn: '', checkOut: '', adults: 2, children: 0 },
  galleryIndex: 0,
  roomFilter: 'All Rooms & Suites',
  roomAmenityFilter: '',
  bedFilter: '',
  maxPrice: 5000,
  sort: 'Recommended'
};

const app = document.querySelector('#app');

function dateOffset(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return 'Select Date';
  const text = String(value);
  const date = /^\d{4}-\d{2}-\d{2}/.test(text) ? new Date(`${text.slice(0, 10)}T12:00:00`) : new Date(text);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function nightsBetween(start, end) {
  if (!start || !end) return 1;
  const a = new Date(`${start}T12:00:00`);
  const b = new Date(`${end}T12:00:00`);
  return Math.max(1, Math.round((b - a) / 86400000));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
}

function route() {
  return location.hash.replace(/^#/, '') || 'home';
}

function navigate(next) {
  location.hash = next;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function header(active = 'home', solid = false) {
  const links = [
    ['home', 'Home'], ['rooms', 'Rooms & Suites'], ['dining', 'Dining'], ['spa', 'Spa'], ['experiences', 'Experiences'], ['about', 'About'], ['contact', 'Contact']
  ];
  return `<header class="site-header ${solid ? 'solid' : ''}" id="site-header">
    <div class="nav-wrap">
      <a class="brand" href="#home" data-route="home">Elysian Retreat<small>Coastal Resort & Spa</small></a>
      <nav class="primary-nav" aria-label="Primary navigation">${links.map(([id, label]) => `<a href="#${id}" data-route="${id}" class="${active === id ? 'active' : ''}">${label}</a>`).join('')}</nav>
      <div class="header-actions"><span class="header-lang">EN / EUR</span><a class="header-lang" href="#login" data-route="login">Sign in</a><button class="btn btn-primary" data-action="book-now">Book Now <span class="arrow">→</span></button><button class="menu-toggle" aria-label="Toggle menu" aria-expanded="false" data-action="menu">☰</button></div>
    </div>
  </header>`;
}

function footer() {
  return `<footer class="site-footer">
    <div class="footer-grid">
      <div class="footer-brand"><a class="brand" href="#home" data-route="home">Elysian Retreat<small>Coastal Resort & Spa</small></a></div>
      <div><div class="footer-title">Explore</div><div class="footer-links"><a href="#rooms" data-route="rooms">Rooms & Suites</a><a href="#dining" data-route="dining">Dining</a><a href="#spa" data-route="spa">Spa & Wellness</a><a href="#experiences" data-route="experiences">Experiences</a></div></div>
      <div><div class="footer-title">The House</div><div class="footer-links"><a href="#about" data-route="about">Our Story</a><a href="#contact" data-route="contact">Contact</a><a href="#faq" data-route="faq">FAQ</a><a href="#privacy" data-route="privacy">Privacy</a></div></div>
      <div><div class="footer-title">Find us</div><p class="footer-note">Elysian Retreat<br />Mavrata Bay, Santorini<br />Greece</p><p class="footer-note">+30 22860 00000<br />stay@elysianretreat.example</p></div>
      <div><div class="footer-title">Join our journey</div><p class="footer-note">The first to receive exclusive offers and inspiring updates.</p><form class="newsletter-form" data-form="newsletter"><input name="email" type="email" placeholder="Your email address" aria-label="Your email address" required /><button aria-label="Subscribe">→</button></form></div>
    </div>
    <div class="footer-bottom"><span>© 2026 Elysian Retreat. Demo property concept.</span><span>Privacy Policy &nbsp; | &nbsp; Terms & Conditions &nbsp; | &nbsp; Sitemap</span></div>
  </footer>`;
}

function pageShell(content, active, solid = true) {
  return `${header(active, solid)}<main>${content}</main>${footer()}`;
}

function bookingBar() {
  const b = state.booking;
  return `<form class="booking-bar" data-form="search">
    <div class="booking-field date"><label for="home-checkin">Check in</label><input id="home-checkin" name="checkIn" type="date" min="${dateOffset(0)}" value="${b.checkIn || dateOffset(30)}" required /></div>
    <div class="booking-field date"><label for="home-checkout">Check out</label><input id="home-checkout" name="checkOut" type="date" min="${dateOffset(1)}" value="${b.checkOut || dateOffset(34)}" required /></div>
    <div class="booking-field guests"><label for="home-adults">Guests</label><select id="home-adults" name="adults"><option value="1">1 Adult</option><option value="2" selected>2 Adults</option><option value="3">3 Adults</option><option value="4">4 Adults</option><option value="5">5 Adults</option><option value="6">6 Adults</option></select></div>
    <div class="booking-field rooms"><label for="home-room">Suites</label><select id="home-room" name="room"><option value="all">All Suites</option>${rooms.map(room => `<option value="${room.slug}">${room.name}</option>`).join('')}</select></div>
    <button class="btn btn-primary" type="submit">Search Availability <span class="arrow">→</span></button>
  </form>`;
}

function roomCard(room) {
  const saved = state.saved.has(room.slug);
  return `<article class="room-card">
    <div class="card-image"><img src="${room.images[0]}" alt="${room.name}" loading="lazy" />${room.tag ? `<span class="card-tag">${room.tag}</span>` : ''}<button class="favorite ${saved ? 'saved' : ''}" aria-label="${saved ? 'Remove from' : 'Save'} wishlist" data-action="favorite" data-slug="${room.slug}">${saved ? '♥' : '♡'}</button></div>
    <div class="card-body"><div class="card-kicker">${room.type}</div><h3>${room.name}</h3><p>${room.short}</p><div class="card-meta"><span><b>♙</b>${room.guests} Guests</span><span><b>□</b>${room.area} m²</span></div><div class="card-footer"><div class="price">From <strong>€${room.price.toLocaleString()}</strong> / night</div><button class="btn btn-primary" data-action="room" data-slug="${room.slug}">View Suite <span class="arrow">→</span></button></div></div>
  </article>`;
}

function renderHome() {
  const content = `<section class="hero"><div class="hero-image" role="img" aria-label="Mediterranean resort at golden hour"></div><div class="hero-inner"><p class="eyebrow">A higher kind of escape</p><h1>Where Every Moment<br />Becomes Extraordinary</h1><p class="hero-copy">A refined coastal retreat where timeless beauty, genuine hospitality and unforgettable experiences meet.</p><button class="btn btn-light" data-action="scroll" data-target="rooms-preview">Discover the retreat <span class="arrow">→</span></button></div><div class="hero-caption"><span>✦</span>More than a stay<br />A state of being</div>${bookingBar()}</section>
    <section class="section rooms-section" id="rooms-preview"><div class="section-inner"><div class="section-heading"><div><p class="eyebrow">Our rooms & suites</p><h2>Iconic Stays, Breathtaking Views</h2></div><div><p>Elegantly designed rooms and suites that blend contemporary luxury with the timeless charm of the Mediterranean.</p><a class="section-link" href="#rooms" data-route="rooms">Explore all rooms <span>→</span></a></div></div><div class="room-grid">${rooms.slice(0, 3).map(roomCard).join('')}</div></div></section>
    <section class="experience-band"><div class="experience-image"></div><div class="experience-copy"><p class="eyebrow">Curated experiences</p><h2>More Than a Destination</h2><p>From private yacht charters to cultural journeys, each experience is designed to connect you with the extraordinary.</p><a class="section-link" href="#experiences" data-route="experiences">Explore experiences <span>→</span></a><div class="experience-cards">${experiences.map(experience => `<a class="experience-card" href="#experiences" data-route="experiences" style="background-image:url('${experience.image}')"><h4>${experience.title}</h4><p>${experience.text}</p></a>`).join('')}</div></div></section>
    <section class="split-feature spa"><div class="split-image"></div><div class="split-copy"><p class="eyebrow">Spa & wellness</p><h2>Renew, Restore, Reconnect</h2><p>Holistic treatments inspired by nature, designed for complete well-being.</p><a class="btn btn-text" href="#spa" data-route="spa">Explore spa <span class="arrow">→</span></a></div></section>
    <section class="split-feature dining reverse"><div class="split-image"></div><div class="split-copy"><p class="eyebrow">Fine dining</p><h2>A Taste of the Extraordinary</h2><p>Exceptional cuisine, inspired by the land, the sea and the Mediterranean way of life.</p><a class="btn btn-text" href="#dining" data-route="dining">Explore dining <span class="arrow">→</span></a></div></section>
    <section class="section testimonial-section"><div class="section-inner testimonial-layout"><div><p class="eyebrow">Guest testimonials</p><h2>Stories from Our Guests</h2></div><div class="testimonial-grid"><div class="testimonial"><p>“An unforgettable experience. Every detail was perfection — from the breathtaking views to the exceptional service.”</p><div class="person"><div class="avatar"></div><div><strong>Sophia L.</strong><small>United States</small><span class="stars">★★★★★</span></div></div></div><div class="testimonial"><p>“Elysian Retreat is pure magic. A place where luxury feels effortless and every moment is unforgettable.”</p><div class="person"><div class="avatar"></div><div><strong>James T.</strong><small>United Kingdom</small><span class="stars">★★★★★</span></div></div></div><div class="testimonial"><p>“The most beautiful resort we’ve ever stayed at. It’s more than a destination — it’s a feeling.”</p><div class="person"><div class="avatar"></div><div><strong>Emma R.</strong><small>Australia</small><span class="stars">★★★★★</span></div></div></div></div></div></section>
    <section class="newsletter"><div class="newsletter-inner"><p class="eyebrow">A little inspiration</p><h2>Stay in the know</h2><p>Receive considered notes from the coast, from new experiences to seasonal escapes.</p><form class="newsletter-form" data-form="newsletter"><input name="email" type="email" placeholder="Your email address" required /><button aria-label="Subscribe">→</button></form></div></section>`;
  app.innerHTML = `${header('home')}<main>${content}</main>${footer()}`;
}

function renderRooms() {
  let visible = state.roomFilter === 'All Rooms & Suites' ? rooms : rooms.filter(room => room.type === state.roomFilter.replace(/s$/, ''));
  if (state.roomAmenityFilter) visible = visible.filter(room => (room.amenities || []).some(amenity => amenity.includes(state.roomAmenityFilter)));
  if (state.bedFilter) visible = visible.filter(room => room.bed.includes(state.bedFilter.replace(' Beds', ' Bed')));
  visible = visible.filter(room => room.price <= state.maxPrice);
  if (state.sort === 'Price: Low to High') visible = [...visible].sort((a, b) => a.price - b.price);
  if (state.sort === 'Price: High to Low') visible = [...visible].sort((a, b) => b.price - a.price);
  if (state.sort === 'Largest Room') visible = [...visible].sort((a, b) => b.area - a.area);
  if (state.sort === 'Most Guests') visible = [...visible].sort((a, b) => b.guests - a.guests);
  const content = `<section class="page-hero rooms"><div class="page-hero-inner"><div class="breadcrumbs"><a href="#home" data-route="home">Home</a><span>›</span><span>Rooms & Suites</span></div><h1>Rooms & Suites</h1><p>Elegantly designed retreats where contemporary luxury meets the timeless charm of the Mediterranean.</p></div></section>
    <section class="listing-layout"><div class="listing-toolbar"><div class="category-tabs">${['All Rooms & Suites', 'Rooms', 'Suites', 'Villas'].map(tab => `<button class="${state.roomFilter === tab ? 'active' : ''}" data-action="category" data-category="${tab}">${tab} ${tab === 'All Rooms & Suites' ? '(6)' : ''}</button>`).join('')}</div><div class="sort"><button class="btn btn-outline filter-toggle" data-action="filter-toggle">Filters</button><label for="sort-select">Sort by</label><select id="sort-select" data-action="sort"><option ${state.sort === 'Recommended' ? 'selected' : ''}>Recommended</option><option ${state.sort === 'Price: Low to High' ? 'selected' : ''}>Price: Low to High</option><option ${state.sort === 'Price: High to Low' ? 'selected' : ''}>Price: High to Low</option><option ${state.sort === 'Largest Room' ? 'selected' : ''}>Largest Room</option><option ${state.sort === 'Most Guests' ? 'selected' : ''}>Most Guests</option></select></div></div>
    <aside class="filter-panel" id="filter-panel"><div class="filter-block"><div class="filter-title">Filter by</div><div class="filter-title" style="color:var(--charcoal);letter-spacing:0;text-transform:none;font-size:12px">Room type</div>${['All Rooms & Suites', 'Rooms', 'Suites', 'Villas'].map((type, i) => `<div class="check-row"><label><input type="checkbox" ${state.roomFilter === type ? 'checked' : ''} data-action="category" data-category="${type}" />${type}</label><em>${i === 0 ? 6 : i === 1 ? 1 : i === 2 ? 3 : 2}</em></div>`).join('')}</div><div class="filter-block"><div class="filter-title">Guests</div><select class="form-field" aria-label="Guests"><option>2 Adults</option><option>3 Adults</option><option>4 Adults</option></select></div><div class="filter-block"><div class="filter-title">Price per night</div><div class="range-row"><span>€0</span><span>€5,000+</span></div><input type="range" min="0" max="5000" value="5000" aria-label="Maximum price" /></div><div class="filter-block"><div class="filter-title">Bed type</div><div class="check-row"><label><input type="checkbox" checked />All Bed Types</label></div><div class="check-row"><label><input type="checkbox" />King Bed</label></div><div class="check-row"><label><input type="checkbox" />Twin Beds</label></div></div><div class="filter-block"><div class="filter-title">Amenities</div>${['Private Pool', 'Sea View', 'Terrace or Balcony', 'Spa Access', 'Butler Service'].map(item => `<div class="check-row"><label><input type="checkbox" />${item}</label></div>`).join('')}</div><button class="clear-filter" data-action="clear-filters">Clear all filters →</button></aside>
    <div class="listing-results"><div class="result-count">${visible.length} stays found</div><div class="room-grid">${visible.length ? visible.map(roomCard).join('') : '<div class="empty-state">No stays match those filters.</div>'}</div></div></section>`;
  app.innerHTML = pageShell(content, 'rooms');
  const allRoomsTab = document.querySelector('[data-action="category"][data-category="All Rooms & Suites"]');
  if (allRoomsTab) allRoomsTab.textContent = `All Rooms & Suites (${rooms.length})`;
  document.querySelectorAll('#filter-panel .check-row em').forEach((node, index) => { const type = ['All Rooms & Suites', 'Rooms', 'Suites', 'Villas'][index]; node.textContent = type === 'All Rooms & Suites' ? rooms.length : rooms.filter(room => room.type === type.replace(/s$/, '')).length; });
}

function renderDetail(slug) {
  const room = rooms.find(item => item.slug === slug) || rooms[1];
  state.galleryIndex = Math.min(state.galleryIndex, room.images.length - 1);
  const activeImage = room.images[state.galleryIndex];
  const content = `<section class="detail-content"><div class="breadcrumbs" style="color:var(--muted)"><a href="#home" data-route="home">Home</a><span>›</span><a href="#rooms" data-route="rooms">Rooms & Suites</a><span>›</span><span>${room.name}</span></div><div class="detail-top"><div><div class="gallery-main"><img src="${activeImage}" alt="${room.name}" /><button class="btn btn-light" data-action="lightbox">▧ &nbsp; View gallery <span class="arrow">→</span></button></div><div class="gallery-thumbs">${room.images.map((image, index) => `<button class="${index === state.galleryIndex ? 'active' : ''}" data-action="gallery" data-index="${index}"><img src="${image}" alt="${room.name} view ${index + 1}" /></button>`).join('')}</div></div><div class="detail-copy"><p class="eyebrow">${room.type}</p><h1>${room.name}</h1><div class="rating"><strong>★★★★★</strong><span>Exceptional &nbsp; 4.9 (128 reviews)</span></div><p>${room.description}</p><ul class="amenity-list">${room.amenities.map(item => `<li>${item}</li>`).join('')}</ul></div><aside class="availability-card"><h2>Check Availability</h2><p>Best rates guaranteed when you book direct.</p><form data-form="detail-search"><div class="availability-fields"><div class="form-field"><label>Check in</label><input name="checkIn" type="date" min="${dateOffset(0)}" value="${state.booking.checkIn || dateOffset(30)}" required /></div><div class="form-field"><label>Check out</label><input name="checkOut" type="date" min="${dateOffset(1)}" value="${state.booking.checkOut || dateOffset(34)}" required /></div><div class="form-field full"><label>Guests</label><select name="adults"><option value="1">1 Adult</option><option value="2" selected>2 Adults</option><option value="3">3 Adults</option><option value="4">4 Adults</option></select></div></div><button class="btn btn-primary" type="submit">Reserve now <span class="arrow">→</span></button></form><div class="price-box"><div class="price-line"><span>From</span><strong style="font-family:var(--serif);font-size:23px">€${room.price.toLocaleString()}</strong><span>per night</span></div><div class="price-line"><span>✓</span><span>Free cancellation up to 7 days before arrival</span></div><div class="price-line"><span>♢</span><span>Complimentary breakfast</span></div><div class="price-line"><span>▱</span><span>Airport transfer available</span></div></div></aside></div>
    <div class="detail-highlights"><div class="highlight-intro"><p class="eyebrow">Suite highlights</p><h2>Thoughtfully Designed for Extraordinary Stays</h2></div><div class="highlight"><span class="highlight-icon">∞</span>Private Infinity Pool</div><div class="highlight"><span class="highlight-icon">⌁</span>Expansive Sea View Terrace</div><div class="highlight"><span class="highlight-icon">♧</span>King Bed with Premium Linens</div><div class="highlight"><span class="highlight-icon">☼</span>Indoor & Outdoor Living</div></div>
    <div class="closer-look"><img src="${room.images[Math.min(2, room.images.length - 1)]}" alt="${room.name} terrace and view" loading="lazy" /><div><p class="eyebrow">A closer look</p><h2>Space, Serenity, and Stunning Views</h2><p>Floor-to-ceiling views, considered materials and a quiet connection with nature create a setting where every moment feels extraordinary.</p><button class="btn btn-primary" data-action="lightbox">Explore the gallery <span class="arrow">→</span></button></div></div>
    <div class="availability-calendar"><div class="calendar-head"><h2>Select Your Dates</h2><a class="section-link" href="#booking" data-route="booking">View price calendar →</a></div><div class="months">${calendarMonth(0)}${calendarMonth(1)}</div></div>
    <div style="padding-top:55px"><div class="section-heading"><div><p class="eyebrow">More to explore</p><h2>Similar Stays</h2></div><a class="section-link" href="#rooms" data-route="rooms">View all rooms & suites <span>→</span></a></div><div class="room-grid">${rooms.filter(item => item.slug !== room.slug).slice(0, 3).map(roomCard).join('')}</div></div></section>`;
  app.innerHTML = pageShell(content, 'rooms');
}

function calendarMonth(offset) {
  const base = new Date();
  base.setDate(1);
  base.setMonth(base.getMonth() + offset);
  const label = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(base);
  const firstDay = base.getDay();
  const daysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  let cells = '';
  for (let i = 0; i < firstDay; i += 1) cells += '<span class="muted">·</span>';
  for (let day = 1; day <= daysInMonth; day += 1) cells += `<span class="${day === 14 && offset === 0 ? 'selected' : ''}">${day}</span>`;
  return `<div class="month"><h3>${label}</h3><div class="week"><span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span></div><div class="days">${cells}</div></div>`;
}

function renderBooking() {
  const b = state.booking;
  const room = b.room || rooms[1];
  const nights = nightsBetween(b.checkIn, b.checkOut);
  const subtotal = room.price * nights;
  const taxes = Math.round(subtotal * .12);
  const total = subtotal + taxes;
  const content = `<section class="booking-page"><div class="breadcrumbs" style="color:var(--muted)"><a href="#home" data-route="home">Home</a><span>›</span><span>Reserve your stay</span></div><p class="eyebrow">Your stay, considered</p><h1>Complete Your Reservation</h1><p style="max-width:580px;color:var(--muted);font-family:var(--serif);font-size:18px">A few details before your time by the sea begins. Prices and room allocation are revalidated by the backend before confirmation.</p><div class="booking-layout"><form class="booking-form-card" data-form="reservation"><h2>Guest details</h2><div class="form-grid"><div class="form-field"><label>First name</label><input name="firstName" required placeholder="Sophia" /></div><div class="form-field"><label>Last name</label><input name="lastName" required placeholder="Laurent" /></div><div class="form-field"><label>Email address</label><input name="email" type="email" required placeholder="you@example.com" /></div><div class="form-field"><label>Phone</label><input name="phone" type="tel" placeholder="+30" /></div><div class="form-field"><label>Check in</label><input name="checkIn" type="date" min="${dateOffset(0)}" value="${b.checkIn || dateOffset(30)}" required /></div><div class="form-field"><label>Check out</label><input name="checkOut" type="date" min="${dateOffset(1)}" value="${b.checkOut || dateOffset(34)}" required /></div><div class="form-field"><label>Adults</label><select name="adults"><option ${b.adults === 1 ? 'selected' : ''}>1</option><option ${b.adults === 2 ? 'selected' : ''}>2</option><option ${b.adults === 3 ? 'selected' : ''}>3</option><option ${b.adults === 4 ? 'selected' : ''}>4</option></select></div><div class="form-field"><label>Children</label><select name="children"><option ${b.children === 0 ? 'selected' : ''}>0</option><option ${b.children === 1 ? 'selected' : ''}>1</option><option ${b.children === 2 ? 'selected' : ''}>2</option></select></div><div class="form-field full"><label>Payment method</label><select name="paymentMethod"><option value="pay_at_property">Pay at property — reserve without payment</option><option value="demo">Demo payment — local test only</option></select></div><div class="form-field full"><label>Arrival note</label><textarea name="note" rows="4" style="resize:vertical;padding:10px;border:1px solid var(--line);background:var(--paper)" placeholder="Tell us anything that will make your stay more comfortable."></textarea></div></div><label style="display:flex;gap:8px;align-items:start;margin:20px 0;color:var(--muted);font-size:11px"><input type="checkbox" required /> I agree to the reservation terms and cancellation policy.</label><button class="btn btn-primary" type="submit">Confirm reservation <span class="arrow">→</span></button></form><aside class="booking-summary-card"><h2>Your stay</h2><div class="summary-room"><img src="${room.images[0]}" alt="${room.name}" /><div><h3>${room.name}</h3><p>${room.type} · ${room.area} m²</p></div></div><div class="price-line"><span>Check in</span><strong>${formatDate(b.checkIn || dateOffset(30))}</strong></div><div class="price-line"><span>Check out</span><strong>${formatDate(b.checkOut || dateOffset(34))}</strong></div><div class="price-line"><span>${nights} night${nights > 1 ? 's' : ''}</span><strong>€${subtotal.toLocaleString()}</strong></div><div class="price-line"><span>Taxes & service</span><strong>€${taxes.toLocaleString()}</strong></div><div class="price-line total"><span>Total</span><strong>€${total.toLocaleString()}</strong></div><div class="trust-note">✓ <span>Best available rate · Free cancellation up to 7 days before arrival.</span></div></aside></div></section>`;
  app.innerHTML = pageShell(content, 'rooms');
}

function renderConfirmation() {
  const b = state.booking;
  const ref = b.reference || 'Pending backend response';
  const content = `<section class="confirmation"><div class="confirmation-mark">✓</div><p class="eyebrow">Reservation received</p><h1>Your escape is taking shape.</h1><p>Thank you, ${escapeHtml(b.guestName || 'guest')}. Your reservation for ${escapeHtml(b.room.name)} has been recorded by the booking service.</p><div class="confirmation-ref">Confirmation ${escapeHtml(ref)}</div><p style="font-size:14px">${formatDate(b.checkIn)} — ${formatDate(b.checkOut)}<br />Status: ${escapeHtml(b.status || 'confirmed')} · Payment: ${escapeHtml(b.paymentStatus || 'unpaid')}<br />A confirmation note would be sent to ${escapeHtml(b.email || 'your email')} when email transport is configured.</p><div style="display:flex;justify-content:center;gap:12px;margin-top:30px;flex-wrap:wrap"><a class="btn btn-primary" href="#home" data-route="home">Return home</a><a class="btn btn-outline" href="#rooms" data-route="rooms">Explore more stays</a></div></section>`;
  app.innerHTML = pageShell(content, 'rooms');
}

function serviceRequestForm(kind) {
  if (kind === 'spa') return `<div class="booking-form-card service-request" style="max-width:850px;margin:40px auto 0"><p class="eyebrow">Reserve a ritual</p><h2>Request spa time</h2><form data-form="spa-request"><div class="form-grid"><div class="form-field"><label>Service</label><select name="serviceName"><option>Salt & Stone Ritual</option><option>Elysian Massage</option><option>Stillness Facial</option></select></div><div class="form-field"><label>Date</label><input name="appointmentDate" type="date" min="${dateOffset(1)}" required /></div><div class="form-field"><label>Time</label><input name="appointmentTime" type="time" required /></div><div class="form-field"><label>Your name</label><input name="guestName" required /></div><div class="form-field"><label>Email</label><input name="guestEmail" type="email" required /></div><div class="form-field full"><label>Notes</label><textarea name="notes" rows="3" placeholder="Any preferences for your treatment?"></textarea></div></div><button class="btn btn-primary" type="submit">Request appointment <span class="arrow">→</span></button></form></div>`;
  if (kind === 'dining') return `<div class="booking-form-card service-request" style="max-width:850px;margin:40px auto 0"><p class="eyebrow">Set the table</p><h2>Request a dining reservation</h2><form data-form="dining-request"><div class="form-grid"><div class="form-field"><label>Venue</label><select name="venueName"><option>The Horizon</option><option>The Courtyard</option></select></div><div class="form-field"><label>Date</label><input name="reservationDate" type="date" min="${dateOffset(1)}" required /></div><div class="form-field"><label>Time</label><input name="reservationTime" type="time" required /></div><div class="form-field"><label>Party size</label><input name="partySize" type="number" min="1" max="20" value="2" required /></div><div class="form-field"><label>Your name</label><input name="guestName" required /></div><div class="form-field"><label>Email</label><input name="guestEmail" type="email" required /></div></div><button class="btn btn-primary" type="submit">Request a table <span class="arrow">→</span></button></form></div>`;
  return `<div class="booking-form-card service-request" style="max-width:850px;margin:40px auto 0"><p class="eyebrow">Make it yours</p><h2>Request an experience</h2><form data-form="experience-request"><div class="form-grid"><div class="form-field"><label>Experience</label><select name="experienceSlug"><option value="yacht-charters">Yacht Charters</option><option value="cultural-journeys">Cultural Journeys</option><option value="bespoke-excursions">Bespoke Excursions</option></select></div><div class="form-field"><label>Date</label><input name="experienceDate" type="date" min="${dateOffset(1)}" required /></div><div class="form-field"><label>Guests</label><input name="guestCount" type="number" min="1" max="20" value="2" required /></div><div class="form-field"><label>Your name</label><input name="guestName" required /></div><div class="form-field"><label>Email</label><input name="guestEmail" type="email" required /></div></div><button class="btn btn-primary" type="submit">Ask the concierge <span class="arrow">→</span></button></form></div>`;
}

function renderEditorial(kind) {
  const data = {
    dining: { eyebrow: 'The culinary table', title: 'A Taste of the Extraordinary', text: 'Sunlit breakfasts, long lunches and evenings that linger. Our dining experiences are rooted in local ingredients and the generous rhythm of island life.', cards: [['The Horizon', 'Mediterranean dining above the sea.', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1000&q=84'], ['The Courtyard', 'A garden table for slow afternoons.', 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1000&q=84'], ['Private Dining', 'A considered menu, served just for you.', 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1000&q=84']] },
    spa: { eyebrow: 'The Elysian Spa', title: 'Renew, Restore, Reconnect', text: 'A quieter way to feel well. Our spa rituals pair skilled hands with mineral-rich ingredients, warm water and the restorative presence of the sea.', cards: [['Salt & Stone Ritual', 'A full-body reset inspired by the island.', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=84'], ['The Stillness Pool', 'A warm, quiet pause between treatments.', 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1000&q=84'], ['Private Sessions', 'Personalised treatments and time to exhale.', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1000&q=84']] },
    experiences: { eyebrow: 'Curated experiences', title: 'A Deeper Sense of Place', text: 'The island rewards curiosity. Meet it on the water, in its villages and around the table with experiences shaped around your own sense of wonder.', cards: experiences.map(item => [item.title, item.text, item.image]) },
    about: { eyebrow: 'Our story', title: 'A house shaped by the sea', text: 'Elysian Retreat is a fictional hospitality concept created around the idea that the most memorable luxury is time — time to notice, to wander, and to feel completely at ease.', cards: [['The Architecture', 'Natural stone, soft light and doors open to the horizon.', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=84'], ['The Landscape', 'An unhurried relationship with the coastline.', 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1000&q=84'], ['The Welcome', 'Genuine hospitality, quietly and thoughtfully offered.', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=84']] }
  }[kind];
  const content = `<section class="editorial-page"><div class="editorial-intro"><p class="eyebrow">${data.eyebrow}</p><h1>${data.title}</h1><p>${data.text}</p></div><div class="editorial-grid">${data.cards.map(card => `<article class="editorial-card"><img src="${card[2]}" alt="${card[0]}" loading="lazy" /><div class="editorial-card-body"><p class="eyebrow">Elysian Retreat</p><h2>${card[0]}</h2><p>${card[1]}</p><button class="section-link" data-action="toast" data-message="This experience is available to arrange with our concierge.">Discover more <span>→</span></button></div></article>`).join('')}</div></section>`;
  app.innerHTML = pageShell(content, kind);
  if (['spa', 'dining', 'experiences'].includes(kind)) app.insertAdjacentHTML('beforeend', serviceRequestForm(kind));
}

function renderContact() {
  const content = `<section class="editorial-page"><div class="editorial-intro"><p class="eyebrow">We would love to hear from you</p><h1>Begin a conversation.</h1><p>Whether you are planning a stay, a celebration or simply have a question, our team is here to help shape something considered.</p></div><div class="contact-grid"><aside class="contact-info"><h2>Find your way here</h2><p>Set along the southern coast of Santorini, Elysian Retreat looks toward the caldera and the open Aegean.</p><div class="contact-item"><small>Address</small><p>Mavrata Bay, Santorini<br />Greece</p></div><div class="contact-item"><small>Reservations</small><p>+30 22860 00000<br />stay@elysianretreat.example</p></div><div class="contact-item"><small>Concierge hours</small><p>Daily, 08:00 — 22:00 EET</p></div></aside><form class="booking-form-card" data-form="contact"><h2>Send a note</h2><div class="form-grid"><div class="form-field"><label>Name</label><input name="name" required placeholder="Your name" /></div><div class="form-field"><label>Email</label><input name="email" type="email" required placeholder="you@example.com" /></div><div class="form-field full"><label>How can we help?</label><select name="topic"><option>Plan a stay</option><option>Dining & celebrations</option><option>Spa & wellness</option><option>Something else</option></select></div><div class="form-field full"><label>Message</label><textarea name="message" rows="6" required style="resize:vertical;padding:10px;border:1px solid var(--line);background:var(--paper)" placeholder="Tell us a little more..."></textarea></div></div><button class="btn btn-primary" type="submit">Send enquiry <span class="arrow">→</span></button></form></div></section>`;
  app.innerHTML = pageShell(content, 'contact');
}

function renderLegal(kind) {
  const title = kind === 'faq' ? 'Frequently Asked Questions' : kind === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions';
  const body = kind === 'faq' ? '<h2>When is check-in?</h2><p>Check-in begins at 15:00 and check-out is by 11:00. Our concierge will happily arrange an earlier arrival or later departure where availability allows.</p><h2>What is the cancellation policy?</h2><p>Most flexible reservations may be cancelled without charge up to seven days before arrival. The specific terms are always shown before confirmation.</p><h2>Is this a live hotel?</h2><p>Elysian Retreat is a fictional hospitality concept and this website is a functional design demonstration.</p>' : '<h2>A considered demonstration</h2><p>This page is included to show the intended information architecture for a connected hospitality platform. Replace this placeholder with your approved legal copy before production launch.</p><h2>Information we collect</h2><p>In a production environment, forms would be handled by secure server-side services with clear retention, access and deletion policies.</p><h2>Contact</h2><p>For questions about this demo, contact the project owner through the workspace where it was created.</p>';
  const content = `<section class="editorial-page"><div class="editorial-intro"><p class="eyebrow">Elysian Retreat</p><h1>${title}</h1><p>Clear, calm information for a considered stay.</p></div><article class="booking-form-card" style="max-width:850px">${body}</article></section>`;
  app.innerHTML = pageShell(content, kind);
}

function renderAuth(kind = 'login') {
  const register = kind === 'register';
  const content = `<section class="booking-page"><div class="booking-form-card" style="max-width:560px;margin:0 auto"><p class="eyebrow">Elysian Retreat account</p><h1>${register ? 'Create your account' : 'Welcome back'}</h1><p style="color:var(--muted);font-family:var(--serif);font-size:18px">${register ? 'Keep your stays, guest details and saved rooms in one considered place.' : 'Sign in to manage reservations and your next escape.'}</p><form data-form="auth" data-mode="${register ? 'register' : 'login'}"><div class="form-grid">${register ? '<div class="form-field full"><label>Display name</label><input name="displayName" autocomplete="name" required placeholder="Sophia Laurent" /></div>' : ''}<div class="form-field full"><label>Email address</label><input name="email" type="email" autocomplete="email" required placeholder="you@example.com" /></div><div class="form-field full"><label>Password</label><input name="password" type="password" autocomplete="${register ? 'new-password' : 'current-password'}" minlength="12" required placeholder="12 characters minimum" /></div></div><button class="btn btn-primary" type="submit">${register ? 'Create account' : 'Sign in'} <span class="arrow">→</span></button></form><p style="margin-top:20px;color:var(--muted);font-size:12px">${register ? 'Already have an account? ' + '<a href="#login" data-route="login" style="color:var(--gold)">Sign in</a>' : 'New to Elysian Retreat? ' + '<a href="#register" data-route="register" style="color:var(--gold)">Create an account</a>'}</p></div></section>`;
  app.innerHTML = pageShell(content, 'about');
}

function renderAccount() {
  const content = `<section class="editorial-page"><div class="editorial-intro"><p class="eyebrow">Your private retreat</p><h1>Account</h1><p>Manage your profile, reservations and saved stays.</p></div><div class="booking-form-card" data-account-view><p>Loading your account…</p></div></section>`;
  app.innerHTML = pageShell(content, 'about');
}

function renderAdmin() {
  const content = `<section class="editorial-page"><div class="editorial-intro"><p class="eyebrow">Operations</p><h1>Admin Dashboard</h1><p>Live reservations, inventory and revenue from the connected PostgreSQL database.</p></div><div class="booking-form-card" data-admin-view><p>Loading dashboard…</p></div></section>`;
  app.innerHTML = pageShell(content, 'about');
}

function renderAdminContent() {
  const content = `<section class="editorial-page"><div class="editorial-intro"><p class="eyebrow">Content</p><h1>Content editor</h1><p>Draft, review and publish plain-text pages. Unpublished drafts never appear in the public API.</p></div><div class="booking-form-card" data-cms-view><p>Loading content…</p></div></section>`;
  app.innerHTML = pageShell(content, 'about');
  loadCmsEditor('[data-cms-view]');
}

function toast(message, success = true) {
  const node = document.createElement('div');
  node.className = `toast ${success ? 'success' : ''}`;
  node.textContent = message;
  document.querySelector('#toast-region').append(node);
  setTimeout(() => node.remove(), 4200);
}

async function apiJson(url, options = {}) {
  const response = await fetch(url, { headers: { 'content-type': 'application/json', ...(options.headers || {}) }, ...options });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.ok === false) throw new Error(payload.error?.message || `Request failed (${response.status})`);
  return payload.data;
}

async function hydrateCatalog() {
  try {
    const response = await fetch('/api/rooms', { headers: { accept: 'application/json' } });
    if (!response.ok) return;
    const payload = await response.json();
    if (!payload.ok || !Array.isArray(payload.data) || payload.data.length === 0) return;
    rooms = payload.data.map(room => ({ ...room, images: (room.images || []).map(image => typeof image === 'string' ? image : image.url), tag: room.slug === 'infinity-suite' ? 'Most Popular' : '' }));
    state.booking.room = rooms.find(room => room.slug === state.booking.room.slug) || rooms[0];
    render();
  } catch { /* Static preview keeps its curated fallback catalog when the API is offline. */ }
}

async function loadAccountView() {
  const target = document.querySelector('[data-account-view]');
  if (!target) return;
  try {
    const me = await apiJson('/api/auth/me');
    if (!me.user) { target.innerHTML = '<p>Please <a href="#login" data-route="login" style="color:var(--gold)">sign in</a> to view your account.</p>'; bindEvents(); return; }
    const bookings = await apiJson('/api/account/bookings');
    target.innerHTML = `<p class="eyebrow">${escapeHtml(me.user.email)}</p><h2>Welcome, ${escapeHtml(me.user.displayName)}</h2><div class="room-grid" style="margin-top:25px">${bookings.length ? bookings.map(booking => `<article class="room-card"><div class="card-body"><div class="card-kicker">${escapeHtml(booking.status)}</div><h3>${escapeHtml(booking.room_name)}</h3><p>${escapeHtml(booking.reference)} · ${formatDate(booking.check_in)} — ${formatDate(booking.check_out)}</p><div class="card-footer"><span class="price"><strong>€${(booking.total_cents / 100).toLocaleString()}</strong> ${escapeHtml(booking.payment_status)}</span>${booking.status === 'confirmed' ? `<button class="btn btn-outline" data-action="cancel-booking" data-reference="${escapeHtml(booking.reference)}">Cancel</button>` : ''}</div></div></article>`).join('') : '<p>No reservations yet. Your next escape starts here.</p>'}</div>`;
    target.insertAdjacentHTML('afterbegin', `<form class="booking-form-card" data-form="profile" style="margin-bottom:25px"><p class="eyebrow">Your details</p><div class="form-grid"><div class="form-field"><label>Display name</label><input name="displayName" value="${escapeHtml(me.user.displayName)}" required /></div><div class="form-field"><label>Email</label><input value="${escapeHtml(me.user.email)}" disabled /></div></div><button class="btn btn-outline" type="submit">Save profile</button></form>`);
    document.querySelector('[data-form="profile"]')?.addEventListener('submit', async event => { event.preventDefault(); const form = event.currentTarget; const displayName = new FormData(form).get('displayName'); try { const meNow = await apiJson('/api/auth/me'); await apiJson('/api/account/profile', { method: 'PATCH', headers: { 'x-csrf-token': meNow.csrfToken || '' }, body: JSON.stringify({ displayName }) }); toast('Profile updated.'); } catch (error) { toast(error.message, false); } });
    document.querySelectorAll('[data-action="cancel-booking"]').forEach(button => button.addEventListener('click', async () => { try { const meNow = await apiJson('/api/auth/me'); await apiJson(`/api/bookings/${button.dataset.reference}/cancel`, { method: 'POST', headers: { 'x-csrf-token': meNow.csrfToken || '' } }); toast('Reservation cancelled.'); loadAccountView(); } catch (error) { toast(error.message, false); } }));
  } catch (error) { target.innerHTML = `<p class="toast" style="display:block">${escapeHtml(error.message)}. Start the backend and try again.</p>`; }
}

async function loadAdminView() {
  const target = document.querySelector('[data-admin-view]');
  if (!target) return;
  try {
    const [dashboard, bookings] = await Promise.all([apiJson('/api/admin/dashboard'), apiJson('/api/admin/bookings')]);
    target.innerHTML = `<div class="admin-metrics"><div><small>Total bookings</small><strong>${dashboard.totalBookings}</strong></div><div><small>Available rooms</small><strong>${dashboard.availableRooms}</strong></div><div><small>Revenue</small><strong>€${(dashboard.revenueCents / 100).toLocaleString()}</strong></div><div><small>Pending</small><strong>${dashboard.pendingReservations}</strong></div></div><h2 style="margin-top:35px">Recent reservations</h2><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Reference</th><th>Stay</th><th>Guest</th><th>Status</th><th>Room unit</th><th>Action</th></tr></thead><tbody>${bookings.map(booking => `<tr><td>${escapeHtml(booking.reference)}</td><td>${formatDate(booking.check_in)} — ${formatDate(booking.check_out)}</td><td>${escapeHtml(booking.guest_snapshot?.name || 'Guest')}</td><td>${escapeHtml(booking.status)}</td><td>${escapeHtml(booking.room_unit || '—')}</td><td>${['confirmed','checked_in'].includes(booking.status) ? `<button class="btn btn-outline" data-admin-status="${booking.status === 'confirmed' ? 'checked_in' : 'checked_out'}" data-reference="${escapeHtml(booking.reference)}">${booking.status === 'confirmed' ? 'Check in' : 'Check out'}</button>` : '—'}</td></tr>`).join('')}</tbody></table></div>`;
    document.querySelectorAll('[data-admin-status]').forEach(button => button.addEventListener('click', async () => { try { const me = await apiJson('/api/auth/me'); await apiJson(`/api/admin/bookings/${button.dataset.reference}`, { method: 'PATCH', headers: { 'x-csrf-token': me.csrfToken || '' }, body: JSON.stringify({ status: button.dataset.adminStatus }) }); toast('Booking status updated.'); loadAdminView(); } catch (error) { toast(error.message, false); } }));
  } catch (error) { target.innerHTML = `<p class="toast" style="display:block">${escapeHtml(error.message)}. Sign in with an admin account and try again.</p>`; }
}

async function loadCmsEditor(selector = '[data-admin-view]') {
  const target = document.querySelector(selector);
  if (!target) return;
  try {
    const pages = await apiJson('/api/admin/content/pages');
    target.innerHTML = `<details open><summary>Create draft page</summary><form class="admin-inline-form" data-form="cms-create"><input name="slug" placeholder="slug" pattern="[a-z0-9-]+" required><input name="title" placeholder="Title" required><textarea name="body" placeholder="Plain-text content" required></textarea><button class="btn btn-outline">Save draft</button></form></details><div class="admin-management"><h2>Pages</h2>${pages.map(page => `<details><summary>${escapeHtml(page.title)} · ${escapeHtml(page.status)}</summary><form class="admin-inline-form" data-cms-edit="${escapeHtml(page.slug)}"><input name="title" value="${escapeHtml(page.title)}" required><textarea name="body" required>${escapeHtml(page.body)}</textarea><button class="btn btn-outline">Save changes</button><button class="btn btn-outline" type="button" data-cms-publish="${escapeHtml(page.slug)}" data-cms-next="${page.status === 'published' ? 'draft' : 'published'}">${page.status === 'published' ? 'Unpublish' : 'Publish'}</button></form></details>`).join('') || '<p>No pages yet.</p>'}</div>`;
    const csrf = async () => (await apiJson('/api/auth/me')).csrfToken || '';
    document.querySelector('[data-form="cms-create"]')?.addEventListener('submit', async event => { event.preventDefault(); try { const form = Object.fromEntries(new FormData(event.currentTarget)); await apiJson('/api/admin/content/pages', { method: 'POST', headers: { 'x-csrf-token': await csrf() }, body: JSON.stringify(form) }); toast('Draft created.'); loadCmsEditor(selector); } catch (error) { toast(error.message, false); } });
    document.querySelectorAll('[data-cms-edit]').forEach(form => form.addEventListener('submit', async event => { event.preventDefault(); try { const slug = form.dataset.cmsEdit; const data = Object.fromEntries(new FormData(form)); await apiJson(`/api/admin/content/pages/${encodeURIComponent(slug)}`, { method: 'PATCH', headers: { 'x-csrf-token': await csrf() }, body: JSON.stringify(data) }); toast('Draft saved.'); loadCmsEditor(selector); } catch (error) { toast(error.message, false); } }));
    document.querySelectorAll('[data-cms-publish]').forEach(button => button.addEventListener('click', async () => { try { const slug = button.dataset.cmsPublish; const next = button.dataset.cmsNext; await apiJson(`/api/admin/content/pages/${encodeURIComponent(slug)}/${next === 'published' ? 'publish' : 'unpublish'}`, { method: 'POST', headers: { 'x-csrf-token': await csrf() } }); toast(next === 'published' ? 'Page published.' : 'Page unpublished.'); loadCmsEditor(selector); } catch (error) { toast(error.message, false); } }));
  } catch (error) { target.innerHTML = `<p class="toast" style="display:block">${escapeHtml(error.message)}. Sign in with a content editor account.</p>`; }
}

function adminManagementPanels(data) {
  const roomTypes = data.roomTypes || []; const customers = data.customers || []; const reports = data.reports || {}; const requests = [...(data.spaRequests || []).map(item => ({ ...item, requestType: 'Spa', label: item.service_name })), ...(data.diningRequests || []).map(item => ({ ...item, requestType: 'Dining', label: item.venue_name })), ...(data.experienceRequests || []).map(item => ({ ...item, requestType: 'Experience', label: item.experience_name }))];
  return `<div class="admin-management"><details open><summary>Room types & pricing</summary><form class="admin-inline-form" data-form="admin-room-type"><input name="slug" placeholder="slug" required /><input name="name" placeholder="Room name" required /><select name="category"><option>Room</option><option>Suite</option><option>Villa</option></select><input name="basePriceCents" type="number" min="0" placeholder="Price cents" required /><input name="maxAdults" type="number" min="1" value="2" required /><input name="areaM2" type="number" min="1" value="60" required /><input name="bedType" value="King Bed" required /><input name="shortDescription" placeholder="Short description" required /><input name="description" placeholder="Description" required /><button class="btn btn-outline" type="submit">Add room type</button></form><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Units</th><th>Active</th></tr></thead><tbody>${roomTypes.map(room => `<tr><td>${escapeHtml(room.name)}</td><td>${escapeHtml(room.category)}</td><td>€${(room.base_price_cents / 100).toLocaleString()}</td><td>${room.unit_count}</td><td>${room.is_active ? 'Yes' : 'Archived'}</td></tr>`).join('')}</tbody></table></div></details><details><summary>Customer directory (${customers.length})</summary><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Guest</th><th>Email</th><th>Bookings</th><th>Lifetime value</th></tr></thead><tbody>${customers.map(customer => `<tr><td>${escapeHtml(customer.display_name)}</td><td>${escapeHtml(customer.email)}</td><td>${customer.booking_count}</td><td>€${(customer.lifetime_value_cents / 100).toLocaleString()}</td></tr>`).join('') || '<tr><td colspan="4">No customer records.</td></tr>'}</tbody></table></div></details><details><summary>Service requests (${requests.length})</summary><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Type</th><th>Request</th><th>Guest</th><th>Date</th><th>Status</th></tr></thead><tbody>${requests.map(item => `<tr><td>${item.requestType}</td><td>${escapeHtml(item.label)}</td><td>${escapeHtml(item.guest_name)}</td><td>${formatDate(item.appointment_date || item.reservation_date || item.experience_date)}</td><td>${escapeHtml(item.status)}</td></tr>`).join('') || '<tr><td colspan="5">No service requests.</td></tr>'}</tbody></table></div></details><details><summary>Reports & payment mix</summary><div class="admin-report-grid">${(reports.monthly || []).slice(-6).map(item => `<div><small>${escapeHtml(item.month)}</small><strong>${item.reservations}</strong><span>€${(item.revenue_cents / 100).toLocaleString()}</span></div>`).join('') || '<p>No report data yet.</p>'}</div></details></div>`;
}

async function loadAdminViewEnhanced() {
  const target = document.querySelector('[data-admin-view]');
  if (!target) return;
  try {
    const [dashboard, bookings, roomTypes, customers, reports, spaRequests, diningRequests, experienceRequests] = await Promise.all([apiJson('/api/admin/dashboard'), apiJson('/api/admin/bookings'), apiJson('/api/admin/room-types'), apiJson('/api/admin/customers').catch(() => []), apiJson('/api/admin/reports').catch(() => ({})), apiJson('/api/admin/spa-appointments').catch(() => []), apiJson('/api/admin/dining-reservations').catch(() => []), apiJson('/api/admin/experience-bookings').catch(() => [])]);
    const metric = (label, value) => `<div><small>${label}</small><strong>${value}</strong></div>`;
    const activity = (dashboard.recentActivity || []).map(item => `<li><strong>${escapeHtml(item.action || 'Activity')}</strong><span>${escapeHtml(item.entity_id || '')}</span></li>`).join('') || '<li>No recent activity.</li>';
    target.innerHTML = `<div class="admin-metrics">${metric('Total reservations', dashboard.totalBookings)}${metric('Today check-ins', dashboard.todayCheckIns)}${metric('Today check-outs', dashboard.todayCheckOuts)}${metric('Occupancy', `${dashboard.occupancyRate}%`)}${metric('Available rooms', dashboard.availableRooms)}${metric('Occupied rooms', dashboard.occupiedRooms)}${metric('Maintenance', dashboard.maintenanceRooms)}${metric('Outstanding', `€${(dashboard.outstandingPaymentsCents / 100).toLocaleString()}`)}${metric('Revenue', `€${(dashboard.revenueCents / 100).toLocaleString()}`)}${metric('Upcoming arrivals', dashboard.upcomingArrivals)}${metric('Upcoming departures', dashboard.upcomingDepartures)}${metric('Pending reservations', dashboard.pendingReservations)}</div><div class="admin-dashboard-grid"><section><h2 style="margin-top:35px">Recent reservations</h2><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Reference</th><th>Stay</th><th>Guest</th><th>Status</th><th>Payment</th><th>Room unit</th><th>Action</th></tr></thead><tbody>${bookings.map(booking => `<tr><td>${escapeHtml(booking.reference)}</td><td>${formatDate(booking.check_in)} — ${formatDate(booking.check_out)}</td><td>${escapeHtml(booking.guest_snapshot?.name || 'Guest')}</td><td>${escapeHtml(booking.status)}</td><td>${escapeHtml(booking.payment_status)}</td><td>${escapeHtml(booking.room_unit || '—')}</td><td>${['confirmed','checked_in'].includes(booking.status) ? `<button class="btn btn-outline" data-admin-status="${booking.status === 'confirmed' ? 'checked_in' : 'checked_out'}" data-reference="${escapeHtml(booking.reference)}">${booking.status === 'confirmed' ? 'Check in' : 'Check out'}</button>` : '—'}</td></tr>`).join('')}</tbody></table></div></section><aside><h2 style="margin-top:35px">Live room inventory</h2><div class="admin-inventory">${roomTypes.map(room => `<div><span>${escapeHtml(room.name)}</span><strong>${room.unit_count} units</strong></div>`).join('')}</div><h2 style="margin-top:28px">Recent activity</h2><ul class="admin-activity">${activity}</ul></aside></div>`;
    target.insertAdjacentHTML('beforeend', adminManagementPanels({ roomTypes, customers, reports, spaRequests, diningRequests, experienceRequests }));
    document.querySelectorAll('[data-admin-status]').forEach(button => button.addEventListener('click', async () => { try { const me = await apiJson('/api/auth/me'); await apiJson(`/api/admin/bookings/${button.dataset.reference}`, { method: 'PATCH', headers: { 'x-csrf-token': me.csrfToken || '' }, body: JSON.stringify({ status: button.dataset.adminStatus }) }); toast('Booking status updated.'); loadAdminViewEnhanced(); } catch (error) { toast(error.message, false); } }));
    document.querySelector('[data-form="admin-room-type"]')?.addEventListener('submit', async event => { event.preventDefault(); const form = Object.fromEntries(new FormData(event.currentTarget)); form.basePriceCents = Number(form.basePriceCents); form.maxAdults = Number(form.maxAdults); form.areaM2 = Number(form.areaM2); form.maxChildren = 0; try { const me = await apiJson('/api/auth/me'); await apiJson('/api/admin/room-types', { method: 'POST', headers: { 'x-csrf-token': me.csrfToken || '' }, body: JSON.stringify(form) }); toast('Room type created.'); loadAdminViewEnhanced(); } catch (error) { toast(error.message, false); } });
    loadCmsEditor('[data-admin-view]');
  } catch (error) { target.innerHTML = `<p class="toast" style="display:block">${escapeHtml(error.message)}. Sign in with an admin account and try again.</p>`; }
}

function render() {
  const current = route();
  if (current === 'home') renderHome();
  else if (current === 'rooms') renderRooms();
  else if (current.startsWith('room/')) renderDetail(current.split('/')[1]);
  else if (current === 'booking') renderBooking();
  else if (current === 'confirmation') renderConfirmation();
  else if (current === 'login' || current === 'register') renderAuth(current);
  else if (current === 'account') renderAccount();
  else if (current === 'admin') renderAdmin();
  else if (current === 'admin-content') renderAdminContent();
  else if (['dining', 'spa', 'experiences', 'about'].includes(current)) renderEditorial(current);
  else if (current === 'contact') renderContact();
  else if (['faq', 'privacy', 'terms'].includes(current)) renderLegal(current);
  else renderHome();
  bindEvents();
  document.documentElement.scrollTop = 0;
}

function bindEvents() {
  document.querySelectorAll('[data-route]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    document.querySelector('#site-header')?.classList.remove('menu-open');
    navigate(link.dataset.route);
  }));
  document.querySelectorAll('[data-action="book-now"]').forEach(button => button.addEventListener('click', () => navigate('booking')));
  document.querySelectorAll('[data-action="menu"]').forEach(button => button.addEventListener('click', () => {
    const headerNode = document.querySelector('#site-header');
    const opened = headerNode.classList.toggle('menu-open');
    button.setAttribute('aria-expanded', String(opened));
  }));
  document.querySelectorAll('[data-action="scroll"]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.target)?.scrollIntoView({ behavior: 'smooth' })));
  document.querySelectorAll('[data-action="room"]').forEach(button => button.addEventListener('click', () => navigate(`room/${button.dataset.slug}`)));
  document.querySelectorAll('[data-action="favorite"]').forEach(button => button.addEventListener('click', event => {
    event.stopPropagation();
    const slug = button.dataset.slug;
    state.saved.has(slug) ? state.saved.delete(slug) : state.saved.add(slug);
    toast(state.saved.has(slug) ? 'Saved to your wishlist.' : 'Removed from your wishlist.');
    render();
  }));
  document.querySelectorAll('[data-action="category"]').forEach(button => button.addEventListener('change', () => { state.roomFilter = button.dataset.category; renderRooms(); bindEvents(); }));
  document.querySelectorAll('[data-action="category"][type="button"], button[data-action="category"]').forEach(button => button.addEventListener('click', () => { state.roomFilter = button.dataset.category; renderRooms(); bindEvents(); }));
  const sort = document.querySelector('[data-action="sort"]');
  if (sort) sort.addEventListener('change', () => { state.sort = sort.value; renderRooms(); bindEvents(); });
  const amenityBlock = [...document.querySelectorAll('#filter-panel .filter-block')].pop();
  amenityBlock?.querySelectorAll('input[type="checkbox"]').forEach(input => { input.checked = input.parentElement.textContent.trim() === state.roomAmenityFilter || (!state.roomAmenityFilter && input.parentElement.textContent.trim() === 'All Bed Types'); input.addEventListener('change', () => { state.roomAmenityFilter = input.checked ? input.parentElement.textContent.trim() : ''; renderRooms(); bindEvents(); }); });
  const bedBlock = document.querySelectorAll('#filter-panel .filter-block')[3];
  bedBlock?.querySelectorAll('input[type="checkbox"]').forEach(input => { const label = input.parentElement.textContent.trim(); input.checked = label === 'All Bed Types' ? !state.bedFilter : label === state.bedFilter; input.addEventListener('change', () => { state.bedFilter = input.checked && label !== 'All Bed Types' ? label : ''; renderRooms(); bindEvents(); }); });
  const priceRange = document.querySelector('#filter-panel input[type="range"]');
  if (priceRange) { priceRange.value = state.maxPrice; priceRange.addEventListener('input', () => { state.maxPrice = Number(priceRange.value); renderRooms(); bindEvents(); }); }
  document.querySelector('[data-action="clear-filters"]')?.addEventListener('click', () => { state.roomFilter = 'All Rooms & Suites'; state.roomAmenityFilter = ''; state.bedFilter = ''; state.maxPrice = 5000; state.sort = 'Recommended'; renderRooms(); bindEvents(); });
  document.querySelector('[data-action="filter-toggle"]')?.addEventListener('click', () => document.querySelector('#filter-panel')?.classList.toggle('open'));
  document.querySelectorAll('[data-action="gallery"]').forEach(button => button.addEventListener('click', () => { state.galleryIndex = Number(button.dataset.index); render(); }));
  document.querySelectorAll('[data-action="lightbox"]').forEach(button => button.addEventListener('click', () => { const image = button.closest('.detail-content')?.querySelector('.gallery-main img'); if (!image) return; document.querySelector('.lightbox')?.remove(); document.body.insertAdjacentHTML('beforeend', `<div class="lightbox" role="dialog" aria-modal="true" aria-label="${escapeHtml(image.alt)}"><button class="lightbox-close" aria-label="Close gallery">×</button><img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" /></div>`); const lightbox = document.querySelector('.lightbox'); lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.remove()); lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.remove(); }); }));
  document.querySelectorAll('[data-action="toast"]').forEach(button => button.addEventListener('click', () => toast(button.dataset.message)));
  document.querySelectorAll('[data-form="search"], [data-form="detail-search"]').forEach(form => form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const room = data.get('room') && data.get('room') !== 'all' ? rooms.find(item => item.slug === data.get('room')) : state.booking.room;
    state.booking = { ...state.booking, room: room || rooms[1], checkIn: data.get('checkIn'), checkOut: data.get('checkOut'), adults: Number(data.get('adults') || 2) };
    if (data.get('room') && data.get('room') !== 'all') navigate(`room/${data.get('room')}`); else navigate('rooms');
  }));
  document.querySelector('[data-form="reservation"]')?.addEventListener('submit', async event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const checkIn = data.get('checkIn');
    const checkOut = data.get('checkOut');
    if (!checkIn || !checkOut || checkOut <= checkIn) { toast('Please choose a valid check-out date after check-in.', false); return; }
    const form = event.currentTarget;
    const guestName = `${data.get('firstName')} ${data.get('lastName')}`;
    try {
      state.booking.idempotencyKey ||= crypto.randomUUID();
      const result = await apiJson('/api/bookings', { method: 'POST', body: JSON.stringify({ roomSlug: state.booking.room.slug, checkIn, checkOut, adults: Number(data.get('adults')), children: Number(data.get('children')), paymentMethod: data.get('paymentMethod'), idempotencyKey: state.booking.idempotencyKey, guest: { name: guestName, email: data.get('email'), phone: data.get('phone') }, note: data.get('note') }) });
      state.booking = { ...state.booking, ...result, checkIn, checkOut, adults: Number(data.get('adults')), children: Number(data.get('children')), guestName, email: data.get('email'), reference: result.reference, status: result.status, paymentStatus: result.paymentStatus };
      navigate('confirmation');
    } catch (error) { toast(error.message + '. Check availability and try again.', false); }
  });
  document.querySelectorAll('[data-form="newsletter"]').forEach(form => form.addEventListener('submit', async event => { event.preventDefault(); const form = event.currentTarget; const email = new FormData(form).get('email'); try { await apiJson('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) }); toast('Thank you — your coastal notes are on their way.'); form.reset(); } catch (error) { toast(error.message + '. Start the backend if it is not running.', false); } }));
  document.querySelector('[data-form="contact"]')?.addEventListener('submit', async event => { event.preventDefault(); const form = event.currentTarget; const data = Object.fromEntries(new FormData(form)); try { await apiJson('/api/contact', { method: 'POST', body: JSON.stringify(data) }); toast('Thank you — our concierge will be in touch shortly.'); form.reset(); } catch (error) { toast(error.message + '. Start the backend if it is not running.', false); } });
  document.querySelector('[data-form="spa-request"]')?.addEventListener('submit', async event => { event.preventDefault(); const form = event.currentTarget; const data = Object.fromEntries(new FormData(form)); try { await apiJson('/api/spa/appointments', { method: 'POST', body: JSON.stringify(data) }); toast('Your spa request is with the wellness team.'); form.reset(); } catch (error) { toast(error.message + '. Start the backend if it is not running.', false); } });
  document.querySelector('[data-form="dining-request"]')?.addEventListener('submit', async event => { event.preventDefault(); const form = event.currentTarget; const data = Object.fromEntries(new FormData(form)); data.partySize = Number(data.partySize); try { await apiJson('/api/dining/reservations', { method: 'POST', body: JSON.stringify(data) }); toast('Your table request is with the dining team.'); form.reset(); } catch (error) { toast(error.message + '. Start the backend if it is not running.', false); } });
  document.querySelector('[data-form="experience-request"]')?.addEventListener('submit', async event => { event.preventDefault(); const form = event.currentTarget; const data = Object.fromEntries(new FormData(form)); data.guestCount = Number(data.guestCount); try { await apiJson('/api/experiences/bookings', { method: 'POST', body: JSON.stringify(data) }); toast('The concierge will shape this experience with you.'); form.reset(); } catch (error) { toast(error.message + '. Start the backend if it is not running.', false); } });
  document.querySelector('[data-form="auth"]')?.addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget; const data = Object.fromEntries(new FormData(form));
    try { const result = await apiJson(`/api/auth/${form.dataset.mode}`, { method: 'POST', body: JSON.stringify(data) }); toast(form.dataset.mode === 'login' ? 'Welcome back.' : 'Your account has been created.'); navigate(result.user.role === 'customer' ? 'account' : (result.user.role === 'content_editor' ? 'admin-content' : 'admin')); } catch (error) { toast(error.message + '. Start the backend if it is not running.', false); }
  });
  if (route() === 'account') loadAccountView();
  if (route() === 'admin') loadAdminViewEnhanced();
  const headerNode = document.querySelector('#site-header');
  if (headerNode && !headerNode.classList.contains('solid')) window.addEventListener('scroll', () => headerNode.classList.toggle('scrolled', window.scrollY > 24), { once: true });
}

window.addEventListener('hashchange', render);
render();
hydrateCatalog();
