-- AlterTable: snapshot the payer's identity onto each payment attempt so the
-- Payment row is readable on its own (previously it only held a userId UUID).
ALTER TABLE "Payment" ADD COLUMN     "username" TEXT,
ADD COLUMN     "email" TEXT;

-- Backfill existing rows from the User table.
UPDATE "Payment" p
SET "username" = u."username",
    "email"    = u."email"
FROM "User" u
WHERE p."userId" = u."id";
