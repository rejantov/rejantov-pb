"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, Calendar, GraduationCap, Loader2, Pencil, Plus, Save, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface EducationItem {
  id: string
  institution: string
  degree: string
  field: string
  start_date: string
  end_date: string | null
  description: string | null
  created_at: string
}

interface EducationManagerProps {
  initialEducation: EducationItem[]
}

const emptyForm = {
  institution: "",
  degree: "",
  field: "",
  startDate: "",
  endDate: "",
  description: "",
}

export function EducationManager({ initialEducation }: EducationManagerProps) {
  const [education, setEducation] = useState(initialEducation)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [institution, setInstitution] = useState(emptyForm.institution)
  const [degree, setDegree] = useState(emptyForm.degree)
  const [field, setField] = useState(emptyForm.field)
  const [startDate, setStartDate] = useState(emptyForm.startDate)
  const [endDate, setEndDate] = useState(emptyForm.endDate)
  const [description, setDescription] = useState(emptyForm.description)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const resetForm = () => {
    setEditingId(null)
    setInstitution(emptyForm.institution)
    setDegree(emptyForm.degree)
    setField(emptyForm.field)
    setStartDate(emptyForm.startDate)
    setEndDate(emptyForm.endDate)
    setDescription(emptyForm.description)
  }

  const handleEdit = (item: EducationItem) => {
    setEditingId(item.id)
    setInstitution(item.institution)
    setDegree(item.degree)
    setField(item.field)
    setStartDate(item.start_date)
    setEndDate(item.end_date ?? "")
    setDescription(item.description ?? "")
    setError(null)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const educationData = {
      institution,
      degree,
      field,
      start_date: startDate,
      end_date: endDate || null,
      description: description || null,
    }

    try {
      if (editingId) {
        const { data, error: updateError } = await supabase
          .from("education")
          .update(educationData)
          .eq("id", editingId)
          .select("*")
          .single()

        if (updateError) throw updateError

        setEducation((current) =>
          current
            .map((item) => (item.id === editingId ? data : item))
            .sort((a, b) => b.start_date.localeCompare(a.start_date)),
        )
      } else {
        const { data, error: insertError } = await supabase
          .from("education")
          .insert(educationData)
          .select("*")
          .single()

        if (insertError) throw insertError

        setEducation((current) => [data, ...current].sort((a, b) => b.start_date.localeCompare(a.start_date)))
      }

      resetForm()
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save education")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (item: EducationItem) => {
    if (!confirm(`Delete "${item.institution}"?`)) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from("education")
        .delete()
        .eq("id", item.id)

      if (deleteError) throw deleteError

      setEducation((current) => current.filter((entry) => entry.id !== item.id))

      if (editingId === item.id) {
        resetForm()
      }

      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete education")
    } finally {
      setLoading(false)
    }
  }

  const formatMonth = (value: string | null) => {
    if (!value) return "Present"

    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    })
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
            form="education-form"
            disabled={loading || !institution || !degree || !field || !startDate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-mono hover:neon-glow transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingId ? "Save Education" : "Add Education"}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-2">Education</h1>
            <p className="text-sm text-muted-foreground font-mono">
              Manage the timeline displayed on your portfolio.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive font-mono text-sm">
              Error: {error}
            </div>
          )}

          <div className="space-y-4">
            {education.length > 0 ? (
              education.map((item) => (
                <article key={item.id} className="bg-card border border-border rounded-lg p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">{item.institution}</h2>
                      </div>
                      <p className="text-sm text-primary font-mono mb-2">
                        {item.degree} in {item.field}
                      </p>
                      <p className="flex items-center gap-2 text-sm text-muted-foreground font-mono mb-3">
                        <Calendar className="h-4 w-4" />
                        {formatMonth(item.start_date)} - {formatMonth(item.end_date)}
                      </p>
                      {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button type="button" onClick={() => handleEdit(item)} className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => handleDelete(item)} className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground font-mono text-sm">
                No education entries yet.
              </div>
            )}
          </div>
        </section>

        <section>
          <form id="education-form" onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-5 sticky top-24">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">{editingId ? "Edit Education" : "New Education"}</h2>
                <p className="text-sm text-muted-foreground font-mono">Add schools, bootcamps, or certificates.</p>
              </div>
              {editingId && (
                <button type="button" onClick={resetForm} className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-mono hover:bg-secondary/80 transition-all">
                  Cancel
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-mono text-muted-foreground mb-2">institution</label>
              <input value={institution} onChange={(event) => setInstitution(event.target.value)} className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-mono text-muted-foreground mb-2">degree</label>
                <input value={degree} onChange={(event) => setDegree(event.target.value)} className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-mono text-muted-foreground mb-2">field</label>
                <input value={field} onChange={(event) => setField(event.target.value)} className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-mono text-muted-foreground mb-2">start_date</label>
                <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-mono text-muted-foreground mb-2">end_date</label>
                <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-mono text-muted-foreground mb-2">description</label>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={5} className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-y" />
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}
