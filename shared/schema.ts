import { pgTable, text, serial, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const roleEnum = pgEnum("role", ["student", "teacher", "institution", "seller", "admin"]);
export const jobStatusEnum = pgEnum("job_status", ["open", "closed"]);
export const applicationStatusEnum = pgEnum("application_status", ["pending", "accepted", "rejected"]);
export const bookConditionEnum = pgEnum("book_condition", ["new", "like_new", "good", "fair", "poor"]);

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull().default("student"),
  name: text("name").notNull(),
  email: text("email"),
  location: text("location"), // Simple string for city/area
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tutor Profiles
export const tutorProfiles = pgTable("tutor_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  subjects: text("subjects").array(),
  classes: text("classes").array(), // Grades/Classes taught
  experience: integer("experience").default(0), // Years
  hourlyRate: integer("hourly_rate").default(0),
  mode: text("mode"), // "online", "home", "both"
  // Comma-separated or free-text availability description (e.g. "Morning,Evening" or "Mon-Fri 6-9pm")
  timings: text("timings"),
  rating: integer("rating").default(0), // Average rating (stored as int 0-50 for 0.0-5.0 or just float if supported well, sticking to simple logic for now)
  createdAt: timestamp("created_at").defaultNow(),
});

// Jobs
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  subject: text("subject"),
  qualification: text("qualification"),
  salaryRange: text("salary_range"),
  experience: integer("experience"), // Years required
  location: text("location"),
  status: jobStatusEnum("status").default("open"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Applications
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  teacherId: integer("teacher_id").notNull().references(() => users.id),
  status: applicationStatusEnum("status").default("pending"),
  appliedAt: timestamp("applied_at").defaultNow(),
});

// Books
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  subject: text("subject"),
  classLevel: text("class_level"),
  price: integer("price").notNull(),
  condition: bookConditionEnum("condition").notNull(),
  location: text("location"),
  imageUrl: text("image_url"),
  description: text("description"),
  sold: boolean("sold").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  tutorId: integer("tutor_id").notNull().references(() => users.id),
  studentId: integer("student_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  tutorProfile: one(tutorProfiles, {
    fields: [users.id],
    references: [tutorProfiles.userId],
  }),
  jobs: many(jobs), // If institution
  applications: many(applications), // If teacher
  books: many(books), // If seller
  reviewsReceived: many(reviews, { relationName: "reviewsReceived" }), // If tutor
  reviewsGiven: many(reviews, { relationName: "reviewsGiven" }), // If student
}));

export const tutorProfileRelations = relations(tutorProfiles, ({ one }) => ({
  user: one(users, {
    fields: [tutorProfiles.userId],
    references: [users.id],
  }),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  institution: one(users, {
    fields: [jobs.institutionId],
    references: [users.id],
  }),
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
  teacher: one(users, {
    fields: [applications.teacherId],
    references: [users.id],
  }),
}));

export const booksRelations = relations(books, ({ one }) => ({
  seller: one(users, {
    fields: [books.sellerId],
    references: [users.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  tutor: one(users, {
    fields: [reviews.tutorId],
    references: [users.id],
    relationName: "reviewsReceived",
  }),
  student: one(users, {
    fields: [reviews.studentId],
    references: [users.id],
    relationName: "reviewsGiven",
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertTutorProfileSchema = createInsertSchema(tutorProfiles).omit({ id: true, createdAt: true });
export const insertJobSchema = createInsertSchema(jobs).omit({ id: true, createdAt: true });
export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true, appliedAt: true });
export const insertBookSchema = createInsertSchema(books).omit({ id: true, createdAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type TutorProfile = typeof tutorProfiles.$inferSelect;
export type InsertTutorProfile = z.infer<typeof insertTutorProfileSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Application = typeof applications.$inferSelect;
export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
