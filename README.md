<a id="elysian-retreat"></a>

<div align="center">
  <p><sub>COASTAL RESORT &amp; SPA</sub></p>
  <h1>ELYSIAN RETREAT</h1>
  <p><em>Where Every Moment Becomes Extraordinary.</em></p>
  <p>A Mediterranean-inspired hospitality platform combining an editorial guest experience with transactional reservations, live inventory and resort operations.</p>
  <p>
    <a href="#website-preview">Website preview</a> Â·
    <a href="#technology-stack">Technology</a> Â·
    <a href="#getting-started">Run locally</a> Â·
    <a href="#quality-assurance">QA evidence</a>
  </p>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-ESM-25231F?style=flat-square&logo=node.js&logoColor=F8F5F0" alt="Node.js ESM" />
  <img src="https://img.shields.io/badge/PostgreSQL-18-6B8793?style=flat-square&logo=postgresql&logoColor=F8F5F0" alt="PostgreSQL 18" />
  <img src="https://img.shields.io/badge/Playwright-Chrome%20QA-B69A70?style=flat-square&logo=playwright&logoColor=25231F" alt="Playwright Chrome QA" />
  <img src="https://img.shields.io/badge/Browser%20QA-27%20checks%20pass-96764B?style=flat-square" alt="27 browser QA checks pass" />
</p>

<p align="center">
  <a href="assets/readme/elysian-homepage.jpg">
    <img src="assets/readme/elysian-homepage.jpg" alt="Elysian Retreat homepage captured in Google Chrome" width="100%" />
  </a>
</p>

> **More than a stay. A state of being.**
>
> Elysian Retreat is a portfolio-scale full-stack application, not a claim of a live hotel operation. The visual layer is intentionally editorial; the reservation layer is intentionally transactional.

## Contents

