import {
  User, InsertUser, TutorProfile, InsertTutorProfile, InstitutionProfile, InsertInstitutionProfile, Job, InsertJob,
  Application, Book, InsertBook, Review, InsertReview, JobFeedback, InsertJobFeedback,
  Tuition, InsertTuition, StudentEnrollment, InsertStudentEnrollment, TuitionPayment, InsertTuitionPayment,
  users, tutorProfiles, institutionProfiles, jobs, applications, books, reviews, jobFeedback, tuitions, studentEnrollments, tuitionPayments
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, and, desc, count, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  getUsersByRole(role: string, location?: string): Promise<User[]>;

  // Tutors
  createTutorProfile(profile: InsertTutorProfile): Promise<TutorProfile>;
  updateTutorProfile(userId: number, updates: Partial<InsertTutorProfile>): Promise<TutorProfile | undefined>;
  getTutorProfile(userId: number): Promise<TutorProfile | undefined>;
  getTutors(filters?: { subject?: string, location?: string, mode?: string, maxBudget?: number, time?: string }): Promise<(User & { tutorProfile: TutorProfile })[]>;

  // Institutions
  createInstitutionProfile(profile: InsertInstitutionProfile): Promise<InstitutionProfile>;
  updateInstitutionProfile(userId: number, updates: Partial<InsertInstitutionProfile>): Promise<InstitutionProfile | undefined>;
  getInstitutionProfile(userId: number): Promise<InstitutionProfile | undefined>;
  getInstitutions(filters?: { location?: string, type?: string }): Promise<(User & { institutionProfile: InstitutionProfile })[]>;

  // Jobs
  createJob(job: InsertJob): Promise<Job>;
  getJobs(query?: string): Promise<(Job & { institution: User })[]>;
  getJob(id: number): Promise<(Job & { institution: User }) | undefined>;
  createApplication(app: any): Promise<Application>; // Type 'any' for simplicity in interface, implement properly
  createJobFeedback(feedback: Omit<InsertJobFeedback, "userId"> & { userId: number }): Promise<JobFeedback>;
  getFeedbackForJob(jobId: number): Promise<JobFeedback[]>;
  getJobFeedbackByUserAndJob(jobId: number, userId: number): Promise<JobFeedback | undefined>;
  updateJobFeedback(feedbackId: number, updates: Partial<Omit<JobFeedback, 'id' | 'jobId' | 'userId'>>): Promise<JobFeedback | undefined>;
  deleteJobFeedback(feedbackId: number): Promise<void>;

  // Books
  createBook(book: InsertBook): Promise<Book>;
  getBooks(filters?: { subject?: string, classLevel?: string }): Promise<(Book & { seller: User })[]>;
  getBook(id: number): Promise<(Book & { seller: User }) | undefined>;
  getUserBooks(userId: number): Promise<(Book & { seller: User })[]>;

  // Reviews
  createReview(review: InsertReview): Promise<Review>;
  getReviewsForTutor(tutorId: number): Promise<Review[]>;
  getReview(id: number): Promise<Review | undefined>;
  getUserTutorReviews(userId: number): Promise<Review[]>;
  getReviewByStudentAndTutor(studentId: number, tutorId: number): Promise<Review | undefined>;
  updateReview(id: number, updates: { rating: number; comment: string }): Promise<Review>;
  deleteReview(id: number): Promise<void>;

  // User Content Management
  getUserJobs(userId: number): Promise<(Job & { institution: User })[]>;
  getUserApplications(userId: number): Promise<Application[]>;
  getUserJobFeedback(userId: number): Promise<JobFeedback[]>;
  deleteUserContent(userId: number): Promise<void>;
  getJobFeedback(id: number): Promise<JobFeedback | undefined>;

  // Tuitions
  createTuition(tuition: InsertTuition): Promise<Tuition>;
  getTuitionsByTutor(tutorId: number): Promise<Tuition[]>;
  getAllTuitions(): Promise<(Tuition & { tutor: User })[]>;
  getTuition(id: number): Promise<Tuition | undefined>;
  updateTuition(id: number, updates: Partial<InsertTuition>): Promise<Tuition | undefined>;
  deleteTuition(id: number): Promise<void>;

  // Student Enrollments
  enrollStudent(enrollment: InsertStudentEnrollment): Promise<StudentEnrollment>;
  getStudentEnrollments(studentId: number): Promise<(StudentEnrollment & { tuition: Tuition & { tutor: User } })[]>;
  getTutorEnrollments(tutorId: number): Promise<(StudentEnrollment & { student: User, tuition: Tuition })[]>;
  getEnrollmentsByTuition(tuitionId: number): Promise<(StudentEnrollment & { student: User })[]>;
  removeEnrollment(enrollmentId: number): Promise<void>;
  getEnrollment(studentId: number, tuitionId: number): Promise<StudentEnrollment | undefined>;

  // Tuition Payments
  recordPayment(payment: InsertTuitionPayment): Promise<TuitionPayment>;
  getTutorPayments(tutorId: number): Promise<(TuitionPayment & { student: User, tuition: Tuition })[]>;
  getStudentPayments(studentId: number): Promise<(TuitionPayment & { tutor: User, tuition: Tuition })[]>;
  getTutorAnalytics(tutorId: number): Promise<{
    totalStudents: number;
    enrollmentsByTuition: { tuitionId: number; subject: string; count: number }[];
    monthlyRevenue: { month: string; amount: number }[];
    feesThisMonth: number;
    pendingFees: number;
  }>;
  markPaymentAsReceived(paymentId: number): Promise<TuitionPayment | undefined>;

  // Admin
  getAllUsers(): Promise<User[]>;
  getAllJobs(): Promise<(Job & { institution: User })[]>;
  getAllBooks(): Promise<(Book & { seller: User })[]>;
  deleteUser(id: number): Promise<void>;
  deleteJob(id: number): Promise<void>;
  deleteBook(id: number): Promise<void>;
  getStats(): Promise<{ users: number; tutors: number; jobs: number; books: number }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUsersByRole(role: string, location?: string): Promise<User[]> {
    const conditions: any[] = [eq(users.role, role as any)];
    if (location) conditions.push(ilike(users.location, `%${location}%`));
    const results = await db.select().from(users).where(and(...conditions));
    return results;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  // Tutors
  async createTutorProfile(profile: InsertTutorProfile): Promise<TutorProfile> {
    const [newProfile] = await db.insert(tutorProfiles).values(profile).returning();
    return newProfile;
  }

  async updateTutorProfile(userId: number, updates: Partial<InsertTutorProfile>): Promise<TutorProfile | undefined> {
    try {
      const [updated] = await db.update(tutorProfiles).set(updates).where(eq(tutorProfiles.userId, userId)).returning();
      return updated;
    } catch (err: any) {
      if (err?.code === '42703' || (err?.message || '').includes('timings')) {
        // Timings column missing, retry without returning full row
        await db.update(tutorProfiles).set(updates).where(eq(tutorProfiles.userId, userId));
        return this.getTutorProfile(userId);
      }
      throw err;
    }
  }

  async getTutorProfile(userId: number): Promise<TutorProfile | undefined> {
    try {
      const [profile] = await db.select().from(tutorProfiles).where(eq(tutorProfiles.userId, userId));
      return profile;
    } catch (err: any) {
      if (err?.code === '42703' || (err?.message || '').includes('timings')) {
        const [profile] = await db.select({
          id: tutorProfiles.id,
          userId: tutorProfiles.userId,
          subjects: tutorProfiles.subjects,
          classes: tutorProfiles.classes,
          experience: tutorProfiles.experience,
          monthlyRate: tutorProfiles.monthlyRate,
          mode: tutorProfiles.mode,
          rating: tutorProfiles.rating,
          createdAt: tutorProfiles.createdAt,
        }).from(tutorProfiles).where(eq(tutorProfiles.userId, userId));
        return profile ? { ...profile, timings: null } as any : undefined;
      }
      throw err;
    }
  }

  // Institutions
  async createInstitutionProfile(profile: InsertInstitutionProfile): Promise<InstitutionProfile> {
    const [newProfile] = await db.insert(institutionProfiles).values(profile).returning();
    return newProfile;
  }

  async updateInstitutionProfile(userId: number, updates: Partial<InsertInstitutionProfile>): Promise<InstitutionProfile | undefined> {
    const [updated] = await db.update(institutionProfiles).set(updates).where(eq(institutionProfiles.userId, userId)).returning();
    return updated;
  }

  async getInstitutionProfile(userId: number): Promise<InstitutionProfile | undefined> {
    const [profile] = await db.select().from(institutionProfiles).where(eq(institutionProfiles.userId, userId));
    return profile;
  }

  async getInstitutions(filters?: { location?: string, type?: string }): Promise<(User & { institutionProfile: InstitutionProfile })[]> {
    const conditions = [];
    if (filters?.location) conditions.push(ilike(users.location, `%${filters.location}%`));
    if (filters?.type) conditions.push(ilike(institutionProfiles.type, `%${filters.type}%`));

    const results = await db.select()
      .from(users)
      .innerJoin(institutionProfiles, eq(users.id, institutionProfiles.userId))
      .where(and(...conditions));

    return results.map(r => ({ ...r.users, institutionProfile: r.institution_profiles }));
  }

  async getTutors(filters?: { subject?: string, location?: string, mode?: string, maxBudget?: number, time?: string }): Promise<(User & { tutorProfile: TutorProfile })[]> {
    const conditions = [];
    if (filters?.location) conditions.push(ilike(users.location, `%${filters.location}%`));

    let results;
    try {
      // Join users and tutor profiles
      results = await db.select()
        .from(users)
        .innerJoin(tutorProfiles, eq(users.id, tutorProfiles.userId))
        .where(and(...conditions));
    } catch (err: any) {
      // Fallback if timings column doesn't exist
      if (err?.code === '42703' || (err?.message || '').includes('timings')) {
        console.warn('getTutors: falling back to explicit columns (timings missing)');
        results = await db.select({
          users: users,
          tutor_profiles: {
            id: tutorProfiles.id,
            userId: tutorProfiles.userId,
            subjects: tutorProfiles.subjects,
            classes: tutorProfiles.classes,
            experience: tutorProfiles.experience,
            monthlyRate: tutorProfiles.monthlyRate,
            mode: tutorProfiles.mode,
            rating: tutorProfiles.rating,
            createdAt: tutorProfiles.createdAt,
          },
        })
          .from(users)
          .innerJoin(tutorProfiles, eq(users.id, tutorProfiles.userId))
          .where(and(...conditions));
        // Add timings: null to each result
        results = results.map((r: any) => ({
          ...r,
          tutor_profiles: { ...r.tutor_profiles, timings: null },
        }));
      } else {
        throw err;
      }
    }

    // Filter by subject/mode in JS for MVP simplicity with JSON arrays
    let filtered = results.map((r: any) => ({ ...r.users, tutorProfile: r.tutor_profiles }));

    if (filters?.subject) {
      filtered = filtered.filter(u =>
        u.tutorProfile.subjects?.some((s: string) => s.toLowerCase().includes(filters.subject!.toLowerCase()))
      );
    }
    if (filters?.mode) {
      filtered = filtered.filter(u => u.tutorProfile.mode === filters.mode);
    }
    if (filters?.maxBudget != null) {
      filtered = filtered.filter(u => (u.tutorProfile.monthlyRate ?? Infinity) <= filters.maxBudget!);
    }
    if (filters?.time) {
      const q = filters.time.toLowerCase();
      filtered = filtered.filter(u => (u.tutorProfile.timings || "").toLowerCase().includes(q));
    }

    return filtered;
  }

  // Jobs
  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db.insert(jobs).values(job).returning();
    return newJob;
  }

  async getJobs(query?: string): Promise<(Job & { institution: User })[]> {
    let baseQuery = db.select({
      job: jobs,
      institution: users,
    })
      .from(jobs)
      .innerJoin(users, eq(jobs.institutionId, users.id))
      .where(eq(jobs.status, "open"))
      .orderBy(desc(jobs.createdAt));

    if (query) {
      // Simple search
      // baseQuery.where(ilike(jobs.title, `%${query}%`)); 
      // Drizzle query builder complexity for conditional where, doing simple return for MVP
    }

    const results = await baseQuery;

    if (query) {
      const q = query.toLowerCase();
      return results
        .filter(r => r.job.title.toLowerCase().includes(q) || r.job.subject?.toLowerCase().includes(q))
        .map(r => ({ ...r.job, institution: r.institution }));
    }

    return results.map(r => ({ ...r.job, institution: r.institution }));
  }

  async createApplication(app: any): Promise<Application> {
    const [application] = await db.insert(applications).values(app).returning();
    return application;
  }

  async getJob(id: number): Promise<(Job & { institution: User }) | undefined> {
    const results = await db.select({
      job: jobs,
      institution: users,
    })
      .from(jobs)
      .innerJoin(users, eq(jobs.institutionId, users.id))
      .where(eq(jobs.id, id));

    if (results.length === 0) return undefined;
    const r = results[0];
    return { ...r.job, institution: r.institution };
  }

  async createJobFeedback(feedback: Omit<InsertJobFeedback, "userId"> & { userId: number }): Promise<JobFeedback> {
    const [newFeedback] = await db.insert(jobFeedback).values(feedback).returning();
    return newFeedback;
  }

  async getFeedbackForJob(jobId: number): Promise<JobFeedback[]> {
    return await db.select().from(jobFeedback).where(eq(jobFeedback.jobId, jobId)).orderBy(desc(jobFeedback.createdAt)).limit(10);
  }

  async getJobFeedbackByUserAndJob(jobId: number, userId: number): Promise<JobFeedback | undefined> {
    const result = await db.select().from(jobFeedback).where(and(eq(jobFeedback.jobId, jobId), eq(jobFeedback.userId, userId)));
    return result[0];
  }

  async updateJobFeedback(feedbackId: number, updates: Partial<Omit<JobFeedback, 'id' | 'jobId' | 'userId'>>): Promise<JobFeedback | undefined> {
    const result = await db.update(jobFeedback).set(updates).where(eq(jobFeedback.id, feedbackId)).returning();
    return result[0];
  }

  async deleteJobFeedback(feedbackId: number): Promise<void> {
    await db.delete(jobFeedback).where(eq(jobFeedback.id, feedbackId));
  }

  // Books
  async createBook(book: InsertBook): Promise<Book> {
    const [newBook] = await db.insert(books).values(book).returning();
    return newBook;
  }

  async getBooks(filters?: { subject?: string, classLevel?: string }): Promise<(Book & { seller: User })[]> {
    const results = await db.select({
      book: books,
      seller: users
    })
      .from(books)
      .innerJoin(users, eq(books.sellerId, users.id))
      .where(eq(books.sold, false))
      .orderBy(desc(books.createdAt));

    let mapped = results.map(r => ({ ...r.book, seller: r.seller }));

    if (filters?.subject) {
      mapped = mapped.filter(b => b.subject?.toLowerCase().includes(filters.subject!.toLowerCase()));
    }
    if (filters?.classLevel) {
      mapped = mapped.filter(b => b.classLevel === filters.classLevel);
    }

    return mapped;
  }

  // Reviews
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getReviewsForTutor(tutorId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.tutorId, tutorId)).orderBy(desc(reviews.createdAt));
  }

  async getReviewByStudentAndTutor(studentId: number, tutorId: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews)
      .where(and(eq(reviews.studentId, studentId), eq(reviews.tutorId, tutorId)));
    return review;
  }

  async updateReview(id: number, updates: { rating: number; comment: string }): Promise<Review> {
    const [updated] = await db.update(reviews).set(updates).where(eq(reviews.id, id)).returning();
    return updated;
  }

  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review;
  }

  async getUserTutorReviews(userId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.studentId, userId)).orderBy(desc(reviews.createdAt));
  }

  async deleteReview(id: number): Promise<void> {
    await db.delete(reviews).where(eq(reviews.id, id));
  }

  // User Content Management
  async getBook(id: number): Promise<(Book & { seller: User }) | undefined> {
    const result = await db.select({ book: books, seller: users })
      .from(books)
      .innerJoin(users, eq(books.sellerId, users.id))
      .where(eq(books.id, id));
    if (result[0]) {
      return { ...result[0].book, seller: result[0].seller };
    }
    return undefined;
  }

  async getUserBooks(userId: number): Promise<(Book & { seller: User })[]> {
    const results = await db.select({ book: books, seller: users })
      .from(books)
      .innerJoin(users, eq(books.sellerId, users.id))
      .where(eq(books.sellerId, userId))
      .orderBy(desc(books.createdAt));
    return results.map(r => ({ ...r.book, seller: r.seller }));
  }

  async getUserJobs(userId: number): Promise<(Job & { institution: User })[]> {
    const results = await db.select({ job: jobs, institution: users })
      .from(jobs)
      .innerJoin(users, eq(jobs.institutionId, users.id))
      .where(eq(jobs.institutionId, userId))
      .orderBy(desc(jobs.createdAt));
    return results.map(r => ({ ...r.job, institution: r.institution }));
  }

  async getUserApplications(userId: number): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.teacherId, userId)).orderBy(desc(applications.appliedAt));
  }

  async getUserJobFeedback(userId: number): Promise<JobFeedback[]> {
    return await db.select().from(jobFeedback).where(eq(jobFeedback.userId, userId)).orderBy(desc(jobFeedback.createdAt));
  }

  async getJobFeedback(id: number): Promise<JobFeedback | undefined> {
    const [feedback] = await db.select().from(jobFeedback).where(eq(jobFeedback.id, id));
    return feedback;
  }

  async deleteUserContent(userId: number): Promise<void> {
    // Delete all user-generated content
    await db.delete(reviews).where(eq(reviews.studentId, userId));
    await db.delete(jobFeedback).where(eq(jobFeedback.userId, userId));
    await db.delete(applications).where(eq(applications.teacherId, userId));
  }

  // Admin
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAllJobs(): Promise<(Job & { institution: User })[]> {
    const results = await db.select({ job: jobs, institution: users })
      .from(jobs)
      .innerJoin(users, eq(jobs.institutionId, users.id))
      .orderBy(desc(jobs.createdAt));
    return results.map(r => ({ ...r.job, institution: r.institution }));
  }

  async getAllBooks(): Promise<(Book & { seller: User })[]> {
    const results = await db.select({ book: books, seller: users })
      .from(books)
      .innerJoin(users, eq(books.sellerId, users.id))
      .orderBy(desc(books.createdAt));
    return results.map(r => ({ ...r.book, seller: r.seller }));
  }

  async deleteUser(id: number): Promise<void> {
    // Delete related records first
    await db.delete(reviews).where(eq(reviews.studentId, id));
    await db.delete(reviews).where(eq(reviews.tutorId, id));
    await db.delete(applications).where(eq(applications.teacherId, id));
    await db.delete(books).where(eq(books.sellerId, id));
    // Delete jobs and their applications
    const userJobs = await db.select().from(jobs).where(eq(jobs.institutionId, id));
    for (const job of userJobs) {
      await db.delete(applications).where(eq(applications.jobId, job.id));
    }
    await db.delete(jobs).where(eq(jobs.institutionId, id));
    await db.delete(tutorProfiles).where(eq(tutorProfiles.userId, id));
    await db.delete(institutionProfiles).where(eq(institutionProfiles.userId, id));
    await db.delete(users).where(eq(users.id, id));
  }

  async deleteJob(id: number): Promise<void> {
    await db.delete(applications).where(eq(applications.jobId, id));
    await db.delete(jobs).where(eq(jobs.id, id));
  }

  async deleteBook(id: number): Promise<void> {
    await db.delete(books).where(eq(books.id, id));
  }

  async getStats(): Promise<{ users: number; tutors: number; jobs: number; books: number }> {
    const [usersCount] = await db.select({ count: count() }).from(users);
    const [tutorsCount] = await db.select({ count: count() }).from(tutorProfiles);
    const [jobsCount] = await db.select({ count: count() }).from(jobs);
    const [booksCount] = await db.select({ count: count() }).from(books);
    return {
      users: usersCount.count,
      tutors: tutorsCount.count,
      jobs: jobsCount.count,
      books: booksCount.count,
    };
  }

  // Tuitions
  async createTuition(tuition: InsertTuition): Promise<Tuition> {
    const [newTuition] = await db.insert(tuitions).values(tuition).returning();
    return newTuition;
  }

  async getTuitionsByTutor(tutorId: number): Promise<Tuition[]> {
    return await db.select().from(tuitions).where(eq(tuitions.tutorId, tutorId)).orderBy(desc(tuitions.createdAt));
  }

  async getAllTuitions(): Promise<any[]> {
    const results = await db.select({ 
      tuition: tuitions, 
      tutor: users,
      tutorProfile: tutorProfiles
    })
      .from(tuitions)
      .innerJoin(users, eq(tuitions.tutorId, users.id))
      .leftJoin(tutorProfiles, eq(users.id, tutorProfiles.userId))
      .where(eq(tuitions.isActive, true))
      .orderBy(desc(tuitions.createdAt));
    return results.map(r => ({ 
      ...r.tuition, 
      tutor: {
        ...r.tutor,
        tutorProfile: r.tutorProfile
      }
    }));
  }

  async getTuition(id: number): Promise<Tuition | undefined> {
    const [tuition] = await db.select().from(tuitions).where(eq(tuitions.id, id));
    return tuition;
  }

  async updateTuition(id: number, updates: Partial<InsertTuition>): Promise<Tuition | undefined> {
    const [updated] = await db.update(tuitions).set(updates).where(eq(tuitions.id, id)).returning();
    return updated;
  }

  async deleteTuition(id: number): Promise<void> {
    await db.delete(tuitions).where(eq(tuitions.id, id));
  }

  // Student Enrollments
  async enrollStudent(enrollment: InsertStudentEnrollment): Promise<StudentEnrollment> {
    const [newEnrollment] = await db.insert(studentEnrollments).values(enrollment).returning();
    return newEnrollment;
  }

  async getStudentEnrollments(studentId: number): Promise<(StudentEnrollment & { tuition: Tuition & { tutor: User } })[]> {
    const results = await db
      .select()
      .from(studentEnrollments)
      .innerJoin(tuitions, eq(studentEnrollments.tuitionId, tuitions.id))
      .innerJoin(users, eq(tuitions.tutorId, users.id))
      .where(eq(studentEnrollments.studentId, studentId));
    
    return results.map(r => ({
      ...r.student_enrollments,
      tuition: {
        ...r.tuitions,
        tutor: r.users
      }
    }));
  }

  async getTutorEnrollments(tutorId: number): Promise<(StudentEnrollment & { student: User, tuition: Tuition })[]> {
    const results = await db
      .select()
      .from(studentEnrollments)
      .innerJoin(users, eq(studentEnrollments.studentId, users.id))
      .innerJoin(tuitions, eq(studentEnrollments.tuitionId, tuitions.id))
      .where(eq(studentEnrollments.tutorId, tutorId));
    
    return results.map(r => ({
      ...r.student_enrollments,
      student: r.users,
      tuition: r.tuitions
    }));
  }

  async getEnrollmentsByTuition(tuitionId: number): Promise<(StudentEnrollment & { student: User })[]> {
    const results = await db
      .select()
      .from(studentEnrollments)
      .innerJoin(users, eq(studentEnrollments.studentId, users.id))
      .where(eq(studentEnrollments.tuitionId, tuitionId));
    
    return results.map(r => ({
      ...r.student_enrollments,
      student: r.users
    }));
  }

  async removeEnrollment(enrollmentId: number): Promise<void> {
    await db.delete(studentEnrollments).where(eq(studentEnrollments.id, enrollmentId));
  }

  async getEnrollment(studentId: number, tuitionId: number): Promise<StudentEnrollment | undefined> {
    const [enrollment] = await db
      .select()
      .from(studentEnrollments)
      .where(and(eq(studentEnrollments.studentId, studentId), eq(studentEnrollments.tuitionId, tuitionId)));
    return enrollment;
  }

  // Tuition Payments
  async recordPayment(payment: InsertTuitionPayment): Promise<TuitionPayment> {
    const [newPayment] = await db.insert(tuitionPayments).values(payment).returning();
    return newPayment;
  }

  async getTutorPayments(tutorId: number): Promise<(TuitionPayment & { student: User, tuition: Tuition })[]> {
    const results = await db
      .select()
      .from(tuitionPayments)
      .innerJoin(users, eq(tuitionPayments.studentId, users.id))
      .innerJoin(tuitions, eq(tuitionPayments.tuitionId, tuitions.id))
      .where(eq(tuitionPayments.tutorId, tutorId))
      .orderBy(desc(tuitionPayments.createdAt));
    
    return results.map(r => ({
      ...r.tuition_payments,
      student: r.users,
      tuition: r.tuitions
    }));
  }

  async getStudentPayments(studentId: number): Promise<(TuitionPayment & { tutor: User, tuition: Tuition })[]> {
    const results = await db
      .select()
      .from(tuitionPayments)
      .innerJoin(users, eq(tuitionPayments.tutorId, users.id))
      .innerJoin(tuitions, eq(tuitionPayments.tuitionId, tuitions.id))
      .where(eq(tuitionPayments.studentId, studentId))
      .orderBy(desc(tuitionPayments.createdAt));
    
    return results.map(r => ({
      ...r.tuition_payments,
      tutor: r.users,
      tuition: r.tuitions
    }));
  }

  async markPaymentAsReceived(paymentId: number): Promise<TuitionPayment | undefined> {
    const [updated] = await db
      .update(tuitionPayments)
      .set({ status: "paid", paidDate: new Date() })
      .where(eq(tuitionPayments.id, paymentId))
      .returning();
    return updated;
  }

  async getTutorAnalytics(tutorId: number): Promise<{
    totalStudents: number;
    enrollmentsByTuition: { tuitionId: number; subject: string; count: number }[];
    monthlyRevenue: { month: string; amount: number }[];
    expectedIncome: number;
    incomeThisMonth: number;
    pendingFees: number;
  }> {
    // Get total unique students enrolled
    const enrollmentResults = await db
      .select({ studentId: studentEnrollments.studentId })
      .from(studentEnrollments)
      .where(eq(studentEnrollments.tutorId, tutorId));
    
    const totalStudents = new Set(enrollmentResults.map(e => e.studentId)).size;

    // Get enrollments by tuition
    const enrollmentsByTuition = await db
      .select({
        tuitionId: studentEnrollments.tuitionId,
        subject: tuitions.subject,
        count: count(studentEnrollments.id)
      })
      .from(studentEnrollments)
      .innerJoin(tuitions, eq(studentEnrollments.tuitionId, tuitions.id))
      .where(eq(studentEnrollments.tutorId, tutorId))
      .groupBy(studentEnrollments.tuitionId, tuitions.subject);

    // Get monthly revenue for last 6 months
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // Format: YYYY-MM
    const sixMonthsAgo = new Date(new Date().setMonth(now.getMonth() - 6));
    
    const monthlyPayments = await db
      .select({
        month: tuitionPayments.month,
        amount: tuitionPayments.amount
      })
      .from(tuitionPayments)
      .where(and(
        eq(tuitionPayments.tutorId, tutorId),
        eq(tuitionPayments.status, "paid"),
        gte(tuitionPayments.paidDate, sixMonthsAgo)
      ));

    // Aggregate monthly revenue
    const monthlyRevenueMap = new Map<string, number>();
    monthlyPayments.forEach(payment => {
      if (payment.month) {
        monthlyRevenueMap.set(
          payment.month,
          (monthlyRevenueMap.get(payment.month) || 0) + payment.amount
        );
      }
    });

    const monthlyRevenue = Array.from(monthlyRevenueMap.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Calculate Expected Income = sum of all active tuition fees for this month
    const activeEnrollments = await db
      .select({
        tuitionId: studentEnrollments.tuitionId,
        fees: tuitions.fees
      })
      .from(studentEnrollments)
      .innerJoin(tuitions, eq(studentEnrollments.tuitionId, tuitions.id))
      .where(and(
        eq(studentEnrollments.tutorId, tutorId),
        eq(studentEnrollments.status, "active")
      ));

    const expectedIncome = activeEnrollments.reduce((sum, enrollment) => sum + (enrollment.fees || 0), 0);

    // Get fees received this month (paid)
    const thisMonthPayments = await db
      .select({ amount: tuitionPayments.amount })
      .from(tuitionPayments)
      .where(and(
        eq(tuitionPayments.tutorId, tutorId),
        eq(tuitionPayments.status, "paid"),
        eq(tuitionPayments.month, currentMonth)
      ));

    const incomeThisMonth = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);

    // Pending fees = Expected Income - Income This Month
    const pendingFees = expectedIncome - incomeThisMonth;

    return {
      totalStudents,
      enrollmentsByTuition: enrollmentsByTuition as any,
      monthlyRevenue,
      expectedIncome,
      incomeThisMonth,
      pendingFees
    };
  }
}

