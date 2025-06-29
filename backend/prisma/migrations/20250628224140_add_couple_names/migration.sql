/*
  Migration: Add couple names to replace fullName
  
  This migration transforms the single fullName field into separate fields 
  for both people in the couple getting married.
*/

-- Step 1: Add new columns with default values
ALTER TABLE "users" 
ADD COLUMN "person1FirstName" TEXT NOT NULL DEFAULT '',
ADD COLUMN "person1LastName" TEXT NOT NULL DEFAULT '',
ADD COLUMN "person2FirstName" TEXT NOT NULL DEFAULT '',
ADD COLUMN "person2LastName" TEXT NOT NULL DEFAULT '';

-- Step 2: Update existing data
-- For existing users, we'll split fullName and assign to person1, 
-- and create placeholder names for person2 that users can update
UPDATE "users" SET 
  "person1FirstName" = CASE 
    WHEN position(' ' in "fullName") > 0 
    THEN split_part("fullName", ' ', 1)
    ELSE "fullName"
  END,
  "person1LastName" = CASE 
    WHEN position(' ' in "fullName") > 0 
    THEN substring("fullName" from position(' ' in "fullName") + 1)
    ELSE ''
  END,
  "person2FirstName" = 'Partner',
  "person2LastName" = 'Name'
WHERE "fullName" IS NOT NULL;

-- Step 3: Remove default values (columns are now properly populated)
ALTER TABLE "users" 
ALTER COLUMN "person1FirstName" DROP DEFAULT,
ALTER COLUMN "person1LastName" DROP DEFAULT,
ALTER COLUMN "person2FirstName" DROP DEFAULT,
ALTER COLUMN "person2LastName" DROP DEFAULT;

-- Step 4: Drop the old fullName column
ALTER TABLE "users" DROP COLUMN "fullName";
