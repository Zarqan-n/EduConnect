import { storage } from "./storage";
import { hashPassword } from "./auth";
import { db } from "./db";
import { users } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Check if users exist
  const existingUsers = await db.select().from(users).limit(1);
  if (existingUsers.length > 0) {
    console.log("Database already seeded.");
    return;
  }

  const password = await hashPassword("password123");

  // Create Users
  const student = await storage.createUser({
    username: "student",
    password,
    role: "student",
    name: "Alex Student",
    email: "alex@example.com",
    location: "New York, NY",
    bio: "Eager to learn math and science."
  });

  const teacher = await storage.createUser({
    username: "teacher",
    password,
    role: "teacher",
    name: "Sarah Teacher",
    email: "sarah@example.com",
    location: "Brooklyn, NY",
    bio: "Certified Math teacher with 5 years experience."
  });

  const institution = await storage.createUser({
    username: "institution",
    password,
    role: "institution",
    name: "Brooklyn High School",
    email: "contact@brooklynhs.edu",
    location: "Brooklyn, NY",
    bio: "Excellence in education since 1950."
  });

  const seller = await storage.createUser({
    username: "seller",
    password,
    role: "seller",
    name: "Book Barn",
    email: "books@barn.com",
    location: "Queens, NY",
    bio: "Best used books in the city."
  });

  // Create Tutor Profile
  await storage.createTutorProfile({
    userId: teacher.id,
    subjects: ["Mathematics", "Physics"],
    classes: ["Grade 9", "Grade 10", "Grade 11"],
    experience: 5,
    monthlyRate: 5000,
    mode: "online",
    rating: 48 // 4.8
  });

  // Create Job
  await storage.createJob({
    institutionId: institution.id,
    title: "Senior Physics Teacher",
    subject: "Physics",
    qualification: "Masters in Physics",
    salaryRange: "$60k - $80k",
    experience: 3,
    location: "Brooklyn, NY",
    status: "open"
  });

  // Create Book
  await storage.createBook({
    sellerId: seller.id,
    title: "Calculus: Early Transcendentals",
    subject: "Mathematics",
    classLevel: "College",
    price: 45,
    condition: "good",
    location: "Queens, NY",
    description: "Slightly used, no markings."
  });

  console.log("Seeding complete!");
}

seed().catch(console.error).finally(() => process.exit());