// In-memory fallback storage for development when Postgres isn't available
class MemoryStorage implements IStorage {
  private users: User[] = [];
  private tutors: TutorProfile[] = [];
  private jobs: Job[] = [];
  private applications: Application[] = [];
  private booksArr: Book[] = [];
  private idCounter = 1;

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async getUsersByRole(role: string, location?: string): Promise<User[]> {
    return this.users.filter(u => u.role === role && (!location || (u.location && u.location.includes(location))));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: any = { ...insertUser, id: this.idCounter++, createdAt: new Date() };
    this.users.push(user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) return undefined;

    const updatedUser = { ...this.users[userIndex], ...updates };
    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  // Tutors
  async createTutorProfile(profile: InsertTutorProfile): Promise<TutorProfile> {
    const p: any = { ...profile, id: this.idCounter++ };
    this.tutors.push(p);
    return p;
  }

  async updateTutorProfile(userId: number, updates: Partial<InsertTutorProfile>): Promise<TutorProfile | undefined> {
    const idx = this.tutors.findIndex(t => t.userId === userId);
    if (idx === -1) return undefined;
    this.tutors[idx] = { ...this.tutors[idx], ...updates };
    return this.tutors[idx];
  }

  async getTutorProfile(userId: number): Promise<TutorProfile | undefined> {
    return this.tutors.find(t => t.userId === userId);
  }

  async getTutors(filters?: { subject?: string, location?: string, mode?: string }): Promise<(User & { tutorProfile: TutorProfile })[]> {
    // Basic in-memory filter over users + tutor profiles
    const usersWithProfiles = this.users.map(u => ({ ...u, tutorProfile: this.tutors.find(t => t.userId === u.id) })).filter(x => x.tutorProfile);
    let results: any[] = usersWithProfiles as any[];
    if (filters?.location) results = results.filter(r => r.location && r.location.includes(filters.location));
    if (filters?.subject) results = results.filter(r => r.tutorProfile.subjects?.some((s: string) => s.toLowerCase().includes(filters.subject!.toLowerCase())));
    if (filters?.mode) results = results.filter(r => r.tutorProfile.mode === filters.mode);
    if ((filters as any)?.maxBudget != null) results = results.filter(r => (r.tutorProfile.monthlyRate ?? Infinity) <= (filters as any).maxBudget);
    if ((filters as any)?.time) results = results.filter(r => (r.tutorProfile.timings || "").toLowerCase().includes(((filters as any).time as string).toLowerCase()));
    return results;
  }

  // Jobs
  async createJob(job: InsertJob): Promise<Job> {
    const j: any = { ...job, id: this.idCounter++, createdAt: new Date() };
    this.jobs.push(j);
    return j;
  }

  async getJobs(query?: string): Promise<(Job & { institution: User })[]> {
    return [];
  }

  async getJob(id: number): Promise<(Job & { institution: User }) | undefined> {
    return undefined;
  }

  async createApplication(app: any): Promise<Application> {
    const a: any = { ...app, id: this.idCounter++ };
    this.applications.push(a);
    return a;
  }

  async createJobFeedback(feedback: Omit<InsertJobFeedback, "userId"> & { userId: number }): Promise<JobFeedback> {
    const f: any = { ...feedback, id: this.idCounter++, createdAt: new Date() };
    return f;
  }

  async getFeedbackForJob(jobId: number): Promise<JobFeedback[]> {
    return [];
  }

  async getJobFeedbackByUserAndJob(jobId: number, userId: number): Promise<JobFeedback | undefined> {
    return undefined;
  }

  async updateJobFeedback(feedbackId: number, updates: Partial<Omit<JobFeedback, 'id' | 'jobId' | 'userId'>>): Promise<JobFeedback | undefined> {
    throw new Error("MemoryStorage: updateJobFeedback not implemented");
  }

  async deleteJobFeedback(feedbackId: number): Promise<void> {
    throw new Error("MemoryStorage: deleteJobFeedback not implemented");
  }

  // Books
  async createBook(book: InsertBook): Promise<Book> {
    const b: any = { ...book, id: this.idCounter++, createdAt: new Date(), sold: false };
    this.booksArr.push(b);
    return b;
  }

  async getBooks(filters?: { subject?: string, classLevel?: string }): Promise<(Book & { seller: User })[]> {
    return [];
  }

  // Reviews
  async createReview(review: InsertReview): Promise<Review> {
    const r: any = { ...review, id: this.idCounter++ };
    return r;
  }

  async getReviewsForTutor(tutorId: number): Promise<Review[]> {
    return [];
  }

  // Admin
  async getAllUsers(): Promise<User[]> {
    return this.users;
  }

  async getAllJobs(): Promise<(Job & { institution: User })[]> {
    return [];
  }

  async getAllBooks(): Promise<(Book & { seller: User })[]> {
    return [];
  }

  async deleteUser(id: number): Promise<void> {
    this.users = this.users.filter(u => u.id !== id);
  }

  async deleteJob(id: number): Promise<void> {
    this.jobs = this.jobs.filter(j => j.id !== id);
  }

  async deleteBook(id: number): Promise<void> {
    this.booksArr = this.booksArr.filter(b => b.id !== id);
  }

  // New methods for profile management
  async getBook(id: number): Promise<(Book & { seller: User }) | undefined> {
    const book = this.booksArr.find(b => b.id === id);
    if (!book) return undefined;
    const seller = this.users.find(u => u.id === book.sellerId);
    return seller ? { ...book, seller } : undefined;
  }

  async getUserBooks(userId: number): Promise<(Book & { seller: User })[]> {
    const userBooks = this.booksArr.filter(b => b.sellerId === userId);
    const seller = this.users.find(u => u.id === userId);
    return seller ? userBooks.map(b => ({ ...b, seller })) : [];
  }

  async getUserJobs(userId: number): Promise<(Job & { institution: User })[]> {
    const userJobs = this.jobs.filter(j => j.institutionId === userId);
    const institution = this.users.find(u => u.id === userId);
    return institution ? userJobs.map(j => ({ ...j, institution })) : [];
  }

  async getUserApplications(userId: number): Promise<Application[]> {
    return this.applications.filter(a => a.teacherId === userId);
  }

  async getUserJobFeedback(userId: number): Promise<JobFeedback[]> {
    return [];  // Not implemented in memory storage
  }

  async getJobFeedback(id: number): Promise<JobFeedback | undefined> {
    return undefined;  // Not implemented in memory storage
  }

  async deleteUserContent(userId: number): Promise<void> {
    // Close to a no-op, but could clear user's books and applications
    this.booksArr = this.booksArr.filter(b => b.sellerId !== userId);
    this.applications = this.applications.filter(a => a.teacherId !== userId);
  }

  async getReview(id: number): Promise<Review | undefined> {
    return undefined;  // Not implemented in memory storage
  }

  async getUserTutorReviews(userId: number): Promise<Review[]> {
    return [];  // Not implemented in memory storage
  }

  async deleteReview(id: number): Promise<void> {
    // No-op in memory storage
  }

  async getStats(): Promise<{ users: number; tutors: number; jobs: number; books: number }> {
    return {
      users: this.users.length,
      tutors: this.tutors.length,
      jobs: this.jobs.length,
      books: this.booksArr.length,
    };
  }

  // Institution Profiles (stubs for MemoryStorage)
  async createInstitutionProfile(profile: InsertInstitutionProfile): Promise<InstitutionProfile> {
    throw new Error("MemoryStorage: createInstitutionProfile not implemented");
  }

  async updateInstitutionProfile(userId: number, updates: Partial<InsertInstitutionProfile>): Promise<InstitutionProfile | undefined> {
    throw new Error("MemoryStorage: updateInstitutionProfile not implemented");
  }

  async getInstitutionProfile(userId: number): Promise<InstitutionProfile | undefined> {
    return undefined;
  }

  async getInstitutions(filters?: { location?: string, type?: string }): Promise<(User & { institutionProfile: InstitutionProfile })[]> {
    return [];
  }

  // Tuitions stubs
  async createTuition(tuition: InsertTuition): Promise<Tuition> { throw new Error("Not implemented"); }
  async getTuitionsByTutor(tutorId: number): Promise<Tuition[]> { return []; }
  async getAllTuitions(): Promise<(Tuition & { tutor: User })[]> { return []; }
  async getTuition(id: number): Promise<Tuition | undefined> { return undefined; }
  async updateTuition(id: number, updates: Partial<InsertTuition>): Promise<Tuition | undefined> { return undefined; }
  async deleteTuition(id: number): Promise<void> {}

  // Student Enrollments stubs
  async enrollStudent(enrollment: InsertStudentEnrollment): Promise<StudentEnrollment> { throw new Error("Not implemented"); }
  async getStudentEnrollments(studentId: number): Promise<(StudentEnrollment & { tuition: Tuition & { tutor: User } })[]> { return []; }
  async getTutorEnrollments(tutorId: number): Promise<(StudentEnrollment & { student: User, tuition: Tuition })[]> { return []; }
  async getEnrollmentsByTuition(tuitionId: number): Promise<(StudentEnrollment & { student: User })[]> { return []; }
  async removeEnrollment(enrollmentId: number): Promise<void> {}
  async getEnrollment(studentId: number, tuitionId: number): Promise<StudentEnrollment | undefined> { return undefined; }

  // Tuition Payments stubs
  async recordPayment(payment: InsertTuitionPayment): Promise<TuitionPayment> { throw new Error("Not implemented"); }
  async getTutorPayments(tutorId: number): Promise<(TuitionPayment & { student: User, tuition: Tuition })[]> { return []; }
  async getStudentPayments(studentId: number): Promise<(TuitionPayment & { tutor: User, tuition: Tuition })[]> { return []; }
  async getTutorAnalytics(tutorId: number): Promise<any> { return { totalStudents: 0, enrollmentsByTuition: [], monthlyRevenue: [], expectedIncome: 0, incomeThisMonth: 0, pendingFees: 0 }; }
  async markPaymentAsReceived(paymentId: number): Promise<TuitionPayment | undefined> { return undefined; }

  // Review stubs
  async getReviewByStudentAndTutor(studentId: number, tutorId: number): Promise<Review | undefined> { return undefined; }
  async updateReview(id: number, updates: { rating: number; comment: string }): Promise<Review> { throw new Error("Not implemented"); }
}

// Export a proxy storage that delegates to DatabaseStorage but falls back to MemoryStorage
let storageDelegate: IStorage = new DatabaseStorage();

export const storage: IStorage = new Proxy({}, {
  get(_, prop: string) {
    // Return a function that wraps delegate calls and falls back on DB errors
    const val: any = (storageDelegate as any)[prop];
    if (typeof val !== 'function') return val;
    return async (...args: any[]) => {
      try {
        return await val.apply(storageDelegate, args);
      } catch (err: any) {
        // If DB is unreachable, swap to memory storage and retry
        if (err?.code === 'ECONNREFUSED' || (err?.message && err.message.includes('ECONNREFUSED'))) {
          const mem = new MemoryStorage();
          storageDelegate = mem;
          const retryVal: any = (storageDelegate as any)[prop];
          if (typeof retryVal === 'function') return await retryVal.apply(storageDelegate, args);
        }
        throw err;
      }
    };
  }
}) as IStorage;
