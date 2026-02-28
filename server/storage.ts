import {
  User, InsertUser, TutorProfile, InsertTutorProfile, Job, InsertJob,
  Application, Book, InsertBook, Review, InsertReview,
  users, tutorProfiles, jobs, applications, books, reviews
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, and, desc, count } from "drizzle-orm";

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

  // Jobs
  createJob(job: InsertJob): Promise<Job>;
  getJobs(query?: string): Promise<(Job & { institution: User })[]>;
  createApplication(app: any): Promise<Application>; // Type 'any' for simplicity in interface, implement properly

  // Books
  createBook(book: InsertBook): Promise<Book>;
  getBooks(filters?: { subject?: string, classLevel?: string }): Promise<(Book & { seller: User })[]>;

  // Reviews
  createReview(review: InsertReview): Promise<Review>;
  getReviewsForTutor(tutorId: number): Promise<Review[]>;

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
    const [updated] = await db.update(tutorProfiles).set(updates).where(eq(tutorProfiles.userId, userId)).returning();
    return updated;
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
          hourlyRate: tutorProfiles.hourlyRate,
          mode: tutorProfiles.mode,
          rating: tutorProfiles.rating,
          createdAt: tutorProfiles.createdAt,
        }).from(tutorProfiles).where(eq(tutorProfiles.userId, userId));
        return profile ? { ...profile, timings: null } as any : undefined;
      }
      throw err;
    }
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
            hourlyRate: tutorProfiles.hourlyRate,
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
      filtered = filtered.filter(u => (u.tutorProfile.hourlyRate ?? Infinity) <= filters.maxBudget!);
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
    return await db.select().from(reviews).where(eq(reviews.tutorId, tutorId));
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
    if ((filters as any)?.maxBudget != null) results = results.filter(r => (r.tutorProfile.hourlyRate ?? Infinity) <= (filters as any).maxBudget);
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

  async createApplication(app: any): Promise<Application> {
    const a: any = { ...app, id: this.idCounter++ };
    this.applications.push(a);
    return a;
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

  async getStats(): Promise<{ users: number; tutors: number; jobs: number; books: number }> {
    return {
      users: this.users.length,
      tutors: this.tutors.length,
      jobs: this.jobs.length,
      books: this.booksArr.length,
    };
  }
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
