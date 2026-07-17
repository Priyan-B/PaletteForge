import "dotenv/config";
import express from "express";
import wireframesRouter from "./routes/wireframes.js";
import { connectDB } from "./db/connection.js";
import session from "express-session";
import passport from "passport";
import { configurePassport } from "./auth.js";
import authRouter from "./routes/auth.js";
import { requireAuth } from "./middleware/requireAuth.js";
import contrastPalettesRouter from "./routes/contrastPalettes.js";
import contrastReportsRouter from "./routes/contrastReports.js";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", express.static("frontend/dist"));

app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
configurePassport();

app.use("/api/auth", authRouter);

app.use("/api", requireAuth);

app.use("/api/wireframes", wireframesRouter);
app.use("/api/contrast-palettes", contrastPalettesRouter);
app.use("/api/contrast-reports", contrastReportsRouter);

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
