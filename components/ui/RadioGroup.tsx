"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => {
    const contextValue = React.useMemo(() => ({ value, onValueChange }), [value, onValueChange]);

    return (
      <RadioGroupContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn("grid gap-2", className)}
          role="radiogroup"
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

const RadioGroupContext = React.createContext<{ value?: string; onValueChange?: (value: string) => void }>({});

export interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  checked?: boolean;
  onValueChange?: (value: string) => void;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, checked, onValueChange, id, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext);
    const isChecked = checked !== undefined ? checked : context.value === value;
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
        if (onValueChange) {
          onValueChange(value);
        } else if (context.onValueChange) {
          context.onValueChange(value);
        }
      }
    };

    return (
      <input
        type="radio"
        ref={ref}
        id={id}
        value={value}
        checked={isChecked}
        onChange={handleChange}
        className={cn(
          "h-4 w-4 border border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };

