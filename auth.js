/**
 * Passport setup. Core logic of Passport auth implementation.
 */
import passport from "passport";
import passportLocal from "passport-local";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { getDB } from "./db/connection.js";

const { Strategy: LocalStrategy } = passportLocal;

const USERS = "users";

export function configurePassport() {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await getDB().collection(USERS).findOne({ username });
        if (!user)
          return done(null, false, {
            message: "Incorrect username or password",
          });
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok)
          return done(null, false, {
            message: "Incorrect username or password",
          });
        return done(null, user); // full doc; serializeUser reads _id off it
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => done(null, user._id.toString()));

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await getDB()
        .collection(USERS)
        .findOne({ _id: new ObjectId(id) });
      if (!user) return done(null, false);
      done(null, { id: user._id.toString(), username: user.username });
    } catch (err) {
      done(err);
    }
  });
}

export async function createUser(username, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await getDB()
    .collection(USERS)
    .insertOne({ username, passwordHash, createdAt: new Date() });
  return { _id: result.insertedId, username };
}
