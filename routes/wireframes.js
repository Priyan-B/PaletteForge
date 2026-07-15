import express from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db/connection.js";

const router = express.Router();
const COLLECTION = "wireframes";

router.get("/", async (req, res) => {
  const wireframes = await getDB()
    .collection(COLLECTION)
    .find({ ownerId: new ObjectId(req.user.id) })
    .toArray();
  res.json(wireframes);
});

router.get("/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ error: "Wireframe not found" });
  }
  const wireframe = await getDB()
    .collection(COLLECTION)
    .findOne({
      _id: new ObjectId(req.params.id),
      ownerId: new ObjectId(req.user.id),
    });
  if (!wireframe) {
    return res.status(404).json({ error: "Wireframe not found" });
  }
  return res.json(wireframe);
});

router.post("/", async (req, res) => {
  const { name, shapes } = req.body;
  const now = new Date();
  const wireframe = {
    ownerId: new ObjectId(req.user.id),
    name,
    shapes: shapes ?? [],
    createdAt: now,
    updatedAt: now,
  };
  const result = await getDB().collection(COLLECTION).insertOne(wireframe);
  res.status(201).json({ ...wireframe, _id: result.insertedId });
});

router.put("/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ error: "Wireframe not found" });
  }
  const { name, shapes } = req.body;
  const updated = await getDB()
    .collection(COLLECTION)
    .findOneAndUpdate(
      { _id: new ObjectId(req.params.id), ownerId: new ObjectId(req.user.id) },
      { $set: { name, shapes, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
  if (!updated) {
    return res.status(404).json({ error: "Wireframe not found" });
  }
  return res.json(updated);
});

router.delete("/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ error: "Wireframe not found" });
  }
  const result = await getDB()
    .collection(COLLECTION)
    .deleteOne({
      _id: new ObjectId(req.params.id),
      ownerId: new ObjectId(req.user.id),
    });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: "Wireframe not found" });
  }
  return res.status(204).end();
});

export default router;
