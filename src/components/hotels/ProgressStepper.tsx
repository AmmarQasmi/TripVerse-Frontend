'use client'

import { motion } from 'framer-motion'

interface Step {
  label: string
  description?: string
}

interface ProgressStepperProps {
  steps: Step[]
  currentStep: number
}

export function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  return (
    <div className="w-full px-2">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isUpcoming = index > currentStep

          return (
            <div key={index} className="flex items-center flex-1 last:flex-none">
              {/* Step circle + label */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                    backgroundColor: isCompleted
                      ? '#0d9488'
                      : isCurrent
                      ? '#1e3a8a'
                      : '#374151',
                    borderColor: isCompleted
                      ? '#0d9488'
                      : isCurrent
                      ? '#38bdf8'
                      : '#4b5563',
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold text-white shadow-lg"
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </motion.div>
                <span
                  className={`mt-2 text-xs font-medium text-center whitespace-nowrap ${
                    isCurrent
                      ? 'text-cyan-400'
                      : isCompleted
                      ? 'text-teal-400'
                      : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-3 mt-[-20px]">
                  <div className="h-0.5 w-full bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={false}
                      animate={{
                        width: isCompleted ? '100%' : '0%',
                      }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                      className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full"
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
