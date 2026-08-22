"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { addDays, addMonths, addWeeks, format, startOfDay, startOfMonth } from "date-fns"
import type { DateRange } from "react-day-picker"
import { Calendar as CalendarIcon, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useIsMobile } from "@/hooks/use-mobile"

export interface DateRangeValue {
  checkIn: string
  checkOut: string
}

interface Preset {
  label: string
  getRange: (today: Date) => DateRange
}

const PRESETS: Preset[] = [
  {
    label: "Weekend Stay",
    getRange: (today) => {
      const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7
      const from = addDays(today, daysUntilFriday)
      return { from, to: addDays(from, 2) }
    },
  },
  {
    label: "1 Week",
    getRange: (today) => ({ from: today, to: addWeeks(today, 1) }),
  },
  {
    label: "2 Weeks",
    getRange: (today) => ({ from: today, to: addWeeks(today, 2) }),
  },
]

const INITIAL_MONTHS = 6
const MONTHS_PER_LOAD = 3
const MAX_MONTHS = 24

function toDateOnly(value: string): Date | undefined {
  if (!value) return undefined
  const [y, m, d] = value.split("-").map(Number)
  if (!y || !m || !d) return undefined
  return new Date(y, m - 1, d)
}

function toIsoDate(date: Date | undefined): string {
  return date ? format(date, "yyyy-MM-dd") : ""
}

function formatDisplay(date: Date | undefined): string {
  return date ? format(date, "EEE, d MMM") : ""
}

interface DateRangePickerProps {
  id?: string
  checkIn: string
  checkOut: string
  onChange: (value: DateRangeValue) => void
  className?: string
}

export function DateRangePicker({ id, checkIn, checkOut, onChange, className }: DateRangePickerProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)
  const today = React.useMemo(() => startOfDay(new Date()), [])

  const committed = React.useMemo<DateRange | undefined>(() => {
    const from = toDateOnly(checkIn)
    const to = toDateOnly(checkOut)
    if (!from && !to) return undefined
    return { from, to }
  }, [checkIn, checkOut])

  const [draft, setDraft] = React.useState<DateRange | undefined>(committed)

  React.useEffect(() => {
    if (open) setDraft(committed)
  }, [open, committed])

  const handleClear = () => {
    setDraft(undefined)
    onChange({ checkIn: "", checkOut: "" })
    setOpen(false)
  }

  const handleApply = () => {
    onChange({ checkIn: toIsoDate(draft?.from), checkOut: toIsoDate(draft?.to) })
    setOpen(false)
  }

  const triggerLabel = committed?.from
    ? committed?.to
      ? `${formatDisplay(committed.from)} – ${formatDisplay(committed.to)}`
      : `${formatDisplay(committed.from)} – Select check-out`
    : "Select dates"

  const trigger = (
    <button
      type="button"
      id={id}
      onClick={() => setOpen(true)}
      className={cn(
        "flex h-10 w-full items-center gap-2 rounded-md border-2 border-border bg-background px-3 text-left text-sm transition-colors focus:border-accent focus:outline-none",
        !committed?.from && "text-muted-foreground",
        className,
      )}
    >
      <CalendarIcon className="h-4 w-4 shrink-0 text-accent" />
      <span className="truncate">{triggerLabel}</span>
    </button>
  )

  if (isMobile) {
    return (
      <>
        {trigger}
        {open &&
          createPortal(
            <MobileDateRangeOverlay
              today={today}
              draft={draft}
              onDraftChange={setDraft}
              onClear={handleClear}
              onApply={handleApply}
              onClose={() => setOpen(false)}
            />,
            document.body,
          )}
      </>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <div className="flex">
          <div className="flex w-40 shrink-0 flex-col gap-1 border-r border-border p-3">
            <p className="mb-1 px-2 text-xs font-semibold uppercase text-muted-foreground">Quick presets</p>
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setDraft(preset.getRange(today))}
                className="rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-accent/10 hover:text-accent"
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="p-3">
            <Calendar
              mode="range"
              numberOfMonths={2}
              selected={draft}
              onSelect={setDraft}
              disabled={{ before: today }}
              defaultMonth={committed?.from ?? today}
            />
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-border pt-3">
              <button
                type="button"
                onClick={handleClear}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Clear
              </button>
              <Button
                type="button"
                onClick={handleApply}
                disabled={!draft?.from || !draft?.to}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Apply Dates
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface MobileDateRangeOverlayProps {
  today: Date
  draft: DateRange | undefined
  onDraftChange: (range: DateRange | undefined) => void
  onClear: () => void
  onApply: () => void
  onClose: () => void
}

function MobileDateRangeOverlay({
  today,
  draft,
  onDraftChange,
  onClear,
  onApply,
  onClose,
}: MobileDateRangeOverlayProps) {
  const [monthCount, setMonthCount] = React.useState(INITIAL_MONTHS)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const sentinelRef = React.useRef<HTMLDivElement>(null)

  const months = React.useMemo(() => {
    const start = startOfMonth(today)
    return Array.from({ length: monthCount }, (_, i) => addMonths(start, i))
  }, [today, monthCount])

  React.useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  React.useEffect(() => {
    const sentinel = sentinelRef.current
    const root = scrollRef.current
    if (!sentinel || !root) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setMonthCount((count) => Math.min(count + MONTHS_PER_LOAD, MAX_MONTHS))
        }
      },
      { root, rootMargin: "400px" },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border p-2">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-12 w-12 items-center justify-center rounded-full transition-colors hover:bg-muted"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="font-semibold text-foreground">Select dates</h2>
        <div className="w-12" />
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-border p-3">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onDraftChange(preset.getRange(today))}
            className="flex h-12 shrink-0 items-center whitespace-nowrap rounded-full border-2 border-border px-4 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 pb-4">
        {months.map((month) => (
          <Calendar
            key={month.toISOString()}
            mode="range"
            numberOfMonths={1}
            month={month}
            hideNavigation
            selected={draft}
            onSelect={onDraftChange}
            disabled={{ before: today }}
            className="mx-auto [--cell-size:3rem]"
          />
        ))}
        <div ref={sentinelRef} className="h-4" />
      </div>

      <div className="sticky bottom-0 flex gap-3 border-t border-border bg-background p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <Button type="button" variant="outline" onClick={onClear} className="h-12 flex-1 text-base">
          Clear
        </Button>
        <Button
          type="button"
          onClick={onApply}
          disabled={!draft?.from || !draft?.to}
          className="h-12 flex-1 bg-accent text-base text-accent-foreground hover:bg-accent/90"
        >
          Apply Dates
        </Button>
      </div>
    </div>
  )
}
