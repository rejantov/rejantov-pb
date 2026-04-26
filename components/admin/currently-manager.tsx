"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, Save, Loader2, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface CurrentlyData {
  playing: string
  reading: string
  listening: string
  mood: string
}

const FIELDS: { key: keyof CurrentlyData; label: string; placeholder: string }[] = [
  { key: "playing",   label: "playing",   placeholder: "e.g. League of Legends" },
  { key: "reading",   label: "reading",   placeholder: "e.g. Dune" },
  { key: "listening", label: "listening", placeholder: "e.g. Lo-fi" },
  { key: "mood",      label: "mood",      placeholder: "e.g. vibing" },
]

export function CurrentlyManager({ initial }: { initial: CurrentlyData }) {
  const [data, setData] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    setSaved(false)

    const entries = [
      { key: "currently_playing",   text_value: data.playing },
      { key: "currently_reading",   text_value: data.reading },
      { key: "currently_listening", text_value: data.listening },
      { key: "currently_mood",      text_value: data.mood },
    ]

    try {
      for (const entry of entries) {
        const { error: upsertError } = await supabase
          .from("site_stats")
          .upsert(entry, { onConflict: "key" })
        if (upsertError) throw upsertError
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-mono text-sm">Back</span>
          </Link>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-mono hover:neon-glow transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <Check className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saved ? "Saved!" : "Save"}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-1">Currently</h1>
          <p className="text-sm text-muted-foreground font-mono">
            What you&apos;re up to right now — shown in the blog sidebar.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive font-mono text-sm mb-6">
            Error: {error}
          </div>
        )}

        <div className="bg-card border border-border rounded-lg p-6 space-y-5">
          {FIELDS.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-mono text-muted-foreground mb-2">{label}</label>
              <input
                value={data[key]}
                onChange={(e) => setData((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground font-mono placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
