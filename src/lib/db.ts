import { PrismaClient, Gender, DrivingLicense } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import type { FormValues } from "@/lib/form-schema";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export async function createInstructor(data: FormValues) {
  // Transform languages from booleans to array
  const languages: string[] = [];
  if (data.languageEnglish) languages.push("English");
  if (data.languageMalay) languages.push("Malay");
  if (data.languageMandarin) languages.push("Mandarin");
  if (data.languageTamil) languages.push("Tamil");

  // Transform availability fields to JSONB object
  const availability = {
    monday: {
      available: data.availabilityMonday ?? false,
      start: data.availabilityMondayStart || null,
      end: data.availabilityMondayEnd || null,
    },
    tuesday: {
      available: data.availabilityTuesday ?? false,
      start: data.availabilityTuesdayStart || null,
      end: data.availabilityTuesdayEnd || null,
    },
    wednesday: {
      available: data.availabilityWednesday ?? false,
      start: data.availabilityWednesdayStart || null,
      end: data.availabilityWednesdayEnd || null,
    },
    thursday: {
      available: data.availabilityThursday ?? false,
      start: data.availabilityThursdayStart || null,
      end: data.availabilityThursdayEnd || null,
    },
    friday: {
      available: data.availabilityFriday ?? false,
      start: data.availabilityFridayStart || null,
      end: data.availabilityFridayEnd || null,
    },
    saturday: {
      available: data.availabilitySaturday ?? false,
      start: data.availabilitySaturdayStart || null,
      end: data.availabilitySaturdayEnd || null,
    },
    sunday: {
      available: data.availabilitySunday ?? false,
      start: data.availabilitySundayStart || null,
      end: data.availabilitySundayEnd || null,
    },
  };

  // Transform pricing fields to JSONB object
  const pricing = {
    registrationFee: data.registrationFee,
    weekdayPricePerHour: data.weekdayPricePerHour,
    weekendPricePerHour: data.weekendpricePerHour, // Note: using the field name from form
  };

  // Map gender string to enum
  const genderEnum = data.gender === "Male" ? Gender.Male : Gender.Female;

  // Map driving license string to enum
  const licenseEnum =
    data.drivingLicense === "3A" ? DrivingLicense.ThreeA : DrivingLicense.Three;

  return await db.instructor.create({
    data: {
      name: data.name as string,
      age: data.age as number,
      gender: genderEnum,
      bio: (data.bio || null) as string | null,
      languages: languages as Prisma.InputJsonValue,
      drivingLicense: licenseEnum,
      teachingExperience: data.teachingExperience as number,
      carInfo: data.carInfo as string,
      lessonLocation: data.lessonLocation as string,
      availability: availability as Prisma.InputJsonValue,
      pricing: pricing as Prisma.InputJsonValue,
    },
  });
}
