-- Apply enrollment and payment tables manually
CREATE TABLE IF NOT EXISTS "student_enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"tuition_id" integer NOT NULL,
	"tutor_id" integer NOT NULL,
	"enrolled_at" timestamp DEFAULT now(),
	"status" text DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS "tuition_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"tutor_id" integer NOT NULL,
	"tuition_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"status" text DEFAULT 'pending',
	"due_date" timestamp NOT NULL,
	"paid_date" timestamp,
	"month" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);

-- Add constraints if tables were just created
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'student_enrollments_student_id_users_id_fk'
  ) THEN
    ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'student_enrollments_tuition_id_tuitions_id_fk'
  ) THEN
    ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_tuition_id_tuitions_id_fk" FOREIGN KEY ("tuition_id") REFERENCES "public"."tuitions"("id") ON DELETE no action ON UPDATE no action;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'student_enrollments_tutor_id_users_id_fk'
  ) THEN
    ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_tutor_id_users_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'tuition_payments_student_id_users_id_fk'
  ) THEN
    ALTER TABLE "tuition_payments" ADD CONSTRAINT "tuition_payments_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'tuition_payments_tutor_id_users_id_fk'
  ) THEN
    ALTER TABLE "tuition_payments" ADD CONSTRAINT "tuition_payments_tutor_id_users_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'tuition_payments_tuition_id_tuitions_id_fk'
  ) THEN
    ALTER TABLE "tuition_payments" ADD CONSTRAINT "tuition_payments_tuition_id_tuitions_id_fk" FOREIGN KEY ("tuition_id") REFERENCES "public"."tuitions"("id") ON DELETE no action ON UPDATE no action;
  END IF;
END $$;

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS "student_enrollments_unique" ON "student_enrollments" ("student_id","tuition_id");

-- Add job timing columns
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'working_time_start'
  ) THEN
    ALTER TABLE "jobs" ADD COLUMN "working_time_start" text;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'working_time_end'
  ) THEN
    ALTER TABLE "jobs" ADD COLUMN "working_time_end" text;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'working_days'
  ) THEN
    ALTER TABLE "jobs" ADD COLUMN "working_days" text;
  END IF;
END $$;
