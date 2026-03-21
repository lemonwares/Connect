-- CreateEnum
CREATE TYPE "Industry" AS ENUM ('PASTOR', 'ENTREPRENEUR', 'DOCTOR', 'ENGINEER', 'LAWYER', 'EDUCATOR', 'FINANCE', 'TECH', 'CREATIVE', 'REAL_ESTATE', 'HEALTHCARE', 'MEDIA', 'OTHER');

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photo" TEXT,
    "phone" TEXT,
    "bio" TEXT,
    "city" TEXT,
    "jobTitle" TEXT,
    "company" TEXT,
    "industry" "Industry",
    "contactLink" TEXT,
    "funFact" TEXT,
    "sessionKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_sessionKey_key" ON "Profile"("sessionKey");
