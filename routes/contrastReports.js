/**
 * SECOND collection(ESM).
 * Generate a report from a palette, list saved reports, delete them.
 */
import express from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db/connection.js";
import { checkPair } from "../utils/wcag.js";
import { AUDIT_PAIRS } from "../utils/roles.js";

const router = express.Router();
const REPORTS = "contrastReports";
const PALETTES = "contrastPalettes";

function buildReport(colors) {
  const byRole = {};
  colors.forEach((c) => {
    byRole[c.role] = c.hex;
  });

  const pairs = [];
  AUDIT_PAIRS.forEach(([fgRole, bgRole]) => {
    if (byRole[fgRole] && byRole[bgRole]) {
      const r = checkPair(byRole[fgRole], byRole[bgRole]);
      pairs.push({
        fgRole,
        bgRole,
        fgHex: byRole[fgRole],
        bgHex: byRole[bgRole],
        ratio: r.ratio,
        AA: r.AA,
        AAA: r.AAA,
      });
    }
  });

  return {
    pairs,
    summary: {
      total: pairs.length,
      aaFails: pairs.filter((p) => !p.AA).length,
      aaaFails: pairs.filter((p) => !p.AAA).length,
    },
  };
}

// Generate + Save a report for one of the user's palettes
router.post("/", async (req, res) => {
  const { paletteId } = req.body;
  if (!ObjectId.isValid(paletteId))
    return res.status(400).json({ error: "bad paletteId" });

  const palette = await getDB()
    .collection(PALETTES)
    .findOne({ _id: new ObjectId(paletteId), ownerId: req.user.id });
  if (!palette) return res.status(404).json({ error: "palette not found" });

  const { pairs, summary } = buildReport(palette.colors);
  const doc = {
    ownerId: req.user.id,
    paletteId: palette._id,
    paletteName: palette.name,
    generatedAt: new Date(),
    pairs,
    summary,
  };
  const result = await getDB().collection(REPORTS).insertOne(doc);
  res.status(201).json({ ...doc, _id: result.insertedId });
});

// Read all saved reports
router.get("/", async (req, res) => {
  const reports = await getDB()
    .collection(REPORTS)
    .find({ ownerId: req.user.id })
    .sort({ generatedAt: -1 })
    .toArray();
  res.json(reports);
});

// Delete a saved report
router.delete("/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).json({ error: "bad id" });
  const result = await getDB()
    .collection(REPORTS)
    .deleteOne({ _id: new ObjectId(req.params.id), ownerId: req.user.id });
  if (result.deletedCount === 0)
    return res.status(404).json({ error: "not found" });
  res.status(204).end();
});

export default router;
