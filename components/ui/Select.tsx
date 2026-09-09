"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  placeholder?: string;
  options?: SelectOption[];
}

const selectClassName = cn(
  "flex h-10 w-full appearance-none rounded-md border border-input bg-secondary/80 px-3 py-2 pr-10 text-sm text-foreground",
  "ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "[color-scheme:dark]",
  "scheme-dark",
  "[&>option]:bg-[#1a1a1a] [&>option]:text-foreground",
);

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, placeholder, options, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(selectClassName, className)}
          ref={ref}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options
            ? options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))
            : children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-muted-foreground" />
      </div>
    );
  },
);
Select.displayName = "Select";

// Compatibility components for shadcn-style API
const SelectTrigger = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => {
    return <Select ref={ref} className={className} {...props} />;
  }
);
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <>{children}</>;
};

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  return null;
};

const SelectItem = React.forwardRef<
  HTMLOptionElement,
  React.OptionHTMLAttributes<HTMLOptionElement> & { value: string }
>(({ className, children, ...props }, ref) => {
  return (
    <option ref={ref} className={className} {...props}>
      {children}
    </option>
  );
});
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectContent, SelectValue, SelectItem };

