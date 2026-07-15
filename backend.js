import "dotenv/config";
import express from "express";
import wireframesRouter from "./routes/wireframes.js";
import { connectDB } from "./db/connection.js";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", express.static("frontend/dist"));

app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// TODO: replace with real Passport session middleware once auth is implemented.
// Routes should only ever read req.user.id, never a client-supplied owner id.
app.use("/api", (req, res, next) => {
  req.user = { id: "000000000000000000000001" };
  next();
});

app.use("/api/wireframes", wireframesRouter);

app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

await connectDB();

const server = app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

process.on("SIGINT", () => {
  server.close(() => {
    process.exit(0);
  });
});
