"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download, Eye, FileText, Loader2, Upload } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getSupabaseErrorMessage } from "@/lib/supabase/error"

interface Profile {
  id: string
  name: string
  title: string
  resume_url: string | null
}

interface ResumeManagerProps {
  profile: Profile | null
}

export function ResumeManager({ profile }: ResumeManagerProps) {
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [resumeUrl, setResumeUrl] = useState(profile?.resume_url ?? "")
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file || !profile) return

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF resume.")
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

      const nextResumeUrl = data.url as string
      setResumeUrl(nextResumeUrl)

      setSaving(true)

      const { error: updateError } = await supabase
        .from("profile")
        .update({
          resume_url: nextResumeUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)

      if (updateError) {
        throw updateError
      }

      router.refresh()
    } catch (uploadError: unknown) {
      setError(getSupabaseErrorMessage(uploadError, "Failed to upload resume"))
    } finally {
      setUploading(false)
      setSaving(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

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
            {uploading || saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload PDF
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="hidden"
              disabled={!profile || uploading || saving}
            />
          </label>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Resume</h1>
              <p className="text-sm text-muted-foreground font-mono">
                Upload a PDF resume. This powers the CV section on your homepage.
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
              The resume URL is stored on your profile record, so create your profile before uploading a PDF.
            </p>
            <Link
              href="/admin/profile"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-mono text-sm hover:neon-glow transition-all"
            >
              Go to Profile
            </Link>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">{profile.name}</h2>
                <p className="text-sm text-primary font-mono mb-4">{profile.title}</p>
                <p className="text-sm text-muted-foreground">
                  Uploading a new PDF will replace the stored resume link on your profile.
                </p>
              </div>

              {resumeUrl ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-secondary-foreground rounded-lg font-mono text-sm hover:bg-secondary/80 transition-all"
                  >
                    <Eye className="h-4 w-4" />
                    View Resume
                  </a>
                  <a
                    href={resumeUrl}
                    download
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-mono text-sm hover:neon-glow transition-all"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </a>
                </div>
              ) : (
                <div className="px-4 py-3 bg-secondary/50 text-muted-foreground rounded-lg font-mono text-sm">
                  No resume uploaded yet
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
