import { pgTable, text, serial, integer, boolean, timestamp, jsonb, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
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
  avatar: text("avatar"), // URL to avatar image on Cloudinary
  createdAt: timestamp("created_at").defaultNow(),
});

// Tutor Profiles
export const tutorProfiles = pgTable("tutor_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  subjects: text("subjects").array(),
  classes: text("classes").array(), // Grades/Classes taught
  experience: integer("experience").default(0), // Years
  monthlyRate: integer("monthly_rate").default(0),
  mode: text("mode"), // "online", "home", "both"
  // Comma-separated or free-text availability description (e.g. "Morning,Evening" or "Mon-Fri 6-9pm")
  timings: text("timings"),
  qualifications: text("qualifications"), // e.g. "B.Sc Physics, M.Sc Mathematics"
  languages: text("languages").array(), // Languages spoken
  rating: integer("rating").default(0), // Average rating (stored as int 0-50 for 0.0-5.0 or just float if supported well, sticking to simple logic for now)
  certificate: text("certificate"), // URL to certificate on Cloudinary
  createdAt: timestamp("created_at").defaultNow(),
});

// Institution Profiles
export const institutionProfiles = pgTable("institution_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  institutionName: text("institution_name").notNull(),
  website: text("website"),
  type: text("type"), // e.g. "School", "Coaching Center", "Tutoring Agency"
  directorName: text("director_name"),
  contactPerson: text("contact_person"),
  staffCount: integer("staff_count").default(0),
  foundedYear: integer("founded_year"),
  specializations: text("specializations").array(), // e.g. ["IIT Coaching", "NEET Prep"]
  description: text("description"),
  accreditation: text("accreditation"), // e.g. "CBSE Affiliated"
  rating: integer("rating").default(0), // Average rating
  createdAt: timestamp("created_at").defaultNow(),
});
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  subject: text("subject"),
  qualification: text("qualification"),
  salaryRange: text("salary_range"),
  experience: integer("experience"), // Years required
  location: text("location"),
  workingTimeStart: text("working_time_start"), // e.g. "8:00 AM"
  workingTimeEnd: text("working_time_end"), // e.g. "4:00 PM"
  workingDays: text("working_days"), // e.g. "Monday to Friday" or JSON array
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
}, (table) => ({
  reviewerPerTutorUnique: uniqueIndex("reviews_tutor_student_unique").on(table.tutorId, table.studentId),
}));

// Job Feedback
export const jobFeedback = pgTable("job_feedback", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  userId: integer("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  feedbackPerUserPerJobUnique: uniqueIndex("job_feedback_job_user_unique").on(table.jobId, table.userId),
}));

// Tuitions (individual class listings by tutors)
export const tuitions = pgTable("tuitions", {
  id: serial("id").primaryKey(),
  tutorId: integer("tutor_id").notNull().references(() => users.id),
  subject: text("subject").notNull(),
  classLevel: text("class_level").notNull(),
  timing: text("timing").notNull(),
  fees: integer("fees").notNull(),
  mode: text("mode"), // "online", "home", "both"
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Student Enrollments (tracks which students are enrolled in which tuitions)
export const studentEnrollments = pgTable("student_enrollments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => users.id),
  tuitionId: integer("tuition_id").notNull().references(() => tuitions.id),
  tutorId: integer("tutor_id").notNull().references(() => users.id),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  status: text("status").default("active"), // "active", "completed", "dropped"
}, (table) => ({
  uniqueEnrollment: uniqueIndex("student_enrollments_unique").on(table.studentId, table.tuitionId),
}));

// Tuition Payments (tracks monthly payments from students)
export const tuitionPayments = pgTable("tuition_payments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => users.id),
  tutorId: integer("tutor_id").notNull().references(() => users.id),
  tuitionId: integer("tuition_id").notNull().references(() => tuitions.id),
  amount: integer("amount").notNull(), // Amount in smallest currency unit
  status: text("status").default("pending"), // "pending", "paid", "overdue"
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  month: text("month").notNull(), // Format: "2024-01" for January 2024
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  tutorProfile: one(tutorProfiles, {
    fields: [users.id],
    references: [tutorProfiles.userId],
  }),
  institutionProfile: one(institutionProfiles, {
    fields: [users.id],
    references: [institutionProfiles.userId],
  }),
  jobs: many(jobs), // If institution
  applications: many(applications), // If teacher
  books: many(books), // If seller
  reviewsReceived: many(reviews, { relationName: "reviewsReceived" }), // If tutor
  reviewsGiven: many(reviews, { relationName: "reviewsGiven" }), // If student
  jobFeedback: many(jobFeedback),
  tuitions: many(tuitions), // If tutor
  studentEnrollments: many(studentEnrollments, { relationName: "enrollments" }), // If student
  tutorEnrollments: many(studentEnrollments, { relationName: "teacherEnrollments" }), // If tutor
  studentPayments: many(tuitionPayments, { relationName: "paymentsMade" }), // If student
  tutorPayments: many(tuitionPayments, { relationName: "paymentsReceived" }), // If tutor
}));

