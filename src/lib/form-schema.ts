import * as z from "zod";
import type { FormStep } from "@/components/onboarding-form";
import questionsData from "@/lib/onboarding-questions.json";

const questions = questionsData as FormStep[];

// Build zod schema from form steps
export function buildFormSchema(questions: FormStep[]) {
  const schemaObject = questions.reduce((acc, step) => {
    step.fields.forEach((field) => {
      let fieldSchema: z.ZodTypeAny;

      if (field.type === "checkbox") {
        fieldSchema = field.required
          ? z
              .boolean()
              .refine((val) => val === true, `${field.label} is required`)
          : z.boolean();
      } else if (field.type === "number") {
        fieldSchema = z.coerce.number();
      } else if (field.type === "email") {
        fieldSchema = z.string().email("Invalid email address");
      } else if (field.type === "usd") {
        fieldSchema = z.coerce.number();
      } else {
        fieldSchema = z.string();
      }

      if (field.required && field.type !== "checkbox") {
        if (field.type === "number" || field.type === "usd") {
          // Number is already required by coerce
          fieldSchema = fieldSchema;
        } else if (field.type === "email") {
          fieldSchema = (fieldSchema as z.ZodString).min(
            1,
            `${field.label} is required`
          );
        } else {
          fieldSchema = (fieldSchema as z.ZodString).min(
            1,
            `${field.label} is required`
          );
        }
      } else if (!field.required && field.type !== "checkbox") {
        // Allow empty string for optional fields
        if (field.type === "number" || field.type === "usd") {
          fieldSchema = z.coerce.number().optional();
        } else if (field.type === "email") {
          // For optional email, allow empty string or valid email
          fieldSchema = z
            .string()
            .email("Invalid email address")
            .or(z.literal(""));
        } else {
          fieldSchema = (fieldSchema as z.ZodString).or(z.literal(""));
        }
      }

      acc[field.name] = fieldSchema;
    });
    return acc;
  }, {} as Record<string, z.ZodTypeAny>);

  // Get all language checkbox field names
  const languageFields = questions
    .flatMap((step) => step.fields)
    .filter((field) => field.name.startsWith("language"))
    .map((field) => field.name);

  // Create base schema
  let formSchema = z.object(schemaObject);

  // Add custom validation: at least one language must be selected
  if (languageFields.length > 0) {
    const firstLanguageField = languageFields[0];
    formSchema = formSchema.refine(
      (data) => {
        const atLeastOneLanguage = languageFields.some(
          (fieldName) => data[fieldName] === true
        );
        return atLeastOneLanguage;
      },
      {
        message: "Please select at least one language",
        path: [firstLanguageField] as [string, ...string[]],
      }
    );
  }

  return formSchema;
}

// Build schema with the actual questions
const formSchema = buildFormSchema(questions);

// Export the inferred type - use explicit type annotation to help TypeScript
export type FormValues = z.infer<ReturnType<typeof buildFormSchema>>;

