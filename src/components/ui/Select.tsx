import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{ value: string | number; label: string }>
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-gray-900 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
        <select
          className={cn(
            "flex h-10 w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-250 ease-in-out border-0",
            "focus-visible:ring-2 focus-visible:ring-teal-400/30 focus-visible:shadow-lg",
            className,
            error && "focus-visible:ring-red-400/30"
          )}
          style={{
            background: `linear-gradient(white, white) padding-box, linear-gradient(to right, #0d9488, #0891b2) border-box`,
            border: '2px solid transparent',
            borderRadius: '0.375rem'
          }}
          ref={ref}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }

