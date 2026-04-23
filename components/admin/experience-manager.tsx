"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, Briefcase, Calendar, Loader2, MapPin, Pencil, Plus, Save, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ExperienceItem {
  id: string
  company: string
  role: string
  description: string | null
  start_date: string
  end_date: string | null
  is_current: boolean
  location: string | null
  created_at: string
}

interface ExperienceManagerProps {
  initialExperience: ExperienceItem[]
}

const emptyForm = {
  company: "",
  role: "",
  description: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  location: "",
}

export function ExperienceManager({ initialExperience }: ExperienceManagerProps) {
  const [experience, setExperience] = useState(initialExperience)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [company, setCompany] = useState(emptyForm.company)
  const [role, setRole] = useState(emptyForm.role)
  const [description, setDescription] = useState(emptyForm.description)
  const [startDate, setStartDate] = useState(emptyForm.startDate)
  const [endDate, setEndDate] = useState(emptyForm.endDate)
  const [isCurrent, setIsCurrent] = useState(emptyForm.isCurrent)
  const [location, setLocation] = useState(emptyForm.location)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const resetForm = () => {
    setEditingId(null)
    setCompany(emptyForm.company)
    setRole(emptyForm.role)
    setDescription(emptyForm.description)
    setStartDate(emptyForm.startDate)
    setEndDate(emptyForm.endDate)
    setIsCurrent(emptyForm.isCurrent)
    setLocation(emptyForm.location)
  }

  const handleEdit = (item: ExperienceItem) => {
    setEditingId(item.id)
    setCompany(item.company)
    setRole(item.role)
    setDescription(item.description ?? "")
    setStartDate(item.start_date)
    setEndDate(item.end_date ?? "")
    setIsCurrent(item.is_current)
    setLocation(item.location ?? "")
    setError(null)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const record = {
      company,
      role,
      description: description || null,
      start_date: startDate,
      end_date: isCurrent ? null : endDate || null,
      is_current: isCurrent,
      location: location || null,
    }

    try {
      if (editingId) {
        const { data, error: updateError } = await supabase
          .from("work_experience")
          .update(record)
          .eq("id", editingId)
          .select("*")
          .single()

        if (updateError) throw updateError

        setExperience((prev) =>
          prev
            .map((item) => (item.id === editingId ? data : item))
            .sort((a, b) => b.start_date.localeCompare(a.start_date)),
        )
      } else {
        const { data, error: insertError } = await supabase
          .from("work_experience")
          .insert(record)
          .select("*")
          .single()

        if (insertError) throw insertError

        setExperience((prev) =>
          [data, ...prev].sort((a, b) => b.start_date.localeCompare(a.start_date)),
        )
      }

      resetForm()
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save experience")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (item: ExperienceItem) => {
    if (!confirm(`Delete "${item.company}"?`)) return

    setLoading(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from("work_experience")
        .delete()
        .eq("id", item.id)

      if (deleteError) throw deleteError

      setExperience((prev) => prev.filter((e) => e.id !== item.id))
      if (editingId === item.id) resetForm()
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete experience")
    } finally {
      setLoading(false)
    }
  }

  const formatMonth = (value: string | null) => {
    if (!value) return "Present"
    return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short" })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-mono text-sm">Back</span>
          </Link>

          <button
            type="submit"
            form="experience-form"
            disabled={loading || !company || !role || !startDate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-mono hover:neon-glow transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : editingId ? (
              <Save className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {editingId ? "Save Experience" : "Add Experience"}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-2">Work Experience</h1>
            <p className="text-sm text-muted-foreground font-mono">
              Manage the experience timeline on your portfolio.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive font-mono text-sm">
              Error: {error}
            </div>
          )}

          <div className="space-y-4">
            {experience.length > 0 ? (
              experience.map((item) => (
                <article key={item.id} className="bg-card border border-border rounded-lg p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">{item.company}</h2>
                      </div>
                      <p className="text-sm text-primary font-mono mb-2">{item.role}</p>
                      {item.location && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground font-mono mb-2">
                          <MapPin className="h-3.5 w-3.5" />
                          {item.location}
                        </p>
                      )}
                      <p className="flex items-center gap-2 text-sm text-muted-foreground font-mono mb-3">
                        <Calendar className="h-4 w-4" />
                        {formatMonth(item.start_date)} —{" "}
                        {item.is_current ? "Present" : formatMonth(item.end_date)}
                      </p>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground font-mono text-sm">
                No experience entries yet.
              </div>
            )}
          </div>
        </section>

        <section>
          <form
            id="experience-form"
            onSubmit={handleSubmit}
            className="bg-card border border-border rounded-lg p-6 space-y-5 sticky top-24"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">{editingId ? "Edit Experience" : "New Experience"}</h2>
                <p className="text-sm text-muted-foreground font-mono">Add jobs, internships, or freelance work.</p>
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-mono hover:bg-secondary/80 transition-all"
                >
                  Cancel
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-mono text-muted-foreground mb-2">company</label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-mono text-muted-foreground mb-2">role / title</label>
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-mono text-muted-foreground mb-2">location (optional)</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="City, Country or Remote"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-mono text-muted-foreground mb-2">start_date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-mono text-muted-foreground mb-2">end_date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isCurrent}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-40"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isCurrent}
                onChange={(e) => {
                  setIsCurrent(e.target.checked)
                  if (e.target.checked) setEndDate("")
                }}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm font-mono text-muted-foreground">I currently work here</span>
            </label>

            <div>
              <label className="block text-sm font-mono text-muted-foreground mb-2">description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-y"
              />
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}
