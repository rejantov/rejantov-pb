"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const ACCENTS = [
  { key: "purple", label: "Purple",  style: "bg-purple-500 border-purple-400" },
  { key: "blue",   label: "Blue",    style: "bg-blue-500 border-blue-400" },
  { key: "green",  label: "Green",   style: "bg-emerald-500 border-emerald-400" },
  { key: "pink",   label: "Pink",    style: "bg-pink-500 border-pink-400" },
  { key: "red",    label: "Red",     style: "bg-red-500 border-red-400" },
  { key: "yellow", label: "Yellow",  style: "bg-yellow-500 border-yellow-400" },
  {
    key: "rainbow",
    label: "Rainbow",
    style: "border-transparent",
    gradient: "linear-gradient(135deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6, #ec4899)",
  },
] as const

type AccentKey = typeof ACCENTS[number]["key"]

interface AccentPickerProps {
  initialAccent: string
}

export function AccentPicker({ initialAccent }: AccentPickerProps) {
  const [current, setCurrent] = useState<string>(initialAccent)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSelect = async (key: AccentKey) => {
    if (key === current || saving) return
    setSaving(true)
    setError(null)
    setSaved(false)

    // Apply immediately so the user sees the change right away
    document.documentElement.dataset.accent = key

    try {
      const { error: upsertError } = await supabase
        .from("site_stats")
        .upsert({ key: "site_accent", text_value: key }, { onConflict: "key" })

      if (upsertError) throw upsertError

      setCurrent(key)
      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
      // Revert visual change
      document.documentElement.dataset.accent = current
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Accent Colour</h2>
        <p className="text-sm text-muted-foreground font-mono">
          Changes the primary colour across the portfolio and admin — visitors see it too.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive font-mono text-sm">
          {error}
        </div>
      )}

      {saved && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 font-mono text-sm flex items-center gap-2">
          <Check className="h-4 w-4" />
          Saved — visitors will see the new colour
        </div>
      )}

      <div className="grid grid-cols-4 sm:grid-cols-7 gap-4">
        {ACCENTS.map((accent) => {
          const isActive = current === accent.key
          return (
            <button
              key={accent.key}
              type="button"
              disabled={saving}
              onClick={() => handleSelect(accent.key)}
              className="group flex flex-col items-center gap-2 disabled:opacity-50"
              title={accent.label}
            >
              <div
                className={`relative w-12 h-12 rounded-full border-2 transition-all ${accent.style} ${
                  isActive ? "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110" : "hover:scale-105"
                }`}
                style={"gradient" in accent ? { background: accent.gradient } : undefined}
              >
                {isActive && !saving && (
                  <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow" />
                )}
                {saving && current !== accent.key && (
                  <Loader2 className="absolute inset-0 m-auto h-4 w-4 text-white animate-spin opacity-0" />
                )}
                {saving && current === accent.key && (
                  <Loader2 className="absolute inset-0 m-auto h-4 w-4 text-white animate-spin" />
                )}
              </div>
              <span className="text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                {accent.label}
              </span>
            </button>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground font-mono">
        Currently: <span className="text-primary">{current}</span>
      </p>
    </div>
  )
}
