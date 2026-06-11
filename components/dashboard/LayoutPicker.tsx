'use client'

import { useState, type ReactNode } from 'react'

export type WallLayout = 'grid' | 'list' | 'carousel'

const GridIcon = (
  <span className="grid grid-cols-2 gap-[2px] w-4 h-4 shrink-0">
    <span className="rounded-[1px] bg-current" />
    <span className="rounded-[1px] bg-current" />
    <span className="rounded-[1px] bg-current" />
    <span className="rounded-[1px] bg-current" />
  </span>
)

const ListIcon = (
  <span className="flex flex-col justify-center gap-[3px] w-4 h-4 shrink-0">
    <span className="h-[2px] w-full rounded-full bg-current" />
    <span className="h-[2px] w-full rounded-full bg-current" />
    <span className="h-[2px] w-full rounded-full bg-current" />
  </span>
)

const CarouselIcon = (
  <span className="flex items-center justify-center gap-[2px] w-4 h-4 shrink-0">
    <span className="h-2.5 w-[3px] rounded-full bg-current opacity-40" />
    <span className="h-3.5 w-[5px] rounded-[2px] bg-current" />
    <span className="h-2.5 w-[3px] rounded-full bg-current opacity-40" />
  </span>
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
              title={opt.hint}
              onClick={() => select(opt.value)}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-brand/40 ${
                active
                  ? 'bg-accent-soft'
                  : 'bg-grey10 text-muted hover:bg-tertiary-soft'
              }`}
            >
              <span className={`inline-flex items-center shrink-0 ${active ? 'text-brand' : 'text-muted'}`}>{opt.icon}</span>
              <span className={`text-sm font-medium ${active ? 'text-brand' : 'text-ink'}`}>
                {opt.label}
              </span>
            </button>
          )
        })}
      </div>
    </>
  )
}
