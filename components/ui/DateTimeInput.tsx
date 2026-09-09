import * as React from "react";
import { cn } from "@/lib/utils";

export interface DateTimeInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

const DateTimeInput = React.forwardRef<HTMLInputElement, DateTimeInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <input
          type="datetime-local"
          ref={ref}
          className={cn(
            "relative flex h-10 w-full rounded-md border border-input bg-secondary/80 py-2 pl-3 pr-12 text-sm text-foreground",
            "ring-offset-background placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "scheme-dark",
            "[&::-webkit-calendar-picker-indicator]:absolute",
            "[&::-webkit-calendar-picker-indicator]:right-2",
            "[&::-webkit-calendar-picker-indicator]:top-1/2",
            "[&::-webkit-calendar-picker-indicator]:-translate-y-1/2",
            "[&::-webkit-calendar-picker-indicator]:m-0",
            "[&::-webkit-calendar-picker-indicator]:h-6",
            "[&::-webkit-calendar-picker-indicator]:w-6",
            "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
            "[&::-webkit-calendar-picker-indicator]:opacity-100",
            "[&::-webkit-calendar-picker-indicator]:brightness-0",
            "[&::-webkit-calendar-picker-indicator]:invert",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
DateTimeInput.displayName = "DateTimeInput";

export { DateTimeInput };
