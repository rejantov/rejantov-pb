"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, Download, Eye, FileText, Loader2, Trash2, Upload } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getSupabaseErrorMessage } from "@/lib/supabase/error"

interface Resume {
  id: string
  filename: string
  url: string
  is_active: boolean
  uploaded_at: string
}

interface Profile {
  id: string
  name: string
  title: string
}

interface ResumeManagerProps {
  profile: Profile | null
  initialResumes: Resume[]
}

export function ResumeManager({ profile, initialResumes }: ResumeManagerProps) {
  const [uploading, setUploading] = useState(false)
  const [resumes, setResumes] = useState<Resume[]>(initialResumes)
  const [actionId, setActionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()
  const supabase = createClient()

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !profile) return

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.")
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload/resume", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "Resume upload failed")
      }

      router.refresh()
      setResumes((prev) => {
        const updated = prev.map((r) =>
          data.resume.is_active ? { ...r, is_active: false } : r,
        )
        return [data.resume, ...updated]
      })
    } catch (uploadError: unknown) {
      setError(getSupabaseErrorMessage(uploadError, "Failed to upload resume"))
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const setActive = async (id: string) => {
    setActionId(id)
    setError(null)
    try {
      // Deactivate all, then activate the chosen one
      const { error: deactivateError } = await supabase
        .from("resumes")
        .update({ is_active: false })
        .neq("id", "00000000-0000-0000-0000-000000000000") // update all rows

      if (deactivateError) throw deactivateError

      const { error: activateError } = await supabase
        .from("resumes")
        .update({ is_active: true })
        .eq("id", id)

      if (activateError) throw activateError

      setResumes((prev) =>
        prev.map((r) => ({ ...r, is_active: r.id === id })),
      )
      router.refresh()
    } catch (err: unknown) {
      setError(getSupabaseErrorMessage(err, "Failed to update active resume"))
    } finally {
      setActionId(null)
    }
  }

  const deleteResume = async (id: string) => {
    if (!confirm("Delete this resume? This cannot be undone.")) return
    setActionId(id)
    setError(null)
    try {
      const target = resumes.find((r) => r.id === id)

      const { error: deleteError } = await supabase
        .from("resumes")
        .delete()
        .eq("id", id)

      if (deleteError) throw deleteError

      // Remove the file from Supabase Storage
      if (target) {
        const match = target.url.match(/\/storage\/v1\/object\/public\/resumes\/(.+)/)
        const storagePath = match?.[1]
        if (storagePath) {
          await supabase.storage.from("resumes").remove([storagePath])
        }
      }

      setResumes((prev) => prev.filter((r) => r.id !== id))
      router.refresh()
    } catch (err: unknown) {
      setError(getSupabaseErrorMessage(err, "Failed to delete resume"))
    } finally {
      setActionId(null)
    }
  }

  const activeResume = resumes.find((r) => r.is_active)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-mono text-sm">Back</span>
          </Link>

          <label className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-mono hover:neon-glow transition-all cursor-pointer disabled:opacity-50">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload PDF
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="hidden"
              disabled={!profile || uploading}
            />
          </label>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Resume Manager</h1>
              <p className="text-sm text-muted-foreground font-mono">
                Upload multiple CVs and choose which one visitors see.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive font-mono text-sm">
            Error: {error}
          </div>
        )}

        {!profile ? (
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-xl font-semibold mb-2">Set up your profile first</h2>
            <p className="text-muted-foreground mb-4">
              Create your profile before uploading a PDF.
            </p>
            <Link
              href="/admin/profile"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-mono text-sm hover:neon-glow transition-all"
            >
              Go to Profile
            </Link>
          </div>
        ) : (
          <>
            {/* Active resume preview */}
            {activeResume && (
              <div className="bg-card border border-border rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-mono font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Active CV — visible to visitors
                  </h2>
                  <div className="flex gap-2">
                    <a
                      href={activeResume.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-mono hover:bg-secondary/80 transition-all"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </a>
                    <a
                      href={activeResume.url}
                      download
                      className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-mono hover:neon-glow transition-all"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </a>
                  </div>
                </div>
                <iframe
                  src={activeResume.url}
                  className="w-full rounded-lg border border-border"
                  style={{ height: "600px" }}
                  title="Active resume preview"
                />
              </div>
            )}

            {/* List of all uploaded CVs */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-secondary/50 border-b border-border">
                <h2 className="font-mono font-bold">All Uploaded CVs ({resumes.length})</h2>
              </div>

              {resumes.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground font-mono text-sm">
                  No resumes uploaded yet. Upload a PDF above.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {resumes.map((resume) => (
                    <div key={resume.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="font-mono text-sm truncate">{resume.filename}</span>
                          {resume.is_active && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-500 text-xs font-mono rounded shrink-0">
                              <CheckCircle2 className="h-3 w-3" />
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono pl-6">
                          Uploaded {formatDate(resume.uploaded_at)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!resume.is_active && (
                          <button
                            onClick={() => setActive(resume.id)}
                            disabled={actionId === resume.id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-mono hover:bg-primary/30 transition-all disabled:opacity-50"
                          >
                            {actionId === resume.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                            Set Active
                          </button>
                        )}
                        <a
                          href={resume.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => deleteResume(resume.id)}
                          disabled={actionId === resume.id}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {actionId === resume.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