- [Overview](#overview)
- [Website Preview](#website-preview)
- [Guest Experience](#guest-experience)
- [Administration](#administration)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Booking Engine](#booking-engine)
- [Getting Started](#getting-started)
- [Quality Assurance](#quality-assurance)
- [Project Structure](#project-structure)
- [Project Status](#project-status)
- [Roadmap](#roadmap)

## Overview

Elysian Retreat brings the language of a refined coastal resort into one cohesive digital experience. Guests can move from a photography-led homepage to room discovery, availability, reservation and account management without leaving the same calm visual system. Behind that surface is a Node.js and PostgreSQL modular monolith with physical room inventory, transactional allocation, customer sessions and operational dashboards.

The current seeded catalog contains **eight active room types** with physical units, amenities, galleries and flexible rate plans. The application also exposes service workflows for spa appointments, dining requests and curated experiences.

### At a glance

| | Verified detail |
| --- | --- |
| Product shape | Editorial hospitality storefront + reservation platform + resort operations layer |
| Catalog | 8 active room types with physical room units |
| Booking model | Server-side availability, quotes, holds, allocation and lifecycle transitions |
| Customer layer | Registration, login, HttpOnly sessions, CSRF protection, profile and booking history |
| Operations layer | Dashboard metrics, inventory, reservations, reports, customer directory and service queues |
| Payment states | Pay-at-property and clearly labelled local demo payment; Stripe boundary requires credentials |
| Verification | Real Google Chrome controlled by Playwright at 1440px, 768px and 390px |

## Website Preview

The images below are captured from the running website with Playwright. The large hero above is an optimized crop of a real Chrome capture; the original QA screenshots remain preserved in [`docs/acceptance/screenshots/`](docs/acceptance/screenshots/). Photographic URLs are documented in [`assets/image-manifest.json`](assets/image-manifest.json); a production launch should replace remote assets with approved, self-hosted derivatives.

<table>
  <tr>
    <td width="50%" valign="top">
      <strong>Rooms &amp; Suites</strong><br />
      <sub>Room discovery, filters, rates and inventory-backed accommodation cards.</sub><br /><br />
      <a href="docs/acceptance/screenshots/rooms-desktop.png"><img src="docs/acceptance/screenshots/rooms-desktop.png" alt="Rooms and Suites browser screenshot" width="100%" /></a>
    </td>
    <td width="50%" valign="top">
      <strong>Infinity Suite</strong><br />
      <sub>Gallery-led room detail, highlights and availability context.</sub><br /><br />
      <a href="docs/acceptance/screenshots/room-detail-desktop.png"><img src="docs/acceptance/screenshots/room-detail-desktop.png" alt="Infinity Suite browser screenshot" width="100%" /></a>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <strong>Booking Experience</strong><br />
      <sub>Guest details, dates, payment state and confirmation reference.</sub><br /><br />
      <a href="docs/acceptance/screenshots/booking-desktop.png"><img src="docs/acceptance/screenshots/booking-desktop.png" alt="Booking page browser screenshot" width="100%" /></a>
    </td>
    <td width="50%" valign="top">
      <strong>Resort Administration</strong><br />
      <sub>Live operational metrics, reservations, room inventory and service requests.</sub><br /><br />
      <a href="docs/acceptance/screenshots/admin-dashboard-desktop.png"><img src="docs/acceptance/screenshots/admin-dashboard-desktop.png" alt="Admin dashboard browser screenshot" width="100%" /></a>
    </td>
  </tr>
</table>

### Mobile experience

The same interface was checked at 390px, including navigation, rooms, booking and service request forms.

<p align="center">
  <a href="docs/acceptance/screenshots/home-mobile.png"><img src="docs/acceptance/screenshots/home-mobile.png" alt="Homepage on a 390px viewport" width="31%" /></a>
  <a href="docs/acceptance/screenshots/booking-mobile.png"><img src="docs/acceptance/screenshots/booking-mobile.png" alt="Booking page on a 390px viewport" width="31%" /></a>
  <a href="docs/acceptance/screenshots/cms-about-mobile.png"><img src="docs/acceptance/screenshots/cms-about-mobile.png" alt="Public content page on a 390px viewport" width="31%" /></a>
</p>

More evidence is available for [Account profile](docs/acceptance/screenshots/account-profile-desktop.png), [booking confirmation](docs/acceptance/screenshots/account-confirmation-desktop.png), [Spa](docs/acceptance/screenshots/spa-desktop.png), [Dining](docs/acceptance/screenshots/dining-desktop.png), [Experiences](docs/acceptance/screenshots/experiences-desktop.png) and [public content](docs/acceptance/screenshots/cms-about-desktop.png).

## Guest Experience

### Discover

The public experience is organized as a set of quiet, editorial moments: a coastal homepage, curated rooms and suites, room detail pages, dining, spa and experience narratives, plus contact and information routes.

### Reserve

The reservation flow revalidates dates, occupancy, rates and physical availability on the server before creating a booking. Guests can choose pay-at-property or a clearly marked demo payment state, receive a confirmation reference and review their reservation from the account area.

### Return

Authenticated guests can update their profile, view booking history, cancel eligible reservations and keep their stay details in one place. Service requests remain connected to the same guest email and become visible to the operations layer.

## Administration

The admin surface is designed around operational clarity rather than a separate visual language:

- Dashboard metrics for reservations, arrivals, departures, occupancy, revenue, outstanding payments and room status.
- Reservation list with status transitions and payment state.
- Room type pricing, physical room units, maintenance blocks and seasonal rates.
- Customer directory and reporting views.
- Spa, dining and experience request queues with status endpoints.
- Audit log entries for important operational mutations.

The CMS editor is implemented as a role-aware browser route backed by PostgreSQL. Editors can create and edit plain-text drafts, publish or unpublish pages, and each mutation is audit logged. PostgreSQL/browser integration remains an environment verification gate for this phase.

## Technology Stack

| Layer | Technology | Responsibility |
| --- | --- | --- |
| Presentation | HTML, CSS and vanilla JavaScript | Editorial storefront, forms, routing and responsive interaction |
| Server | Node.js built-in HTTP server, ESM | Static delivery, REST API and modular application boundary |
| Persistence | PostgreSQL 18, `pg` | Catalog, inventory, sessions, bookings, payments, services and audit data |
| Authentication | Node `crypto` scrypt, HttpOnly cookies, CSRF tokens | Customer and staff sessions without returning passwords to clients |
| Payments | Pay-at-property, demo payment and Stripe webhook verification boundary | Local booking states plus optional external provider integration |
| Browser QA | Playwright 1.64.1 + Google Chrome 155.0.8059.41 | Real browser interaction, screenshots and diagnostics |
| Test runner | Node.js built-in test runner + API smoke script | Domain, database and endpoint verification |

No React, Next.js, Tailwind, Prisma or invented framework layer is present in this repository.

## Architecture

```mermaid
flowchart TD
    Browser[Real browser\nHTML / CSS / JavaScript]
    Static[dist/\nEditorial storefront]
    API[Node.js HTTP API\nModular monolith]
    Domain[Availability Â· booking Â· auth\nadmin Â· services Â· payments]
    DB[(PostgreSQL)]
    QA[Playwright + Chrome\nreal browser evidence]

    Browser --> Static
    Browser --> API
    API --> Domain
    Domain --> DB
    QA --> Browser
```

The application keeps the deployment shape intentionally direct: one Node.js process serves the preserved frontend and API routes, while PostgreSQL owns persistent state and concurrency guarantees.

## Booking Engine

### Built for reliable reservations

Availability is resolved against physical room units, not only room-type counts. A booking transaction calculates its quote, checks eligible units and writes the reservation inside a serializable transaction. PostgreSQL exclusion constraints then provide a second line of defence against overlapping stays for the same unit.

The engine includes:

- Date-range, occupancy and rate validation.
- Seasonal rate and flexible plan snapshots.
- Integer-cent pricing for subtotal, discount, tax, service fee and total.
- Expiring reservation holds and release endpoints.
- Idempotency keys for duplicate-submit protection.
- Booking lifecycle transitions from held through confirmed, checked-in, checked-out, cancelled and related terminal states.
- Audit events and payment records associated with the reservation.

The verified concurrency smoke test produced **1 successful reservation and 3 conflicts** against the same last available physical room. That is a correctness check for this local implementation, not a claim of production-scale load capacity.

## Getting Started

### Requirements

- Node.js 20 or newer.
- PostgreSQL, or Docker Desktop for the included PostgreSQL 18 Compose service.
- PowerShell on Windows.

### Install dependencies

```powershell
npm.cmd install
```

### Option A â€” Docker Compose PostgreSQL

```powershell
docker compose up -d postgres
$env:DATABASE_URL = 'postgresql://elysian:local-development-only@127.0.0.1:5432/elysian_retreat'
npm.cmd run db:migrate
npm.cmd run db:seed
npm.cmd run admin:create
npm.cmd run dev
```

`admin:create` prompts for the first staff email, password and display name. No default admin credential is stored in the repository.

### Option B â€” existing PostgreSQL

```powershell
$env:DATABASE_URL = 'postgresql://USER:PASSWORD@127.0.0.1:5432/elysian_retreat'
npm.cmd run db:migrate
npm.cmd run db:seed
npm.cmd run admin:create
npm.cmd run dev
```

Open:

- Website: <http://127.0.0.1:4173/>
- Admin route: <http://127.0.0.1:4173/#admin>

The application also reads the variables documented in [`.env.example`](.env.example): `DATABASE_URL`, `PORT`, `DB_POOL_MAX`, `DATABASE_SSL`, `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`. Keep real credentials outside source control.

## Quality Assurance

The latest evidence is recorded in [`docs/FINAL_ACCEPTANCE_REPORT.txt`](docs/FINAL_ACCEPTANCE_REPORT.txt) and [`docs/acceptance/browser-qa-results.json`](docs/acceptance/browser-qa-results.json).

### Verified results

| Check | Result |
| --- | --- |
| Unit and database tests | 6/6 pass |
| API smoke | Connected health, 8 rooms, booking lifecycle, admin access and concurrency pass |
| Browser | Google Chrome 155.0.8059.41 via Playwright 1.64.1 |
| Viewports | 1440px, 768px and 390px |
| Route/viewport diagnostics | 27 pass |
| Customer workflow | Registration, profile persistence, booking persistence and service requests pass |
| Admin workflow | Login, dashboard metrics, catalog and service queue persistence pass |
| Responsive overflow | 0 horizontal overflow findings |
| Broken images / covered controls | 0 / 0 |
| Local failed requests / application errors | 0 / 0 |

The QA environment blocked three external Google Fonts requests with `net::ERR_NETWORK_ACCESS_DENIED`; the site rendered with fallback fonts. This is documented as an environment warning, not hidden as an application pass.

Run the checks locally after starting the application and PostgreSQL:

```powershell
npm.cmd test

$env:API_BASE_URL = 'http://127.0.0.1:4173'
node tests/api-smoke.mjs

$env:BROWSER_QA_BASE_URL = 'http://127.0.0.1:4173'
$env:ADMIN_EMAIL = Read-Host 'Admin email'
$env:ADMIN_PASSWORD = Read-Host 'Admin password'
npm.cmd run test:browser
```

The browser script uses an installed Google Chrome executable. If Chrome is not available, install the Playwright browser bundle with `npx playwright install chromium` and set `$env:BROWSER_QA_CHROME` to the Chromium executable path for the environment.

## Project Structure

```text
server/
â”œâ”€ index.js                 # HTTP server, static delivery and API routes
â”œâ”€ cli.js                   # migrations, seed and admin bootstrap
â””â”€ lib/
   â”œâ”€ db.js                 # PostgreSQL pool and transactions
   â”œâ”€ domain.js              # booking rules, pricing and lifecycle
   â”œâ”€ payments.js            # provider status and Stripe signature boundary
   â””â”€ security.js            # password hashing, sessions and CSRF

db/
â”œâ”€ schema.sql                # relational model and booking constraints
â””â”€ seed.sql                  # catalog, inventory and service seed data

dist/
â”œâ”€ index.html                # application shell and metadata
â”œâ”€ app.js                    # client-side routes and interactions
â””â”€ styles.css                # responsive editorial visual system

tests/
â”œâ”€ *.test.js                 # domain and database tests
â”œâ”€ api-smoke.mjs             # endpoint and concurrency smoke test
â””â”€ browser-qa.mjs            # Playwright browser matrix and screenshots

assets/
â”œâ”€ image-manifest.json       # remote photographic asset manifest
â””â”€ readme/                   # optimized README crop from real Chrome

docs/
â”œâ”€ FINAL_ACCEPTANCE_REPORT.txt
â””â”€ acceptance/
   â”œâ”€ browser-qa-results.json
   â””â”€ screenshots/            # original browser evidence
```

## Project Status

### Implemented and verified

The guest storefront, eight-room catalog, availability and quote paths, transactional booking allocation, customer sessions, account persistence, service workflows, admin metrics and browser QA matrix are implemented and verified locally.

### Partial

- CMS editor: source/API/UI and authorization regression are implemented; disposable PostgreSQL and browser verification remain outstanding.

### Requires external configuration

- Stripe live checkout, refunds and provider credentials.
- Email delivery for password reset, confirmations and future verification flows.

### Not deployed

No production deployment or GitHub push is implied by this repository. The local acceptance environment is disposable and separate from production data.

## Roadmap

- Verify the CMS editor against disposable PostgreSQL and the browser role matrix.
- Connect email delivery and account verification flows.
- Complete Stripe production checkout and refund orchestration.
- Add deployment, monitoring and operational alerting.
- Extend reservation operations with richer housekeeping and front-desk workflows.

<div align="center">
  <br />
  <strong>ELYSIAN RETREAT</strong><br />
  <sub>COASTAL RESORT &amp; SPA</sub><br /><br />
  <em>Where Every Moment Becomes Extraordinary.</em><br /><br />
  <a href="#elysian-retreat">Back to top</a>
</div>

