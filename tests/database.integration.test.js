import test from 'node:test';
import assert from 'node:assert/strict';
import { query, closePool } from '../server/lib/db.js';

const databaseAvailable = Boolean(process.env.TEST_DATABASE_URL || process.env.DATABASE_URL);

test('database integration smoke', { skip: !databaseAvailable }, async () => {
  const result = await query('SELECT 1 AS connected');
  assert.equal(result.rows[0].connected, 1);
  await closePool();
});
