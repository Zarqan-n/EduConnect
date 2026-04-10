-- Keep only the newest tutor review per (tutor_id, student_id)
DELETE FROM "reviews" r
USING "reviews" newer
WHERE r."tutor_id" = newer."tutor_id"
  AND r."student_id" = newer."student_id"
  AND (
    r."created_at" < newer."created_at"
    OR (r."created_at" = newer."created_at" AND r."id" < newer."id")
  );

--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "reviews_tutor_student_unique"
ON "reviews" ("tutor_id", "student_id");

--> statement-breakpoint

-- Keep only the newest job feedback per (job_id, user_id)
DELETE FROM "job_feedback" jf
USING "job_feedback" newer
WHERE jf."job_id" = newer."job_id"
  AND jf."user_id" = newer."user_id"
  AND (
    jf."created_at" < newer."created_at"
    OR (jf."created_at" = newer."created_at" AND jf."id" < newer."id")
  );

--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "job_feedback_job_user_unique"
ON "job_feedback" ("job_id", "user_id");
