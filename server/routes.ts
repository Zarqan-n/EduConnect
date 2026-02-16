import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import passport from "passport";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertTutorProfileSchema, insertJobSchema, insertBookSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);

  // Auth Routes
  app.post(api.auth.register.path, async (req, res, next) => {
    try {
      const existing = await storage.getUserByUsername(req.body.username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists", field: "username" });
      }
      
      const password = await hashPassword(req.body.password);
      const user = await storage.createUser({ 
        ...req.body, 
        password 
      });
      
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post(api.auth.login.path, (req, res, next) => {
    // Basic Passport Local Login
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Login failed" });
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // Update User Profile Settings
  app.put("/api/users/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).id;
    
    try {
      const { name, email, location, bio } = req.body;
      const updatedUser = await storage.updateUser(userId, {
        name: name || undefined,
        email: email || undefined,
        location: location || undefined,
        bio: bio || undefined,
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update session user data
      req.user = updatedUser;
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Tutors
  app.get(api.tutors.list.path, async (req, res) => {
    const filters = {
      subject: req.query.subject as string,
      location: req.query.location as string,
      mode: req.query.mode as string
    };
    const tutors = await storage.getTutors(filters);
    res.json(tutors);
  });

  app.get(api.tutors.get.path, async (req, res) => {
    const user = await storage.getUser(Number(req.params.id));
    if (!user) return res.sendStatus(404);
    const profile = await storage.getTutorProfile(user.id);
    if (!profile) return res.sendStatus(404);
    res.json({ ...user, tutorProfile: profile });
  });

  app.post(api.tutors.createProfile.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const profileData = insertTutorProfileSchema.omit({ userId: true }).parse(req.body);
    const profile = await storage.createTutorProfile({
      ...profileData,
      userId: (req.user as any).id
    });
    res.status(201).json(profile);
  });

  // Jobs
  app.get(api.jobs.list.path, async (req, res) => {
    const jobs = await storage.getJobs(req.query.query as string);
    res.json(jobs);
  });

  app.post(api.jobs.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Ensure role is institution
    if ((req.user as any).role !== 'institution') return res.status(403).send("Only institutions can post jobs");

    const jobData = insertJobSchema.omit({ institutionId: true }).parse(req.body);
    const job = await storage.createJob({
      ...jobData,
      institutionId: (req.user as any).id
    });
    res.status(201).json(job);
  });

  app.post(api.jobs.apply.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if ((req.user as any).role !== 'teacher') return res.status(403).send("Only teachers can apply");

    const application = await storage.createApplication({
      jobId: Number(req.params.id),
      teacherId: (req.user as any).id,
      status: 'pending'
    });
    res.status(201).json(application);
  });

  // Books
  app.get(api.books.list.path, async (req, res) => {
    const books = await storage.getBooks({
      subject: req.query.subject as string,
      classLevel: req.query.classLevel as string
    });
    res.json(books);
  });

  // Users by role (e.g., students for teachers)
  app.get("/api/users", async (req, res) => {
    const role = req.query.role as string;
    const location = req.query.location as string | undefined;
    if (!role) return res.status(400).json({ message: "role query param required" });
    try {
      const users = await storage.getUsersByRole(role, location);
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post(api.books.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if ((req.user as any).role !== 'student' && (req.user as any).role !== 'teacher' && (req.user as any).role !== 'institution') return res.status(403).send("Only students, teachers, and institutions can sell books");

    const bookData = insertBookSchema.omit({ sellerId: true }).parse(req.body);
    const book = await storage.createBook({
      ...bookData,
      sellerId: (req.user as any).id
    });
    res.status(201).json(book);
  });

  return httpServer;
}
