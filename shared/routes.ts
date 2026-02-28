import { z } from 'zod';
import {
  insertUserSchema, insertTutorProfileSchema, insertJobSchema,
  insertApplicationSchema, insertBookSchema, insertReviewSchema,
  users, tutorProfiles, jobs, applications, books, reviews,
  type InsertUser, type InsertTutorProfile, type InsertJob, type InsertBook, type InsertReview,
  type User, type TutorProfile, type Job, type Application, type Book, type Review
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  })
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login' as const,
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout' as const,
      responses: {
        200: z.void(),
      },
    },
    register: {
      method: 'POST' as const,
      path: '/api/register' as const,
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  tutors: {
    list: {
      method: 'GET' as const,
      path: '/api/tutors' as const,
      input: z.object({
        subject: z.string().optional(),
        location: z.string().optional(),
        mode: z.string().optional(),
        maxBudget: z.number().optional(),
        time: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect & { tutorProfile: typeof tutorProfiles.$inferSelect }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/tutors/:id' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect & { tutorProfile: typeof tutorProfiles.$inferSelect }>(),
        404: errorSchemas.notFound,
      },
    },
    createProfile: {
      method: 'POST' as const,
      path: '/api/tutors/profile' as const,
      input: insertTutorProfileSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof tutorProfiles.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    updateProfile: {
      method: 'PUT' as const,
      path: '/api/tutors/profile' as const,
      input: insertTutorProfileSchema.omit({ userId: true }).partial(),
      responses: {
        200: z.custom<typeof tutorProfiles.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    }
  },
  jobs: {
    list: {
      method: 'GET' as const,
      path: '/api/jobs' as const,
      input: z.object({
        query: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof jobs.$inferSelect & { institution: typeof users.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/jobs' as const,
      input: insertJobSchema.omit({ institutionId: true }),
      responses: {
        201: z.custom<typeof jobs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    apply: {
      method: 'POST' as const,
      path: '/api/jobs/:id/apply' as const,
      responses: {
        201: z.custom<typeof applications.$inferSelect>(),
        400: errorSchemas.validation,
      }
    }
  },
  books: {
    list: {
      method: 'GET' as const,
      path: '/api/books' as const,
      input: z.object({
        subject: z.string().optional(),
        classLevel: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof books.$inferSelect & { seller: typeof users.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/books' as const,
      input: insertBookSchema.omit({ sellerId: true }),
      responses: {
        201: z.custom<typeof books.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  admin: {
    stats: {
      method: 'GET' as const,
      path: '/api/admin/stats' as const,
      responses: {
        200: z.object({ users: z.number(), tutors: z.number(), jobs: z.number(), books: z.number() }),
      },
    },
    users: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/users' as const,
        responses: {
          200: z.array(z.custom<typeof users.$inferSelect>()),
        },
      },
      delete: {
        method: 'DELETE' as const,
        path: '/api/admin/users/:id' as const,
        responses: { 200: z.void() },
      },
    },
    jobs: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/jobs' as const,
        responses: {
          200: z.array(z.custom<typeof jobs.$inferSelect & { institution: typeof users.$inferSelect }>()),
        },
      },
      delete: {
        method: 'DELETE' as const,
        path: '/api/admin/jobs/:id' as const,
        responses: { 200: z.void() },
      },
    },
    books: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/books' as const,
        responses: {
          200: z.array(z.custom<typeof books.$inferSelect & { seller: typeof users.$inferSelect }>()),
        },
      },
      delete: {
        method: 'DELETE' as const,
        path: '/api/admin/books/:id' as const,
        responses: { 200: z.void() },
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// Re-export types for use in client code
export type { InsertUser, InsertTutorProfile, InsertJob, InsertBook, InsertReview, User, TutorProfile, Job, Application, Book, Review };
