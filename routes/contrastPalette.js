/**
 * CRUD Operation for ESM.
 */
import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../db/connection.js';
import { ROLES } from '../utils/roles.js';

const router = express.Router();
const COLLECTION = 'contrastPalettes';

function validatePalette(body) {
  const errors = [];
  if (!body.name || typeof body.name !== 'string') errors.push('name is required');
  if (!Array.isArray(body.colors) || body.colors.length === 0) {
    errors.push('colors must be a non-empty array');
  } else {
    body.colors.forEach((c, i) => {
      if (!ROLES.includes(c.role)) errors.push(`colors[${i}].role invalid`);
      if (!/^#?[0-9a-fA-F]{6}$/.test(String(c.hex || '').replace(/^#/, ''))) {
        errors.push(`colors[${i}].hex invalid`);
      }
    });
  }
  return errors;
}

function normalizeColors(colors) {
  return colors.map((c) => ({
    role: c.role,
    hex: `#${String(c.hex).replace(/^#/, '').toUpperCase()}`,
  }));
}

// CREATE
router.post('/', async (req, res) => {
  const errors = validatePalette(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const now = new Date();
  const doc = {
    ownerId: req.user.id,
    name: req.body.name.trim(),
    colors: normalizeColors(req.body.colors),
    createdAt: now,
    updatedAt: now,
  };
  const result = await getDB().collection(COLLECTION).insertOne(doc);
  res.status(201).json({ ...doc, _id: result.insertedId });
});

// READ all 
router.get('/', async (req, res) => {
  const palettes = await getDB()
    .collection(COLLECTION)
    .find({ ownerId: req.user.id })
    .sort({ updatedAt: -1 })
    .toArray();
  res.json(palettes);
});

// READ one
router.get('/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'bad id' });
  const palette = await getDB()
    .collection(COLLECTION)
    .findOne({ _id: new ObjectId(req.params.id), ownerId: req.user.id });
  if (!palette) return res.status(404).json({ error: 'not found' });
  res.json(palette);
});

// UPDATE
router.put('/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'bad id' });
  const errors = validatePalette(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const result = await getDB()
    .collection(COLLECTION)
    .findOneAndUpdate(
      { _id: new ObjectId(req.params.id), ownerId: req.user.id },
      {
        $set: {
          name: req.body.name.trim(),
          colors: normalizeColors(req.body.colors),
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );
  if (!result.value) return res.status(404).json({ error: 'not found' });
  res.json(result.value);
});

// DELETE
router.delete('/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'bad id' });
  const result = await getDB()
    .collection(COLLECTION)
    .deleteOne({ _id: new ObjectId(req.params.id), ownerId: req.user.id });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'not found' });
  res.status(204).end();
});

export default router;