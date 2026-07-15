import express from "express";
import { getDB } from "../db/connection.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const wireframes = await getDB().collection("wireframes").find().toArray();
  res.json(wireframes);
});

export default router;
