"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useWatch } from "react-hook-form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import FormStepper from "./form-stepper";
import { buildFormSchema, type FormValues } from "@/lib/form-schema";
import { createInstructorAction } from "@/lib/actions";

export type FormFieldType = {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "tel"
    | "url"
    | "select"
    | "checkbox"
    | "time"
    | "textarea"
    | "usd";
  placeholder?: string;
  required?: boolean;
  options?: string[]; // For select fields
  inline?: boolean; // For fields that should be on the same line
};

export type FormStep = {
  step: number;
  fields: FormFieldType[];
};

// Re-export FormValues for convenience
export type { FormValues };

type OnboardingFormProps = {
  steps: number[];
  questions: FormStep[];
};

export default function OnboardingForm({
  steps,
  questions,
}: OnboardingFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Build default values and zod schema from questions
  const defaultValues: Record<string, string | boolean> = {};
  questions.forEach((step) => {
    step.fields.forEach((field) => {
      if (field.type === "checkbox") {
        defaultValues[field.name] = false;
      } else {
        defaultValues[field.name] = "";
      }
    });
  });

  const formSchema = buildFormSchema(questions);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues,
  });

  const currentStepData = questions.find((q) => q.step === currentStep);
  if (!currentStepData) {
    return null;
  }

  const isLastStep = currentStep === steps[steps.length - 1];
  const isFirstStep = currentStep === steps[0];

  // Watch form values to detect checkbox changes
  const formValues = useWatch({ control: form.control });

  // Group fields by inline status and availability while maintaining order
  const groupFields = () => {
    const orderedFields: Array<FormFieldType | FormFieldType[]> = [];
    const dayGroups: Record<
      string,
      { checkbox: FormFieldType; start: FormFieldType; end: FormFieldType }
    > = {};
    let currentInlineGroup: FormFieldType[] = [];

    const flushInlineGroup = () => {
      if (currentInlineGroup.length > 0) {
        orderedFields.push([...currentInlineGroup]);
        currentInlineGroup = [];
      }
    };

    currentStepData.fields.forEach((field) => {
      if (field.name.startsWith("availability")) {
        flushInlineGroup(); // Flush any pending inline group before availability fields

        let dayName: string;
        let suffix: string | undefined;

        // Check if it ends with Start or End
        if (field.name.endsWith("Start")) {
          dayName = field.name
            .replace(/^availability/, "")
            .replace(/Start$/, "");
          suffix = "Start";
        } else if (field.name.endsWith("End")) {
          dayName = field.name.replace(/^availability/, "").replace(/End$/, "");
          suffix = "End";
        } else {
          // It's the checkbox field
          dayName = field.name.replace(/^availability/, "");
          suffix = undefined;
        }

        if (!dayGroups[dayName]) {
          dayGroups[dayName] = {} as any;
        }

        if (field.type === "checkbox") {
          dayGroups[dayName].checkbox = field;
        } else if (suffix === "Start") {
          dayGroups[dayName].start = field;
        } else if (suffix === "End") {
          dayGroups[dayName].end = field;
        }
      } else if (field.inline) {
        currentInlineGroup.push(field);
      } else {
        flushInlineGroup(); // Flush inline group before regular field
        orderedFields.push(field);
      }
    });

    flushInlineGroup(); // Flush any remaining inline group

    return { dayGroups, orderedFields };
  };

  const { dayGroups, orderedFields } = groupFields();

  const validateCurrentStep = async () => {
    const currentFields = currentStepData.fields.map((f) => f.name);
    const isValid = await form.trigger(currentFields as any);
    return isValid;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && !isLastStep) {
      const currentIndex = steps.indexOf(currentStep);
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1]);
      }
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      const currentIndex = steps.indexOf(currentStep);
      if (currentIndex > 0) {
        setCurrentStep(steps[currentIndex - 1]);
      }
    }
  };

  const onSubmit = async (data: FormValues) => {
    // Only allow submission on the last step
    if (!isLastStep) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const result = await createInstructorAction(data);

      if (result.success) {
        setSubmitSuccess(true);
        console.log("Instructor created successfully:", result.data);
        // Redirect to success page
        router.push("/onboard/success");
      } else {
        setSubmitError(
          result.error || "Failed to submit form. Please try again."
        );
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Driving Instructor Onboarding</CardTitle>
      </CardHeader>
      <CardContent>
        <FormStepper
          steps={steps}
          value={currentStep}
          onValueChange={(step) => {
            // Only allow navigation to previous steps
            if (step < currentStep) {
              setCurrentStep(step);
            }
          }}
        />
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            onKeyDown={(e) => {
              // Prevent Enter key from submitting the form
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
            className="space-y-6 mt-8"
            id="onboarding-form"
          >
            {/* Render fields in order */}
            {orderedFields.map((fieldOrGroup, index) => {
              // If it's an array, it's an inline group
              if (Array.isArray(fieldOrGroup)) {
                return (
                  <div key={`inline-group-${index}`} className="flex gap-4">
                    {fieldOrGroup.map((field) => (
                      <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name as any}
                        render={({ field: formField }) => (
                          <FormItem className="flex-1">
                            {field.type === "select" ? (
                              <>
                                <FormLabel>
                                  {field.label}
                                  {field.required && " *"}
                                </FormLabel>
                                <Select
                                  onValueChange={formField.onChange}
                                  value={formField.value as string}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue
                                        placeholder={field.placeholder}
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {field.options?.map((option) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </>
                            ) : (
                              <>
                                <FormLabel>
                                  {field.label}
                                  {field.required && " *"}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    {...formField}
                                    value={(formField.value as string) ?? ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </>
                            )}
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                );
              }

              // Otherwise it's a regular field
              const field = fieldOrGroup;
              return (
                <FormField
                  key={field.name}
                  control={form.control}
                  name={field.name as any}
                  render={({ field: formField }) => (
                    <FormItem>
                      {field.type === "checkbox" ? (
                        <>
                          <div className="flex items-center gap-3">
                            <FormControl>
                              <Checkbox
                                checked={formField.value as boolean}
                                onCheckedChange={formField.onChange}
                              />
                            </FormControl>
                            <FormLabel className="mt-0!">
                              {field.label}
                              {field.required && " *"}
                            </FormLabel>
                          </div>
                          <FormMessage />
                        </>
                      ) : field.type === "select" ? (
                        <>
                          <FormLabel>
                            {field.label}
                            {field.required && " *"}
                          </FormLabel>
                          <Select
                            onValueChange={formField.onChange}
                            value={formField.value as string}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={field.placeholder} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {field.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </>
                      ) : field.type === "textarea" ? (
                        <>
                          <FormLabel>
                            {field.label}
                            {field.required && " *"}
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={field.placeholder}
                              rows={3}
                              className="resize-none"
                              {...formField}
                              value={(formField.value as string) ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </>
                      ) : field.type === "usd" ? (
                        <>
                          <FormLabel>
                            {field.label}
                            {field.required && " *"}
                          </FormLabel>
                          <FormControl>
                            <div className="relative flex rounded-md shadow-xs">
                              <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm text-muted-foreground">
                                $
                              </span>
                              <Input
                                type="text"
                                placeholder={field.placeholder}
                                className="-me-px rounded-e-none ps-6 shadow-none"
                                {...formField}
                                value={(formField.value as string) ?? ""}
                                onChange={(e) => {
                                  const value = e.target.value.replace(
                                    /[^0-9.]/g,
                                    ""
                                  );
                                  formField.onChange(value);
                                }}
                              />
                              <span className="-z-10 inline-flex items-center rounded-e-md border border-input bg-background px-3 text-sm text-muted-foreground">
                                SGD
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </>
                      ) : (
                        <>
                          <FormLabel>
                            {field.label}
                            {field.required && " *"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type={field.type}
                              placeholder={field.placeholder}
                              {...formField}
                              value={(formField.value as string) ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </>
                      )}
                    </FormItem>
                  )}
                />
              );
            })}

            {/* Render availability day groups */}
            {Object.keys(dayGroups).length > 0 && (
              <div className="space-y-6">
                <fieldset className="space-y-4">
                  <legend className="text-sm leading-none font-medium text-foreground">
                    Availability
                  </legend>
                  <div className="flex gap-1.5">
                    {Object.entries(dayGroups)
                      .filter(
                        ([_, dayGroup]) =>
                          dayGroup.checkbox && dayGroup.start && dayGroup.end
                      )
                      .map(([dayName, dayGroup]) => {
                        const dayLabel = dayGroup.checkbox.label;
                        const dayInitial = dayLabel[0];
                        const isDaySelected =
                          formValues[dayGroup.checkbox.name] === true;

                        return (
                          <FormField
                            key={dayName}
                            control={form.control}
                            name={dayGroup.checkbox.name as any}
                            render={({ field: formField }) => (
                              <FormItem>
                                <FormControl>
                                  <label
                                    className={`relative flex size-9 cursor-pointer flex-col items-center justify-center gap-3 rounded-full border border-input text-center shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:border-ring has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50 has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50 ${
                                      formField.value
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : ""
                                    }`}
                                  >
                                    <Checkbox
                                      checked={formField.value as boolean}
                                      onCheckedChange={formField.onChange}
                                      className="sr-only after:absolute after:inset-0"
                                    />
                                    <span
                                      aria-hidden="true"
                                      className="text-sm font-medium"
                                    >
                                      {dayInitial}
                                    </span>
                                    <span className="sr-only">{dayLabel}</span>
                                  </label>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        );
                      })}
                  </div>
                </fieldset>

                {/* Show time inputs for selected days */}
                <div className="space-y-4">
                  {Object.entries(dayGroups)
                    .filter(
                      ([_, dayGroup]) =>
                        dayGroup.checkbox &&
                        dayGroup.start &&
                        dayGroup.end &&
                        formValues[dayGroup.checkbox.name] === true
                    )
                    .map(([dayName, dayGroup]) => (
                      <div key={dayName} className="flex gap-4 items-end">
                        <div className="w-24">
                          <FormLabel className="text-sm font-medium">
                            {dayGroup.checkbox.label}
                          </FormLabel>
                        </div>
                        <FormField
                          control={form.control}
                          name={dayGroup.start.name as any}
                          render={({ field: formField }) => (
                            <FormItem className="flex-1">
                              <FormLabel>
                                Start Time
                                {dayGroup.start.required && " *"}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="time"
                                  placeholder={dayGroup.start.placeholder}
                                  {...formField}
                                  value={(formField.value as string) ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={dayGroup.end.name as any}
                          render={({ field: formField }) => (
                            <FormItem className="flex-1">
                              <FormLabel>
                                End Time
                                {dayGroup.end.required && " *"}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="time"
                                  placeholder={dayGroup.end.placeholder}
                                  {...formField}
                                  value={(formField.value as string) ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Error and Success Messages */}
            {submitError && (
              <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
                {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className="rounded-md bg-green-500/15 p-4 text-sm text-green-700 dark:text-green-400">
                Instructor profile created successfully!
              </div>
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="flex justify-between w-full">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstStep || isSubmitting}
          >
            Previous
          </Button>
          {isLastStep ? (
            <Button
              type="button"
              onClick={() => {
                if (isLastStep) {
                  form.handleSubmit(onSubmit)();
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          ) : (
            <Button type="button" onClick={handleNext} disabled={isSubmitting}>
              Next
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
