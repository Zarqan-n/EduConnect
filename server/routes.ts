import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { setupAuth, hashPassword, verifyPassword } from "./auth";
import passport from "passport";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertTutorProfileSchema, insertInstitutionProfileSchema, insertJobSchema, insertBookSchema, insertJobFeedbackSchema } from "@shared/schema";
import { jobs } from "@shared/schema";
import { eq } from "drizzle-orm";
import { generateEduConnectAnswer } from "./ai";
import { avatarUpload, certificateUpload, bookCoverUpload } from "./multer-config";

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
        username: req.body.username,
        password,
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        location: req.body.location,
        bio: req.body.bio,
      });

      // Create role-specific profiles
      if (req.body.role === "teacher" && user.id) {
        try {
          await storage.createTutorProfile({
            userId: user.id,
            subjects: req.body.subjects ? req.body.subjects.split(",").map((s: string) => s.trim()) : [],
            classes: req.body.classes ? req.body.classes.split(",").map((c: string) => c.trim()) : [],
            experience: parseInt(req.body.experience) || 0,
            monthlyRate: parseInt(req.body.monthlyRate) || 0,
            mode: req.body.mode || "online",
            timings: req.body.timings || "",
            qualifications: req.body.qualifications || "",
            languages: req.body.languages ? req.body.languages.split(",").map((l: string) => l.trim()) : [],
            rating: 0,
          });
        } catch (err) {
          console.error("Error creating tutor profile:", err);
        }
      } else if (req.body.role === "institution" && user.id) {
        try {
          await storage.createInstitutionProfile({
            userId: user.id,
            institutionName: req.body.name,
            website: req.body.website || "",
            type: req.body.type || "",
            directorName: req.body.directorName || "",
            contactPerson: req.body.contactPerson || "",
            staffCount: parseInt(req.body.staffCount) || 0,
            foundedYear: parseInt(req.body.foundedYear) || new Date().getFullYear(),
            specializations: req.body.specializations ? req.body.specializations.split(",").map((s: string) => s.trim()) : [],
            description: req.body.description || "",
            accreditation: req.body.accreditation || "",
            rating: 0,
          });
        } catch (err) {
          console.error("Error creating institution profile:", err);
        }
      }

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
    const user = req.user as any;

    try {
      const { name, email, location, bio, mode, timings, experience, qualifications, expertise, languages } = req.body;
      
      // Update base user info
      const updatedUser = await storage.updateUser(userId, {
        name: name || undefined,
        email: email || undefined,
        location: location || undefined,
        bio: bio || undefined,
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update tutor profile fields if provided (for all roles that have tutor profiles)
      if (user.role === "teacher" && (mode || timings || experience || qualifications || expertise || languages)) {
        try {
          const tutorProfile = await storage.getTutorProfile(userId);
          if (tutorProfile) {
            await storage.updateTutorProfile(userId, {
              mode: mode || undefined,
              timings: timings || undefined,
              experience: experience ? parseInt(experience) : undefined,
              qualifications: qualifications || undefined,
              subjects: expertise ? (Array.isArray(expertise) ? expertise : expertise.split(',').map((s: string) => s.trim())) : undefined,
              languages: languages ? (Array.isArray(languages) ? languages : languages.split(',').map((l: string) => l.trim())) : undefined,
            });
          }
        } catch (err) {
          console.error("Error updating tutor profile:", err);
          // Don't fail the whole request if tutor profile update fails
        }
      }

      // Update session user data
      req.user = updatedUser;
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Get Tutor Profile Details
  app.get("/api/tutor-profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).id;
    const user = req.user as any;

    try {
      if (user.role !== "teacher") {
        return res.status(403).json({ message: "Only teachers have tutor profiles" });
      }

      const tutorProfile = await storage.getTutorProfile(userId);
      if (!tutorProfile) {
        return res.status(404).json({ message: "Tutor profile not found" });
      }

      res.json(tutorProfile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tutor profile" });
    }
  });

  // Upload avatar
  app.post("/api/upload/avatar", avatarUpload.single("avatar"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }

      const userId = (req.user as any).id;
      const avatarUrl = (req.file as any).path; // Cloudinary returns the full URL in 'path'

      // Update user avatar in database
      const updatedUser = await storage.updateUser(userId, { avatar: avatarUrl });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update session user data
      req.user = updatedUser;
      
      res.json({
        message: "Avatar uploaded successfully",
        avatar: avatarUrl,
        user: updatedUser,
      });
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      res.status(500).json({ message: error?.message || "Failed to upload avatar" });
    }
  });

  // Upload certificate (for teachers)
  app.post("/api/upload/certificate", certificateUpload.single("certificate"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const user = req.user as any;
    if (user.role !== "teacher") {
      return res.status(403).json({ message: "Only teachers can upload certificates" });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }

      const userId = user.id;
      const certificateUrl = (req.file as any).path; // Cloudinary returns the full URL in 'path'

      // Update tutor profile certificate
      const tutorProfile = await storage.getTutorProfile(userId);
      if (!tutorProfile) {
        return res.status(404).json({ message: "Tutor profile not found" });
      }

      const updatedProfile = await storage.updateTutorProfile(userId, { certificate: certificateUrl });

      res.json({
        message: "Certificate uploaded successfully",
        certificate: certificateUrl,
        profile: updatedProfile,
      });
    } catch (error: any) {
      console.error("Certificate upload error:", error);
      res.status(500).json({ message: error?.message || "Failed to upload certificate" });
    }
  });

  // Upload book cover
  app.post("/api/upload/book-cover", bookCoverUpload.single("bookCover"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }

      const bookCoverUrl = (req.file as any).path; // Cloudinary returns the full URL in 'path'

      res.json({
        message: "Book cover uploaded successfully",
        imageUrl: bookCoverUrl,
      });
    } catch (error: any) {
      console.error("Book cover upload error:", error);
      res.status(500).json({ message: error?.message || "Failed to upload book cover" });
    }
  });

  // Tutors
  app.get(api.tutors.list.path, async (req, res) => {
    const filters = {
      subject: req.query.subject as string,
      location: req.query.location as string,
      mode: req.query.mode as string,
      maxBudget: req.query.maxBudget ? Number(req.query.maxBudget) : undefined,
      time: req.query.time as string | undefined
    };
    const tutors = await storage.getTutors(filters);
    res.json(tutors);
  });

  app.get(api.tutors.get.path, async (req, res) => {
    const user = await storage.getUser(Number(req.params.id));
    if (!user) return res.sendStatus(404);
    const profile = await storage.getTutorProfile(user.id);
    if (!profile) return res.sendStatus(404);
    const reviews = (await storage.getReviewsForTutor(user.id)).slice(0, 5);
    // Enrich reviews with student names
    const enrichedReviews = await Promise.all(
      reviews.map(async (r) => {
        const student = await storage.getUser(r.studentId);
        return { ...r, studentName: student?.name || "Anonymous" };
      })
    );
    res.json({ ...user, tutorProfile: profile, reviews: enrichedReviews });
  });

  // Tutor review routes are registered later in the file.

  app.post(api.tutors.createProfile.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const profileData = insertTutorProfileSchema.omit({ userId: true }).parse(req.body);
      try {
        const profile = await storage.createTutorProfile({
          ...profileData,
          userId: (req.user as any).id
        });
        return res.status(201).json(profile);
      } catch (dbErr: any) {
        // Handle missing column for timings gracefully by retrying without it
        const msg = (dbErr?.message || "").toLowerCase();
        const isMissingTimings = msg.includes('column "timings"') || msg.includes('timings') || dbErr?.code === '42703';
        if (isMissingTimings) {
          console.warn('DB missing timings column, retrying without timings field');
          // Omit timings and retry
          const dataWithoutTimings = { ...profileData };
          delete (dataWithoutTimings as any).timings;
          const profile = await storage.createTutorProfile({
            ...dataWithoutTimings,
            userId: (req.user as any).id
          });
          console.log('Profile created successfully without timings');
          return res.status(201).json(profile);
        }
        throw dbErr;
      }
    } catch (err: any) {
      console.error("Failed to create tutor profile:", err);
      if (err?.name === 'ZodError') {
        return res.status(400).json({ message: 'Invalid profile data', details: err.errors });
      }
      const message = err?.message || 'Failed to create tutor profile';
      return res.status(500).json({ message });
    }
  });

  // Update existing tutor profile
  app.put(api.tutors.updateProfile.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const userId = (req.user as any).id;
      const existing = await storage.getTutorProfile(userId);
      if (!existing) {
        return res.status(404).json({ message: "No tutor profile found. Create one first." });
      }
      const updates = insertTutorProfileSchema.omit({ userId: true }).partial().parse(req.body);
      try {
        const updated = await storage.updateTutorProfile(userId, updates);
        if (!updated) {
          return res.status(500).json({ message: "Failed to update profile" });
        }
        return res.status(200).json(updated);
      } catch (dbErr: any) {
        const msg = (dbErr?.message || "").toLowerCase();
        const isMissingTimings = msg.includes('column "timings"') || msg.includes('timings') || dbErr?.code === '42703';
        if (isMissingTimings) {
          console.warn('DB missing timings column, retrying update without timings field');
          const updatesWithoutTimings = { ...updates };
          delete (updatesWithoutTimings as any).timings;
          const updated = await storage.updateTutorProfile(userId, updatesWithoutTimings);
          if (!updated) {
            return res.status(500).json({ message: "Failed to update profile" });
          }
          return res.status(200).json(updated);
        }
        throw dbErr;
      }
    } catch (err: any) {
      console.error("Failed to update tutor profile:", err);
      if (err?.name === 'ZodError') {
        return res.status(400).json({ message: 'Invalid profile data', details: err.errors });
      }
      return res.status(500).json({ message: err?.message || 'Failed to update tutor profile' });
    }
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

  app.get(api.jobs.get.path, async (req, res) => {
    const job = await storage.getJob(Number(req.params.id));
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  });

  app.get(api.jobs.feedback.list.path, async (req, res) => {
    const feedback = await storage.getFeedbackForJob(Number(req.params.id));
    res.json(feedback.slice(0, 5));
  });

  app.post(api.jobs.feedback.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const jobId = Number(req.params.id);
    const userId = (req.user as any).id;

    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    try {
      // Check if user already rated this job
      const existingFeedback = await storage.getJobFeedbackByUserAndJob(jobId, userId);
      
      let feedback;
      if (existingFeedback) {
        // Update existing rating
        feedback = await storage.updateJobFeedback(existingFeedback.id, {
          rating: Number(rating),
          comment: comment || "",
        });
      } else {
        // Create new feedback
        feedback = await storage.createJobFeedback({
          jobId,
          userId,
          rating: Number(rating),
          comment: comment || "",
        });
      }

      res.status(201).json(feedback);
    } catch (err: any) {
      console.error("Failed to create job feedback:", err);
      res.status(500).json({ message: err?.message || "Failed to submit feedback" });
    }
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

  // AI Chatbot (Gemini) - keeps API key on server
  const chatSchema = z
    .object({
      messages: z
        .array(
          z.object({
            role: z.enum(["user", "assistant"]),
            text: z.string().min(1).max(2000),
          }),
        )
        .min(1)
        .max(20),
    })
    .strict();

  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = chatSchema.parse(req.body);

      const u = req.isAuthenticated() ? (req.user as any) : undefined;
      const userContext = u
        ? `name=${u.name ?? ""}, role=${u.role ?? ""}, location=${u.location ?? ""}`
        : undefined;

      const text = await generateEduConnectAnswer({ messages, userContext });
      res.json({ text });
    } catch (err: any) {
      const message = err?.message || "Failed to generate response";
      console.error("Chat API Error:", {
        message,
        errorName: err?.name,
        errorCode: err?.code,
        fullError: err
      });
      
      // previous implementation only checked for the Gemini key; now generateEduConnectAnswer
      // throws a more generic error when no provider is configured.
      if (typeof message === "string" && message.includes("Missing AI API key")) {
        return res.status(503).json({ message: "AI is not configured on the server yet." });
      }
      if (err?.name === "ZodError") {
        return res.status(400).json({ message: "Invalid request body" });
      }
      if (typeof message === "string" && message.includes("API key")) {
        return res.status(503).json({ message: "AI service unavailable - invalid API key configuration." });
      }
      if (typeof message === "string" && (message.includes("fetch") || message.includes("network"))) {
        return res.status(503).json({ message: "AI service temporarily unavailable. Please try again later." });
      }
      
      return res.status(500).json({ message: "AI request failed", details: message });
    }
  });

  // ── User Profile Routes ──────────────────────────────────────────────
  
  // Change Password
  app.post("/api/users/change-password", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).id;

    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new password are required" });
      }

      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const isValid = await verifyPassword(currentPassword, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(userId, { password: hashedPassword });
      
      res.json({ message: "Password changed successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error?.message || "Failed to change password" });
    }
  });

  // Get User's Posted Content (Books, Jobs, Comments)
  app.get("/api/users/my-content", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).id;
    const userRole = (req.user as any).role;

    try {
      const content: any = {};

      // Get user's books
      if (userRole === "student" || userRole === "teacher" || userRole === "institution") {
        content.books = await storage.getUserBooks(userId);
      }

      // Get user's jobs (if institution)
      if (userRole === "institution") {
        content.jobs = await storage.getUserJobs(userId);
      }

      // Get user's applications (if teacher)
      if (userRole === "teacher") {
        content.applications = await storage.getUserApplications(userId);
      }

      // Get user's feedback/comments on jobs
      content.jobFeedback = await storage.getUserJobFeedback(userId);

      // Get user's reviews on tutors (if student)
      if (userRole === "student") {
        content.tutorReviews = await storage.getUserTutorReviews(userId);
      }

      res.json(content);
    } catch (error: any) {
      res.status(500).json({ message: error?.message || "Failed to fetch content" });
    }
  });

  // Delete Book (by seller/owner)
  app.delete("/api/books/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).id;
    const bookId = Number(req.params.id);

    try {
      const book = await storage.getBook(bookId);
      if (!book) return res.status(404).json({ message: "Book not found" });
      
      if (book.sellerId !== userId) {
        return res.status(403).json({ message: "You can only delete your own books" });
      }

      await storage.deleteBook(bookId);
      res.json({ message: "Book deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error?.message || "Failed to delete book" });
    }
  });

  // Update Job Status (by institution/owner)
  app.patch("/api/jobs/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).id;
    const jobId = Number(req.params.id);

    try {
      const job = await storage.getJob(jobId);
      if (!job) return res.status(404).json({ message: "Job not found" });
      
      if ((job as any).institutionId !== userId) {
        return res.status(403).json({ message: "You can only update your own jobs" });
      }

      const { status } = req.body;
      if (!status || !['open', 'closed'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'open' or 'closed'" });
      }

      await db.update(jobs).set({ status }).where(eq(jobs.id, jobId));
      const updatedJob = await db.query.jobs.findFirst({
        where: eq(jobs.id, jobId)
      });
      res.json(updatedJob);
    } catch (error: any) {
      res.status(500).json({ message: error?.message || "Failed to update job" });
    }
  });

  // Delete Job (by institution/owner)
  app.delete("/api/jobs/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).id;
    const jobId = Number(req.params.id);

    try {
      const job = await storage.getJob(jobId);
      if (!job) return res.status(404).json({ message: "Job not found" });
      
      if ((job as any).institutionId !== userId) {
        return res.status(403).json({ message: "You can only delete your own jobs" });
      }

      await storage.deleteJob(jobId);
      res.json({ message: "Job deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error?.message || "Failed to delete job" });
    }
  });

  // Delete Job Feedback/Comment (by commenter/owner)
  app.delete("/api/jobs/feedback/:feedbackId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).id;
    const feedbackId = Number(req.params.feedbackId);

    try {
      const feedback = await storage.getJobFeedback(feedbackId);
      if (!feedback) return res.status(404).json({ message: "Feedback not found" });
      
      if (feedback.userId !== userId) {
        return res.status(403).json({ message: "You can only delete your own feedback" });
      }

      await storage.deleteJobFeedback(feedbackId);
      res.json({ message: "Feedback deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error?.message || "Failed to delete feedback" });
    }
  });

  // Delete Tutor Review/Comment (by reviewer/owner)
  app.delete("/api/tutors/reviews/:reviewId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).id;
    const reviewId = Number(req.params.reviewId);

    try {
      const review = await storage.getReview(reviewId);
      if (!review) return res.status(404).json({ message: "Review not found" });
      
      if (review.studentId !== userId) {
        return res.status(403).json({ message: "You can only delete your own reviews" });
      }

      await storage.deleteReview(reviewId);
      res.json({ message: "Review deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error?.message || "Failed to delete review" });
    }
  });

  // Delete Account
  app.delete("/api/users/account", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).id;

    try {
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ message: "Password is required to delete account" });
      }

      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Incorrect password" });
      }

      // Delete all user content first
      await storage.deleteUserContent(userId);
      
      // Delete user account
      await storage.deleteUser(userId);

      // Logout user
      req.logout((err) => {
        if (err) return res.status(500).json({ message: "Account deleted but logout failed" });
        res.json({ message: "Account deleted successfully" });
      });
    } catch (error: any) {
      res.status(500).json({ message: error?.message || "Failed to delete account" });
    }
  });

  // ── Admin Routes ──────────────────────────────────────────────
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if ((req.user as any).role !== "admin") return res.status(403).json({ message: "Admin access required" });
    next();
  };

  app.get("/api/admin/stats", requireAdmin, async (_req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (_req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if ((req.user as any).id === id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      await storage.deleteUser(id);
      res.sendStatus(200);
    } catch (err) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.get("/api/admin/jobs", requireAdmin, async (_req, res) => {
    try {
      const allJobs = await storage.getAllJobs();
      res.json(allJobs);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.delete("/api/admin/jobs/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteJob(Number(req.params.id));
      res.sendStatus(200);
    } catch (err) {
      res.status(500).json({ message: "Failed to delete job" });
    }
  });

  app.get("/api/admin/books", requireAdmin, async (_req, res) => {
    try {
      const allBooks = await storage.getAllBooks();
      res.json(allBooks);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });

  app.delete("/api/admin/books/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteBook(Number(req.params.id));
      res.sendStatus(200);
    } catch (err) {
      res.status(500).json({ message: "Failed to delete book" });
    }
  });

  // ── Tutor Reviews ──────────────────────────────────────────
  app.get("/api/tutors/:id/reviews", async (req, res) => {
    try {
      const tutorId = Number(req.params.id);
      const reviews = (await storage.getReviewsForTutor(tutorId)).slice(0, 5);
      const enrichedReviews = await Promise.all(
        reviews.map(async (r) => {
          const student = await storage.getUser(r.studentId);
          return { ...r, studentName: student?.name || "Anonymous" };
        })
      );
      res.json(enrichedReviews);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/tutors/:id/reviews", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Please log in to submit a review" });
    const tutorId = Number(req.params.id);
    const studentId = (req.user as any).id;

    if (studentId === tutorId) {
      return res.status(400).json({ message: "You cannot review yourself" });
    }

    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    try {
      let review;
      const existing = await storage.getReviewByStudentAndTutor(studentId, tutorId);

      if (existing) {
        // Update existing review
        review = await storage.updateReview(existing.id, {
          rating: Number(rating),
          comment: comment || "",
        });
      } else {
        // Create new review
        review = await storage.createReview({
          tutorId,
          studentId,
          rating: Number(rating),
          comment: comment || "",
        });
      }

      // Update tutor's average rating safely
      try {
        const allReviews = await storage.getReviewsForTutor(tutorId);
        if (allReviews.length > 0) {
          const avgRating = Math.round(
            allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length * 10
          );
          await storage.updateTutorProfile(tutorId, { rating: avgRating } as any);
        }
      } catch (ratingErr) {
        console.warn("Failed to update tutor average rating:", ratingErr);
      }

      const student = await storage.getUser(studentId);
      res.status(existing ? 200 : 201).json({
        ...review,
        studentName: student?.name || "Anonymous",
        updated: !!existing,
      });
    } catch (err: any) {
      console.error("Failed to submit review:", err);
      res.status(500).json({ message: err?.message || "Failed to submit review" });
    }
  });

  // ── Tuition Cards ──────────────────────────────────────────
  app.get("/api/tuitions", async (_req, res) => {
    try {
      const tuitions = await storage.getAllTuitions();
      res.json(tuitions);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch tuitions" });
    }
  });

  app.get("/api/tuitions/my", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const tuitions = await storage.getTuitionsByTutor((req.user as any).id);
      res.json(tuitions);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch your tuitions" });
    }
  });

  app.post("/api/tuitions", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Please log in" });
    const user = req.user as any;
    if (user.role !== "teacher") return res.status(403).json({ message: "Only teachers can post tuitions" });

    const { subject, classLevel, timing, fees, mode, description } = req.body;
    if (!subject || !classLevel || !timing || !fees) {
      return res.status(400).json({ message: "Subject, class, timing and fees are required" });
    }

    try {
      const tuition = await storage.createTuition({
        tutorId: user.id,
        subject,
        classLevel,
        timing,
        fees: Number(fees),
        mode: mode || "online",
        description: description || "",
        isActive: true,
      });
      res.status(201).json(tuition);
    } catch (err: any) {
      console.error("Failed to create tuition:", err);
      res.status(500).json({ message: err?.message || "Failed to create tuition" });
    }
  });

  app.put("/api/tuitions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = Number(req.params.id);
    const userId = (req.user as any).id;

    try {
      const existing = await storage.getTuition(id);
      if (!existing) return res.status(404).json({ message: "Tuition not found" });
      if (existing.tutorId !== userId) return res.status(403).json({ message: "Not authorized" });

      const updated = await storage.updateTuition(id, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ message: err?.message || "Failed to update tuition" });
    }
  });

  app.delete("/api/tuitions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = Number(req.params.id);
    const userId = (req.user as any).id;

    try {
      const existing = await storage.getTuition(id);
      if (!existing) return res.status(404).json({ message: "Tuition not found" });
      if (existing.tutorId !== userId) return res.status(403).json({ message: "Not authorized" });

      await storage.deleteTuition(id);
      res.sendStatus(200);
    } catch (err: any) {
      res.status(500).json({ message: err?.message || "Failed to delete tuition" });
    }
  });

  // ── Student Enrollment Routes ──────────────────────────────────────
  
  // Enroll a student in a tuition (with upfront payment including platform commission)
  app.post("/api/enrollments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const studentId = (req.user as any).id;
    const user = req.user as any;
    
    if (user.role !== "student") {
      return res.status(403).json({ message: "Only students can enroll" });
    }

    try {
      const { tuitionId, paymentAmount } = req.body;
      if (!tuitionId) return res.status(400).json({ message: "tuitionId is required" });

      // Get tuition to verify it exists and get tutor ID
      const tuition = await storage.getTuition(Number(tuitionId));
      if (!tuition) return res.status(404).json({ message: "Tuition not found" });

      // Check if already enrolled
      const existing = await storage.getEnrollment(studentId, Number(tuitionId));
      if (existing) return res.status(400).json({ message: "Already enrolled in this tuition" });

      // Validate payment amount: must be at least fees + 49 (platform commission)
      const expectedAmount = tuition.fees + 49;
      const actualPayment = paymentAmount || expectedAmount;
      if (actualPayment < expectedAmount) {
        return res.status(400).json({ message: `Payment must be at least ₹${expectedAmount} (₹${tuition.fees} fees + ₹49 platform commission)` });
      }

      const enrollment = await storage.enrollStudent({
        studentId,
        tuitionId: Number(tuitionId),
        tutorId: tuition.tutorId,
        status: "active"
      });

      // Create first payment record — marked as PAID since student pays upfront
      const now = new Date();
      const month = now.toISOString().slice(0, 7); // YYYY-MM format

      await storage.recordPayment({
        studentId,
        tutorId: tuition.tutorId,
        tuitionId: Number(tuitionId),
        amount: actualPayment,
        status: "paid",
        dueDate: now,
        month,
        paidDate: now
      });

      res.status(201).json({ ...enrollment, tuition });
    } catch (err: any) {
      res.status(500).json({ message: err?.message || "Failed to enroll student" });
    }
  });

  // Get student's enrollments
  app.get("/api/enrollments/student", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const studentId = (req.user as any).id;

    try {
      const enrollments = await storage.getStudentEnrollments(studentId);
      res.json(enrollments);
    } catch (err: any) {
      res.status(500).json({ message: err?.message || "Failed to fetch enrollments" });
    }
  });

  // Get teacher's student enrollments
  app.get("/api/enrollments/teacher", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const tutorId = (req.user as any).id;

    try {
      const enrollments = await storage.getTutorEnrollments(tutorId);
      res.json(enrollments);
    } catch (err: any) {
      res.status(500).json({ message: err?.message || "Failed to fetch teacher enrollments" });
    }
  });

  // Remove enrollment
  app.delete("/api/enrollments/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const enrollmentId = Number(req.params.id);

    try {
      await storage.removeEnrollment(enrollmentId);
      res.sendStatus(200);
    } catch (err: any) {
      res.status(500).json({ message: err?.message || "Failed to remove enrollment" });
    }
  });

  // ── Teacher Analytics Routes ──────────────────────────────────────
  
  // Get teacher's analytics
  app.get("/api/analytics/teacher", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const tutorId = (req.user as any).id;
    const user = req.user as any;

    if (user.role !== "teacher") {
      return res.status(403).json({ message: "Only teachers can view analytics" });
    }

    try {
      const analytics = await storage.getTutorAnalytics(tutorId);
      res.json(analytics);
    } catch (err: any) {
      res.status(500).json({ message: err?.message || "Failed to fetch analytics" });
    }
  });

  // ── Payment Routes ──────────────────────────────────────
  
  // Record a payment
  app.post("/api/payments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { studentId, tutorId, tuitionId, amount, month, dueDate } = req.body;
      
      if (!studentId || !tutorId || !tuitionId || !amount || !month || !dueDate) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const payment = await storage.recordPayment({
        studentId,
        tutorId,
        tuitionId,
        amount,
        status: "pending",
        dueDate: new Date(dueDate),
        month,
        paidDate: null
      });

      res.json(payment);
    } catch (err: any) {
      res.status(500).json({ message: err?.message || "Failed to record payment" });
    }
  });

  // Get teacher's payments
  app.get("/api/payments/teacher", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const tutorId = (req.user as any).id;

    try {
      const payments = await storage.getTutorPayments(tutorId);
      res.json(payments);
    } catch (err: any) {
      res.status(500).json({ message: err?.message || "Failed to fetch payments" });
    }
  });

  // Get student's payment history
  app.get("/api/payments/student", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const studentId = (req.user as any).id;

    try {
      const payments = await storage.getStudentPayments(studentId);
      res.json(payments);
    } catch (err: any) {
      res.status(500).json({ message: err?.message || "Failed to fetch payment history" });
    }
  });

  // Mark payment as received
  app.put("/api/payments/:id/mark-received", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const paymentId = Number(req.params.id);
    const user = req.user as any;

    try {
      const payment = await storage.markPaymentAsReceived(paymentId);
      if (!payment) return res.status(404).json({ message: "Payment not found" });
      
      res.json(payment);
    } catch (err: any) {
      res.status(500).json({ message: err?.message || "Failed to mark payment as received" });
    }
  });

  // Student pays pending fees
  app.put("/api/payments/:id/pay", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const paymentId = Number(req.params.id);

    if (user.role !== "student") {
      return res.status(403).json({ message: "Only students can pay fees" });
    }

    try {
      const payment = await storage.markPaymentAsReceived(paymentId);
      if (!payment) return res.status(404).json({ message: "Payment not found" });
      
      res.json(payment);
    } catch (err: any) {
      res.status(500).json({ message: err?.message || "Failed to process payment" });
    }
  });

  // ── File Upload Routes ──────────────────────────────────────
  app.post("/api/upload/avatar", avatarUpload.single("avatar"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }

      const userId = (req.user as any).id;
      const avatarUrl = (req.file as any).path; // Cloudinary returns the full URL in 'path'

      // Update user avatar in database
      const updatedUser = await storage.updateUser(userId, { avatar: avatarUrl });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update session user data
      req.user = updatedUser;

      res.json({
        message: "Avatar uploaded successfully",
        avatar: avatarUrl,
        user: updatedUser,
      });
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      res.status(500).json({ message: error?.message || "Failed to upload avatar" });
    }
  });

  app.post("/api/upload/certificate", certificateUpload.single("certificate"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }

      const userId = (req.user as any).id;
      const certificateUrl = (req.file as any).path;

      // Update tutor profile with certificate URL
      const profile = await storage.getTutorProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Tutor profile not found. Create a profile first." });
      }

      await storage.updateTutorProfile(userId, { certificate: certificateUrl } as any);

      res.json({
        message: "Certificate uploaded successfully",
        certificate: certificateUrl,
      });
    } catch (error: any) {
      console.error("Certificate upload error:", error);
      res.status(500).json({ message: error?.message || "Failed to upload certificate" });
    }
  });

  return httpServer;
}
