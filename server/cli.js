import fs from 'node:fs/promises';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { query, closePool } from './lib/db.js';
import { hashPassword } from './lib/security.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function runSql(file) {
  const sql = await fs.readFile(path.join(rootDir, 'db', file), 'utf8');
  await query(sql);
}

async function createAdmin() {
  const rl = readline.createInterface({ input, output });
  try {
    const email = (process.env.ADMIN_EMAIL || await rl.question('Admin email: ')).trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || await rl.question('Admin password (12+ chars): ');
    const displayName = (process.env.ADMIN_NAME || await rl.question('Display name: ')).trim();
    if (!email || password.length < 12 || !displayName) throw new Error('Email, display name and a 12+ character password are required.');
    await query(`INSERT INTO users (email,password_hash,display_name,role,email_verified_at) VALUES ($1,$2,$3,'super_admin',now())
      ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash, display_name=EXCLUDED.display_name, role='super_admin', email_verified_at=now(), is_active=true`, [email, await hashPassword(password), displayName]);
    console.log(`Super admin created or updated for ${email}.`);
  } finally { rl.close(); }
}

const command = process.argv[2];
try {
  if (command === 'migrate') { await runSql('schema.sql'); console.log('Migrations applied.'); }
  else if (command === 'seed') { await runSql('seed.sql'); console.log('Seed data applied.'); }
  else if (command === 'admin:create') await createAdmin();
  else { console.error('Usage: npm run db:migrate | npm run db:seed | npm run admin:create'); process.exitCode = 1; }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await closePool();
}
