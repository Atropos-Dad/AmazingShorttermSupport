CREATE TABLE IF NOT EXISTS "notes" (
	"id" INTEGER NOT NULL UNIQUE,
	"title" TEXT,
	"content" TEXT,
	"category_id" INTEGER,
	PRIMARY KEY("id"),
	FOREIGN KEY ("category_id") REFERENCES "category"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "category" (
	"id" INTEGER NOT NULL UNIQUE,
	"title" TEXT,
	PRIMARY KEY("id")
);


-- create a default category
INSERT INTO "category" ("title") VALUES ('Default');
