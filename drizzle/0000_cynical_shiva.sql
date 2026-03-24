CREATE TABLE "exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"muscle_group" text,
	"equipment" text,
	"instructions" text,
	"is_custom" boolean DEFAULT false NOT NULL,
	"created_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sets" (
	"id" serial PRIMARY KEY NOT NULL,
	"workout_exercise_id" integer NOT NULL,
	"set_number" integer NOT NULL,
	"reps" integer,
	"weight_kg" real,
	"duration_seconds" integer,
	"rpe" real,
	"is_warmup" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"workout_id" integer NOT NULL,
	"exercise_id" integer NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text,
	"notes" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sets" ADD CONSTRAINT "sets_workout_exercise_id_workout_exercises_id_fk" FOREIGN KEY ("workout_exercise_id") REFERENCES "public"."workout_exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_exercises_name" ON "exercises" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_exercises_created_by" ON "exercises" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX "idx_sets_workout_exercise_id" ON "sets" USING btree ("workout_exercise_id");--> statement-breakpoint
CREATE INDEX "idx_we_workout_id" ON "workout_exercises" USING btree ("workout_id");--> statement-breakpoint
CREATE INDEX "idx_we_exercise_id" ON "workout_exercises" USING btree ("exercise_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_we_workout_order" ON "workout_exercises" USING btree ("workout_id","order_index");--> statement-breakpoint
CREATE INDEX "idx_workouts_user_id" ON "workouts" USING btree ("user_id");