import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.BROWSER_QA_BASE_URL || 'http://127.0.0.1:4174';
const chromePath = process.env.BROWSER_QA_CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const root = process.cwd();
const screenshotDir = path.join(root, 'docs', 'acceptance', 'screenshots');
const resultPath = path.join(root, 'docs', 'acceptance', 'browser-qa-results.json');
const adminEmail = process.env.ADMIN_EMAIL || 'qa-admin@example.test';
const adminPassword = process.env.ADMIN_PASSWORD || 'LocalQAAdmin-2026!a1';

await fs.mkdir(screenshotDir, { recursive: true });

function futureDate(offset) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

const results = {
  status: 'PASS',
  baseUrl,
  browser: {},
  viewports: {},
  workflows: {},
  diagnostics: [],
  warnings: [],
  blocked: []
};

async function inspectPage(page, label, viewport) {
  const issues = await page.evaluate(() => {
    const visible = element => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return style.visibility !== 'hidden' && style.display !== 'none' && box.width > 0 && box.height > 0;
    };
    const critical = [...document.querySelectorAll('button, a.btn, input[type="submit"]')].filter(visible).slice(0, 20);
    const covered = critical.filter(element => {
      const box = element.getBoundingClientRect();
      const top = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
      return top && top !== element && !element.contains(top);
    }).map(element => element.textContent.trim().slice(0, 80));
    return {
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      covered,
      brokenImages: [...document.images].filter(image => image.complete && image.naturalWidth === 0).map(image => image.currentSrc || image.src).slice(0, 20)
    };
  });
  return { label, viewport, url: page.url(), ...issues };
}

async function visit(page, viewportName, route, screenshotName, waitFor) {
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const badResponses = [];
  const onConsole = message => { if (message.type() === 'error') consoleErrors.push(message.text()); };
  const onPageError = error => pageErrors.push(error.message);
  const onRequestFailed = request => failedRequests.push({ url: request.url(), failure: request.failure()?.errorText || 'failed' });
  const onResponse = response => { if (response.status() >= 400) badResponses.push({ url: response.url(), status: response.status() }); };
  page.on('console', onConsole); page.on('pageerror', onPageError); page.on('requestfailed', onRequestFailed); page.on('response', onResponse);
  try {
    await page.goto(`${baseUrl}/#${route}`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => Boolean(document.querySelector('#app')?.textContent?.trim()), null, { timeout: 15000 });
    if (waitFor) await page.waitForFunction(waitFor, null, { timeout: 15000 });
    await page.screenshot({ path: path.join(screenshotDir, `${screenshotName}-${viewportName}.png`), fullPage: true });
    const inspection = await inspectPage(page, route, viewportName);
    const localFailedRequests = failedRequests.filter(item => item.url.startsWith(baseUrl));
    const localBadResponses = badResponses.filter(item => item.url.startsWith(baseUrl));
    const consoleWarnings = consoleErrors.filter(message => message.includes('ERR_NETWORK_ACCESS_DENIED'));
    const appConsoleErrors = consoleErrors.filter(message => !consoleWarnings.includes(message));
    if (appConsoleErrors.length || pageErrors.length || localFailedRequests.length || localBadResponses.length || inspection.horizontalOverflow || inspection.covered.length) results.status = 'FAIL';
    results.diagnostics.push({ ...inspection, consoleErrors: appConsoleErrors, consoleWarnings, pageErrors, failedRequests: localFailedRequests, badResponses: localBadResponses });
    if (failedRequests.length || inspection.brokenImages.length) results.warnings.push({ page: route, externalFailedRequests: failedRequests.filter(item => !item.url.startsWith(baseUrl)), brokenImages: inspection.brokenImages });
    return inspection;
  } finally {
    page.off('console', onConsole); page.off('pageerror', onPageError); page.off('requestfailed', onRequestFailed); page.off('response', onResponse);
  }
}

async function expectToast(page, text) {
  try {
    await page.locator('#toast-region').getByText(text, { exact: false }).waitFor({ state: 'visible', timeout: 10000 });
  } catch (error) {
    const actual = await page.locator('#toast-region').innerText().catch(() => '');
    throw new Error(`${error.message}\nToast region: ${actual}`);
  }
}

