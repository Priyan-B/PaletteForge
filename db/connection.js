import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);

let db;

export async function connectDB() {
  if (db) return db;
  await client.connect();
  db = client.db("paletteforge");
  console.log("Connected to MongoDB");
  return db;
}

export function getDB() {
  return db;
}