export const tutorProfileRelations = relations(tutorProfiles, ({ one }) => ({
  user: one(users, {
    fields: [tutorProfiles.userId],
    references: [users.id],
  }),
}));

export const institutionProfileRelations = relations(institutionProfiles, ({ one }) => ({
  user: one(users, {
    fields: [institutionProfiles.userId],
    references: [users.id],
  }),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  institution: one(users, {
    fields: [jobs.institutionId],
    references: [users.id],
  }),
  applications: many(applications),
  feedback: many(jobFeedback),
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

export const jobFeedbackRelations = relations(jobFeedback, ({ one }) => ({
  job: one(jobs, {
    fields: [jobFeedback.jobId],
    references: [jobs.id],
  }),
  user: one(users, {
    fields: [jobFeedback.userId],
    references: [users.id],
  }),
}));

export const tuitionsRelations = relations(tuitions, ({ one, many }) => ({
  tutor: one(users, {
    fields: [tuitions.tutorId],
    references: [users.id],
  }),
  enrollments: many(studentEnrollments),
  payments: many(tuitionPayments),
}));

// Student Enrollments Relations
export const studentEnrollmentsRelations = relations(studentEnrollments, ({ one }) => ({
  student: one(users, {
    fields: [studentEnrollments.studentId],
    references: [users.id],
    relationName: "enrollments",
  }),
  tutor: one(users, {
    fields: [studentEnrollments.tutorId],
    references: [users.id],
    relationName: "teacherEnrollments",
  }),
  tuition: one(tuitions, {
    fields: [studentEnrollments.tuitionId],
    references: [tuitions.id],
  }),
}));

// Tuition Payments Relations
export const tuitionPaymentsRelations = relations(tuitionPayments, ({ one }) => ({
  student: one(users, {
    fields: [tuitionPayments.studentId],
    references: [users.id],
    relationName: "paymentsMade",
  }),
  tutor: one(users, {
    fields: [tuitionPayments.tutorId],
    references: [users.id],
    relationName: "paymentsReceived",
  }),
  tuition: one(tuitions, {
    fields: [tuitionPayments.tuitionId],
    references: [tuitions.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertTutorProfileSchema = createInsertSchema(tutorProfiles).omit({ id: true, createdAt: true });
export const insertInstitutionProfileSchema = createInsertSchema(institutionProfiles).omit({ id: true, createdAt: true });
export const insertJobSchema = createInsertSchema(jobs).omit({ id: true, createdAt: true });
export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true, appliedAt: true });
export const insertBookSchema = createInsertSchema(books).omit({ id: true, createdAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export const insertJobFeedbackSchema = createInsertSchema(jobFeedback).omit({ id: true, createdAt: true });
export const insertTuitionSchema = createInsertSchema(tuitions).omit({ id: true, createdAt: true });
export const insertStudentEnrollmentSchema = createInsertSchema(studentEnrollments).omit({ id: true, enrolledAt: true });
export const insertTuitionPaymentSchema = createInsertSchema(tuitionPayments).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type TutorProfile = typeof tutorProfiles.$inferSelect;
export type InsertTutorProfile = z.infer<typeof insertTutorProfileSchema>;
export type InstitutionProfile = typeof institutionProfiles.$inferSelect;
export type InsertInstitutionProfile = z.infer<typeof insertInstitutionProfileSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Application = typeof applications.$inferSelect;
export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type JobFeedback = typeof jobFeedback.$inferSelect;
export type InsertJobFeedback = z.infer<typeof insertJobFeedbackSchema>;
export type Tuition = typeof tuitions.$inferSelect;
export type InsertTuition = z.infer<typeof insertTuitionSchema>;
export type StudentEnrollment = typeof studentEnrollments.$inferSelect;
export type InsertStudentEnrollment = z.infer<typeof insertStudentEnrollmentSchema>;
export type TuitionPayment = typeof tuitionPayments.$inferSelect;
export type InsertTuitionPayment = z.infer<typeof insertTuitionPaymentSchema>;
