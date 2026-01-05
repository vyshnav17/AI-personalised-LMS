/*
  Warnings:

  - Added the required column `title` to the `CommunityPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CommunityPost` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Like" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LearningProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'BEGINNER',
    "pacing" TEXT NOT NULL DEFAULT 'MODERATE',
    "interests" TEXT,
    "lastAssessment" DATETIME,
    CONSTRAINT "LearningProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CommunityPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CommunityPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CommunityPost" ("content", "createdAt", "id", "userId") SELECT "content", "createdAt", "id", "userId" FROM "CommunityPost";
DROP TABLE "CommunityPost";
ALTER TABLE "new_CommunityPost" RENAME TO "CommunityPost";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_postId_key" ON "Like"("userId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningProfile_userId_key" ON "LearningProfile"("userId");
