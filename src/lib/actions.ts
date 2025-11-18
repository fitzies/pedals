"use server";

import { createInstructor } from "@/lib/db";
import type { FormValues } from "@/lib/form-schema";

export async function createInstructorAction(data: FormValues) {
  try {
    const instructor = await createInstructor(data);
    return {
      success: true,
      data: instructor,
    };
  } catch (error) {
    console.error("Error creating instructor:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create instructor. Please try again.",
    };
  }
}
