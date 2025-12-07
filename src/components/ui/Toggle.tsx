import * as React from "react"
import { cn } from "@/lib/utils"

export interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  className?: string
}

export function Toggle({ 
  checked, 
  onChange, 
  label, 
  description, 
  disabled = false,
  className 
}: ToggleProps) {
  return (
    <div className={cn("flex items-start space-x-3", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-75 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2",
          checked ? "bg-cyan-600" : "bg-gray-200",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-75 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <label className="text-sm font-medium text-gray-900 cursor-pointer" onClick={() => !disabled && onChange(!checked)}>
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
      )}
    </div>
  )
}

