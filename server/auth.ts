import { Express } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { User } from "@shared/schema";
import { pool } from "./db";

const scryptAsync = promisify(scrypt);
const PostgresqlStore = connectPg(session);

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    store: new PostgresqlStore({
      pool,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "super secret session key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    }
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1); // trust first proxy
    sessionSettings.cookie = {
      secure: true, 
      ...sessionSettings.cookie
    }
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: "Incorrect username." });
      }

      const [hashedPassword, salt] = user.password.split(".");
      const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
      const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;

      if (timingSafeEqual(hashedPasswordBuf, derivedKey)) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Incorrect password." });
      }
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, (user as User).id);
  });

  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${derivedKey.toString("hex")}.${salt}`;
}
