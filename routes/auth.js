import express from "express";
import passport from "passport";
import { getDB } from "../db/connection.js";
import { createUser } from "../auth.js";

const router = express.Router();

router.post("/register", async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "username and password required" });
  }
  try {
    const existing = await getDB().collection("users").findOne({ username });
    if (existing) return res.status(409).json({ error: "username taken" });

    const user = await createUser(username, password);
    req.login(user, (err) => {
      if (err) return next(err);
      res
        .status(201)
        .json({ id: user._id.toString(), username: user.username });
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res
        .status(401)
        .json({ error: info?.message || "Incorrect username or password" });
    }
    req.login(user, (err) => {
      if (err) return next(err);
      res.json({ id: user._id.toString(), username: user.username });
    });
  })(req, res, next);
});

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.status(204).end();
  });
});

router.get("/me", (req, res) => {
  if (req.isAuthenticated()) return res.json(req.user);
  res.status(401).json({ error: "not authenticated" });
});

export default router;
