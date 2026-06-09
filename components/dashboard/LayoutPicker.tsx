'use client'

import { useState, type ReactNode } from 'react'

export type WallLayout = 'grid' | 'list' | 'carousel'

const GridIcon = (
  <div className="grid grid-cols-2 gap-1 w-7 h-7">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="rounded-[3px] bg-current" />
    ))}
  </div>
)

const ListIcon = (
  <div className="flex flex-col gap-1.5 w-7 h-7 justify-center">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="h-1.5 rounded-[3px] bg-current" />
    ))}
  </div>
)

const CarouselIcon = (
  <div className="flex items-center gap-1 w-7 h-7 justify-center">
    <div className="h-4 w-1 rounded-[2px] bg-current opacity-40" />
    <div className="h-6 w-3.5 rounded-[3px] bg-current" />
    <div className="h-4 w-1 rounded-[2px] bg-current opacity-40" />
  </div>
)

const OPTIONS: { value: WallLayout; label: string; hint: string; icon: ReactNode }[] = [
  { value: 'grid', label: 'Grid', hint: 'Cards in columns', icon: GridIcon },
  { value: 'list', label: 'List', hint: 'Stacked rows', icon: ListIcon },
  { value: 'carousel', label: 'Carousel', hint: 'Swipeable row', icon: CarouselIcon },
]

/**
 * Three-box single-select for wall layout.
 *
 * - Pass `name` to render a hidden input so the value submits with a native form.
 * - Pass `value` + `onChange` to drive it as a controlled component.
 */
export function LayoutPicker({
  name,
  value,
  defaultValue = 'grid',
  onChange,
}: {
  name?: string
  value?: WallLayout
  defaultValue?: WallLayout
  onChange?: (value: WallLayout) => void
}) {
  const [internal, setInternal] = useState<WallLayout>(value ?? defaultValue)
  const selected = value ?? internal

  function select(next: WallLayout) {
    if (value === undefined) setInternal(next)
    onChange?.(next)
  }

  return (
    <>
      {name && <input type="hidden" name={name} value={selected} />}
      <div role="radiogroup" aria-label="Layout" className="grid grid-cols-3 gap-3">
        {OPTIONS.map(opt => {
          const active = selected === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => select(opt.value)}
              className={`flex flex-col items-center gap-2 rounded-lg px-3 py-4 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-brand/40 ${
                active
                  ? 'bg-accent-soft'
                  : 'bg-grey10 text-muted hover:bg-tertiary-soft'
              }`}
            >
              <span className={active ? 'text-brand' : 'text-muted'}>{opt.icon}</span>
              <span className={`text-sm font-medium ${active ? 'text-brand' : 'text-ink'}`}>
                {opt.label}
              </span>
              <span className="text-[11px] leading-tight text-muted">{opt.hint}</span>
            </button>
          )
        })}
      </div>
    </>
  )
}
