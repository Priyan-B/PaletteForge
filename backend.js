import "dotenv/config";
import express from "express";
import wireframesRouter from "./routes/wireframes.js";
import extractedPalettesRouter from "./routes/extractedPalettes.js";
import { connectDB } from "./db/connection.js";
import session from "express-session";
import passport from "passport";
import { configurePassport } from "./auth.js";
import authRouter from "./routes/auth.js";
import { requireAuth } from "./middleware/requireAuth.js";
import contrastPalettesRouter from "./routes/contrastPalettes.js";
import contrastReportsRouter from "./routes/contrastReports.js";

if (!process.env.SESSION_SECRET) {
  throw new Error(
    "SESSION_SECRET is not set. Add it to your .env file before starting the server."
  );
}

const PORT = process.env.PORT || 3000;
const app = express();
// used for spa catch all routing
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", express.static("frontend/dist"));

app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
configurePassport();

app.use("/api/auth", authRouter);

app.use("/api", requireAuth);

app.use("/api/contrast-palettes", contrastPalettesRouter);
app.use("/api/contrast-reports", contrastReportsRouter);

app.use("/api/wireframes", wireframesRouter);
app.use("/api/palettes/extracted", extractedPalettesRouter);

app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

await connectDB();

// should add a SPA catch-all route that will direct the user to a default page if a route path is requested that does not exisit
app.get("*splat", function (req, res) {
  res.sendFile("index.html", { root: join(__dirname, "./frontend/dist") });
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

process.on("SIGINT", () => {
  server.close(() => {
    process.exit(0);
  });
});
