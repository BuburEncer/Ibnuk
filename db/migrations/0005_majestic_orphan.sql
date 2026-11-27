CREATE TABLE "project_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"image" text NOT NULL,
	"caption" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_images" ADD CONSTRAINT "project_images_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;