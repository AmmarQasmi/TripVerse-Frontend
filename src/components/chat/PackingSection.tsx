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
      style={{ marginTop: '24px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden' }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ width: '100%', paddingLeft: '16px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.3s' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#0d2b3e', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <Shirt className="w-5 h-5" style={{ color: '#2dd4bf' }} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#0f2d44' }}>Packing Recommendations</p>
            <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              {checkedCount > 0
                ? `${checkedCount}/${totalItems} packed`
                : `${totalItems} items • Based on weather & activities`}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {checkedCount > 0 && (
            <div style={{ height: '6px', width: '96px', background: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
              <div
                style={{ height: '100%', background: '#2dd4bf', borderRadius: '9999px', transition: 'width 0.5s ease', width: `${(checkedCount / totalItems) * 100}%` }}
              />
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" style={{ color: '#94a3b8' }} />
          ) : (
            <ChevronDown className="w-5 h-5" style={{ color: '#94a3b8' }} />
          )}
        </div>
      </button>

      {isExpanded && (
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {categories.map((cat, catIdx) => {
              return (
                <div key={catIdx}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ width: '4px', height: '20px', borderRadius: '2px', background: '#2dd4bf' }} />
                    <h4 style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{cat.name}</h4>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {cat.items.map((item, itemIdx) => {
                      const idx = globalIdx++
                      const isChecked = checkedItems.has(idx)
                      return (
                        <button
                          key={itemIdx}
                          onClick={() => toggleItem(idx)}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', paddingLeft: '10px', paddingRight: '10px', paddingTop: '6px', paddingBottom: '6px', borderRadius: '8px', transition: 'all 0.2s', textAlign: 'left', background: isChecked ? '#10b981' : '#e2e8f0', color: isChecked ? 'white' : '#475569', border: 'none', cursor: 'pointer', textDecoration: isChecked ? 'line-through' : 'none' }}
                        >
                          <span style={{ width: '16px', height: '16px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isChecked ? 'rgba(255,255,255,0.3)' : 'transparent', flexShrink: 0 }}>
                            {isChecked && <Check className="w-3 h-3" style={{ color: 'white' }} />}
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
