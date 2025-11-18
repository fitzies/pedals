import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTrigger,
} from "@/components/ui/stepper";

export default function FormStepper({
  steps,
  value,
  onValueChange,
}: {
  steps: number[];
  value: number;
  onValueChange?: (value: number) => void;
}) {
  return (
    <div className="mx-auto max-w-xl space-y-8 text-center">
      <Stepper value={value} onValueChange={onValueChange}>
        {steps.map((step, index) => (
          <StepperItem key={step} step={step} className="not-last:flex-1">
            <StepperTrigger>
              <StepperIndicator />
            </StepperTrigger>
            {index < steps.length - 1 && <StepperSeparator />}
          </StepperItem>
        ))}
      </Stepper>
    </div>
  );
}
