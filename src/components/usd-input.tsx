import { useId } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Component() {
  const id = useId();
  return (
    <div className="*:not-first:mt-2">
      <Label htmlFor={id}>Input with inline start and end add-on</Label>
      <div className="relative flex rounded-md shadow-xs">
        <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm text-muted-foreground">
          $
        </span>
        <Input
          id={id}
          className="-me-px rounded-e-none ps-6 shadow-none"
          placeholder="0.00"
          type="text"
        />
        <span className="-z-10 inline-flex items-center rounded-e-md border border-input bg-background px-3 text-sm text-muted-foreground">
          SGD
        </span>
      </div>
    </div>
  );
}
