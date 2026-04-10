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

async function ensureSessionTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "session" (
      "sid" varchar NOT NULL,
      "sess" json NOT NULL,
      "expire" timestamp NOT NULL,
      CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS "IDX_session_expire"
    ON "session" ("expire");
  `);
}


export async function setupAuth(app: Express) {

  await ensureSessionTable();   // keep this

  let store: session.Store;
  try {
    const client = await pool.connect();
    client.release();

    store = new PostgresqlStore({
      pool   // ✅ ONLY pool
    });

  } catch (err: any) {
    console.warn("Postgres session store not available, falling back to MemoryStore", err?.message || err);
    store = new session.MemoryStore();
  }

  const sessionSettings: session.SessionOptions = {
    store,
    secret: process.env.SESSION_SECRET || "super secret session key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    }
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);

    sessionSettings.cookie = {
      ...sessionSettings.cookie,
      secure: true,
      sameSite: "lax",
    };
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

export async function verifyPassword(password: string, hashedPassword: string) {
  const [storedHash, salt] = hashedPassword.split(".");
  const hashedPasswordBuf = Buffer.from(storedHash, "hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;

  try {
    return timingSafeEqual(hashedPasswordBuf, derivedKey);
  } catch {
    return false;
  }
}
