/**
 * Populates contrastPalettes with 1000+ synthetic records (ESM).
 */

import { connectDB, getDB } from './db/connection.js';
import { ROLES } from './utils/roles.js';

const SEED_OWNER = '000000000000000000000001';
const COUNT = 1100;

function randomHex() {
  return `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0').toUpperCase()}`;
}

function randomPalette(i) {
  const now = new Date(Date.now() - Math.floor(Math.random() * 60) * 86400000);
  return {
    ownerId: SEED_OWNER,
    name: `Palette ${i + 1}`,
    colors: ROLES.map((role) => ({ role, hex: randomHex() })),
    createdAt: now,
    updatedAt: now,
  };
}

async function run() {
  await connectDB();
  const db = getDB();

  await db.collection('contrastPalettes').deleteMany({ ownerId: SEED_OWNER });
  const palettes = Array.from({ length: COUNT }, (_, i) => randomPalette(i));
  const result = await db.collection('contrastPalettes').insertMany(palettes);
  console.log(`[seed] inserted ${result.insertedCount} palettes`);
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});