CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"technologies" text,
	"link" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
