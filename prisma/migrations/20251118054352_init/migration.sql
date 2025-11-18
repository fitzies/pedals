-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female');

-- CreateEnum
CREATE TYPE "DrivingLicense" AS ENUM ('3A', '3');

-- CreateTable
CREATE TABLE "Instructor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" "Gender" NOT NULL,
    "bio" TEXT,
    "languages" JSONB NOT NULL,
    "drivingLicense" "DrivingLicense" NOT NULL,
    "teachingExperience" INTEGER NOT NULL,
    "carInfo" TEXT NOT NULL,
    "lessonLocation" TEXT NOT NULL,
    "availability" JSONB NOT NULL,
    "pricePerHour" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Instructor_pkey" PRIMARY KEY ("id")
);
