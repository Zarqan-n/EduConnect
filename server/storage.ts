import { 
  User, InsertUser, TutorProfile, InsertTutorProfile, Job, InsertJob, 
  Application, Book, InsertBook, Review, InsertReview,
  users, tutorProfiles, jobs, applications, books, reviews
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, and, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  getUsersByRole(role: string, location?: string): Promise<User[]>;

  // Tutors
  createTutorProfile(profile: InsertTutorProfile): Promise<TutorProfile>;
  getTutorProfile(userId: number): Promise<TutorProfile | undefined>;
  getTutors(filters?: { subject?: string, location?: string, mode?: string }): Promise<(User & { tutorProfile: TutorProfile })[]>;

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

  async getTutorProfile(userId: number): Promise<TutorProfile | undefined> {
    const [profile] = await db.select().from(tutorProfiles).where(eq(tutorProfiles.userId, userId));
    return profile;
  }

  async getTutors(filters?: { subject?: string, location?: string, mode?: string }): Promise<(User & { tutorProfile: TutorProfile })[]> {
    const conditions = [];
    if (filters?.location) conditions.push(ilike(users.location, `%${filters.location}%`));
    
    // Join users and tutor profiles
    const results = await db.select()
      .from(users)
      .innerJoin(tutorProfiles, eq(users.id, tutorProfiles.userId))
      .where(and(...conditions));

    // Filter by subject/mode in JS for MVP simplicity with JSON arrays
    let filtered = results.map(r => ({ ...r.users, tutorProfile: r.tutor_profiles }));
    
    if (filters?.subject) {
      filtered = filtered.filter(u => 
        u.tutorProfile.subjects?.some(s => s.toLowerCase().includes(filters.subject!.toLowerCase()))
      );
    }
    if (filters?.mode) {
      filtered = filtered.filter(u => u.tutorProfile.mode === filters.mode);
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

  async getTutorProfile(userId: number): Promise<TutorProfile | undefined> {
    return this.tutors.find(t => t.userId === userId);
  }

  async getTutors(filters?: { subject?: string, location?: string, mode?: string }): Promise<(User & { tutorProfile: TutorProfile })[]> {
    return [];
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
