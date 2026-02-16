'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shirt, ChevronDown, ChevronUp, Check } from 'lucide-react'

interface PackingSectionProps {
  data: any
}

export function PackingSection({ data }: PackingSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())

  if (!data) return null

  // Normalize data to categories
  let categories: { name: string; items: string[] }[] = []

  if (Array.isArray(data)) {
    categories = [{ name: 'Essentials', items: data }]
  } else if (typeof data === 'object') {
    categories = Object.entries(data)
      .filter(([, items]) => Array.isArray(items) && items.length > 0)
      .map(([name, items]) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        items: items as string[],
      }))
  }

  if (categories.length === 0) return null

  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0)
  const checkedCount = checkedItems.size

  const toggleItem = (globalIdx: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev)
      if (next.has(globalIdx)) next.delete(globalIdx)
      else next.add(globalIdx)
      return next
    })
  }

  // Category icons/colors
  const categoryColors = [
    'from-teal-400 to-emerald-500',
    'from-violet-400 to-purple-500',
    'from-amber-400 to-orange-500',
    'from-sky-400 to-blue-500',
    'from-rose-400 to-pink-500',
    'from-lime-400 to-green-500',
  ]

  let globalIdx = 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-gray-100 flex items-center justify-between hover:from-teal-50/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-sm">
            <Shirt className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-base font-bold text-gray-900">Packing Recommendations</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {checkedCount > 0
                ? `${checkedCount}/${totalItems} packed`
                : `${totalItems} items • Based on weather & activities`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {checkedCount > 0 && (
            <div className="h-1.5 w-20 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${(checkedCount / totalItems) * 100}%` }}
              />
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {categories.map((cat, catIdx) => {
              const colorClass = categoryColors[catIdx % categoryColors.length]
              return (
                <div key={catIdx}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className={`w-1.5 h-5 rounded-full bg-gradient-to-b ${colorClass}`} />
                    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">{cat.name}</h4>
                  </div>
                  <div className="space-y-1">
                    {cat.items.map((item, itemIdx) => {
                      const idx = globalIdx++
                      const isChecked = checkedItems.has(idx)
                      return (
                        <button
                          key={itemIdx}
                          onClick={() => toggleItem(idx)}
                          className={`w-full flex items-center gap-2.5 text-sm py-1.5 px-2 rounded-lg transition-all text-left ${
                            isChecked
                              ? 'text-gray-400 line-through bg-gray-50'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${
                            isChecked
                              ? 'bg-teal-500 border-teal-500'
                              : 'border-gray-300'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 text-white" />}
                          </span>
                          {item}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </motion.div>
  )
}
