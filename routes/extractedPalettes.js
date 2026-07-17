import express from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db/connection.js";

const router = express.Router();
const COLLECTION = "extractedPalettes";

router.get("/", async (req, res) => {
  const palettes = await getDB()
    .collection(COLLECTION)
    .find({ ownerId: new ObjectId(req.user.id) })
    .toArray();
  res.json(palettes);
});

router.get("/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ error: "Palette not found" });
  }
  const palette = await getDB()
    .collection(COLLECTION)
    .findOne({
      _id: new ObjectId(req.params.id),
      ownerId: new ObjectId(req.user.id),
    });
  if (!palette) {
    return res.status(404).json({ error: "Palette not found" });
  }
  return res.json(palette);
});

router.post("/", async (req, res) => {
  const { name, sourceImageName, colors } = req.body;
  const palette = {
    ownerId: new ObjectId(req.user.id),
    name,
    sourceImageName,
    colors: colors ?? [],
    extractedAt: new Date(),
  };
  const result = await getDB().collection(COLLECTION).insertOne(palette);
  res.status(201).json({ ...palette, _id: result.insertedId });
});

router.put("/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ error: "Palette not found" });
  }
  const { name, colors, sourceImageName } = req.body;
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (colors !== undefined) updates.colors = colors;
  if (sourceImageName !== undefined) updates.sourceImageName = sourceImageName;

  const updated = await getDB()
    .collection(COLLECTION)
    .findOneAndUpdate(
      { _id: new ObjectId(req.params.id), ownerId: new ObjectId(req.user.id) },
      { $set: updates },
      { returnDocument: "after" }
    );
  if (!updated) {
    return res.status(404).json({ error: "Palette not found" });
  }
  return res.json(updated);
});

router.delete("/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ error: "Palette not found" });
  }
  const result = await getDB()
    .collection(COLLECTION)
    .deleteOne({
      _id: new ObjectId(req.params.id),
      ownerId: new ObjectId(req.user.id),
    });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: "Palette not found" });
  }
  return res.status(204).end();
});

export default router;
