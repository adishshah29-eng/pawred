-- Better Auth's admin plugin stores roles as lowercase text ("user" / "admin").
-- Convert the old "Role" enum column in place, keeping existing values.

ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "role" TYPE TEXT USING lower("role"::text);
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user';
DROP TYPE "Role";

-- The admin plugin treats "banned" as optional.
ALTER TABLE "user" ALTER COLUMN "banned" DROP NOT NULL;