const browser = await chromium.launch({ headless: true, executablePath: chromePath, args: ['--disable-gpu'] });
results.browser = { name: 'Google Chrome', version: await browser.version(), executablePath: chromePath, playwright: (await import('playwright/package.json', { with: { type: 'json' } })).default.version };

try {
  const viewports = { desktop: { width: 1440, height: 1000 }, tablet: { width: 768, height: 1000 }, mobile: { width: 390, height: 844 } };
  const routes = [
    ['home', 'home', "document.querySelectorAll('.hero').length === 1"],
    ['rooms', 'rooms', "document.querySelectorAll('.room-card').length >= 8"],
    ['room/infinity-suite', 'room-detail', "document.querySelector('h1')?.textContent.includes('Infinity Suite')"],
    ['booking', 'booking', "document.querySelector('[data-form=reservation]') !== null"],
    ['login', 'login', "document.querySelector('[data-form=auth]') !== null"],
    ['spa', 'spa', "document.querySelector('[data-form=spa-request]') !== null"],
    ['dining', 'dining', "document.querySelector('[data-form=dining-request]') !== null"],
    ['experiences', 'experiences', "document.querySelector('[data-form=experience-request]') !== null"],
    ['about', 'cms-about', "document.querySelector('h1')?.textContent.includes('house shaped')"]
  ];
  for (const [viewportName, viewport] of Object.entries(viewports)) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    results.viewports[viewportName] = { width: viewport.width, height: viewport.height, routes: [] };
    for (const [route, screenshotName, waitFor] of routes) results.viewports[viewportName].routes.push(await visit(page, viewportName, route, screenshotName, waitFor));
    await context.close();
  }

  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const email = `browser-qa-${Date.now()}@example.test`;
  const password = 'BrowserQA-2026!Password';
  await page.goto(`${baseUrl}/#register`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-form="auth"] input[name="displayName"]').fill('Browser QA Guest');
  await page.locator('[data-form="auth"] input[name="email"]').fill(email);
  await page.locator('[data-form="auth"] input[name="password"]').fill(password);
  await page.locator('[data-form="auth"]').getByRole('button', { name: /create account/i }).click();
  await page.waitForFunction(() => location.hash === '#account');
  await page.locator('[data-account-view]').waitFor({ state: 'visible' });
  await page.locator('[data-form="profile"] input[name="displayName"]').fill('Browser QA Guest Updated');
  await page.locator('[data-form="profile"] button[type="submit"]').click();
  await expectToast(page, 'Profile updated');
  const profile = await page.evaluate(async () => (await fetch('/api/account/profile')).json());
  if (profile.data.display_name !== 'Browser QA Guest Updated') throw new Error('Profile persistence check failed');
  await page.screenshot({ path: path.join(screenshotDir, 'account-profile-desktop.png'), fullPage: true });

  await page.goto(`${baseUrl}/#booking`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-form="reservation"]').waitFor({ state: 'visible' });
  await page.locator('[data-form="reservation"] input[name="firstName"]').fill('Browser');
  await page.locator('[data-form="reservation"] input[name="lastName"]').fill('Guest');
  await page.locator('[data-form="reservation"] input[name="email"]').fill(email);
  await page.locator('[data-form="reservation"] input[name="checkIn"]').fill(futureDate(40));
  await page.locator('[data-form="reservation"] input[name="checkOut"]').fill(futureDate(43));
  await page.locator('[data-form="reservation"] input[type="checkbox"]').check();
  await page.locator('[data-form="reservation"] button[type="submit"]').click();
  await page.waitForFunction(() => location.hash === '#confirmation', null, { timeout: 15000 });
  const confirmationText = await page.locator('.confirmation-ref').innerText();
  const reference = confirmationText.match(/ELY-\d{4}-[A-Z0-9]{6}/)?.[0];
  if (!reference) throw new Error('Booking confirmation reference missing');
  const accountBookings = await page.evaluate(async () => (await fetch('/api/account/bookings')).json());
  if (!accountBookings.data.some(item => item.reference === reference)) throw new Error(`Booking persistence check failed: reference=${reference}; accountBookings=${JSON.stringify(accountBookings.data)}`);
  await page.screenshot({ path: path.join(screenshotDir, 'account-confirmation-desktop.png'), fullPage: true });

  for (const [route, form, successText, values] of [
    ['spa', 'spa-request', 'spa request is with', { appointmentDate: futureDate(50), appointmentTime: '10:00', guestName: 'Browser Spa Guest', guestEmail: email, serviceName: 'Elysian Massage' }],
    ['dining', 'dining-request', 'table request is with', { reservationDate: futureDate(51), reservationTime: '19:30', partySize: '2', guestName: 'Browser Dining Guest', guestEmail: email, venueName: 'The Horizon' }],
    ['experiences', 'experience-request', 'concierge will shape', { experienceDate: futureDate(52), guestCount: '2', guestName: 'Browser Experience Guest', guestEmail: email, experienceSlug: 'yacht-charters' }]
  ]) {
    await page.goto(`${baseUrl}/#${route}`, { waitUntil: 'domcontentloaded' });
    for (const [name, value] of Object.entries(values)) { const control = page.locator(`[data-form="${form}"] [name="${name}"]`); if (await control.evaluate(element => element.tagName === 'SELECT')) await control.selectOption(value); else await control.fill(value); }
    await page.locator(`[data-form="${form}"] button[type="submit"]`).click();
    await expectToast(page, successText);
  }
  results.workflows.customer = { status: 'PASS', email, bookingReference: reference, profilePersisted: true, bookingPersisted: true, spaDiningExperienceSubmitted: true };
  await context.close();

  const adminContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const adminPage = await adminContext.newPage();
  await adminPage.goto(`${baseUrl}/#login`, { waitUntil: 'domcontentloaded' });
  await adminPage.locator('[data-form="auth"] input[name="email"]').fill(adminEmail);
  await adminPage.locator('[data-form="auth"] input[name="password"]').fill(adminPassword);
  await adminPage.locator('[data-form="auth"] button[type="submit"]').click();
  await adminPage.waitForFunction(() => location.hash === '#admin', null, { timeout: 15000 });
  await adminPage.getByText('Total reservations', { exact: true }).waitFor({ state: 'visible', timeout: 15000 });
  const adminDashboard = await adminPage.evaluate(async () => (await fetch('/api/admin/dashboard')).json());
  if (!adminDashboard.data || adminDashboard.data.totalRooms < 8 || typeof adminDashboard.data.occupancyRate !== 'number') throw new Error('Admin dashboard metrics missing');
  const adminRequests = await adminPage.evaluate(async () => Promise.all(['/api/admin/spa-appointments', '/api/admin/dining-reservations', '/api/admin/experience-bookings'].map(async url => (await fetch(url)).json())));
  const persistedRequestData = adminRequests.every(response => response.ok && response.data.some(item => item.guest_email === email));
  if (!persistedRequestData) throw new Error('Service request persistence check failed');
  await adminPage.screenshot({ path: path.join(screenshotDir, 'admin-dashboard-desktop.png'), fullPage: true });
  results.workflows.admin = { status: 'PASS', dashboardMetrics: true, roomCatalogMinimum: adminDashboard.data.totalRooms >= 8, serviceRequestsPersisted: true, cms: 'PARTIAL — content/inquiries surface exists; no dedicated CMS editor route.' };
  await adminContext.close();
} catch (error) {
  results.status = 'FAIL';
  results.blocked.push({ message: error.message, stack: error.stack });
} finally {
  await fs.writeFile(resultPath, JSON.stringify(results, null, 2), 'utf8');
  await browser.close();
}

console.log(JSON.stringify({ status: results.status, browser: results.browser, viewportCount: Object.keys(results.viewports).length, diagnostics: results.diagnostics.length, workflows: results.workflows, blocked: results.blocked }, null, 2));
if (results.status !== 'PASS') process.exitCode = 1;
