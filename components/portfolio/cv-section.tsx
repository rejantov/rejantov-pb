import { Download, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export async function CVSection() {
  const supabase = await createClient()

  const [{ data: profile }, { data: activeResume }] = await Promise.all([
    supabase.from("profile").select("name, title").single(),
    supabase.from("resumes").select("url, filename").eq("is_active", true).maybeSingle(),
  ])

  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* CV Preview Card */}
      <div className="bg-card border border-border rounded-lg p-8 mb-8">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
          <FileText className="h-10 w-10 text-primary" />
        </div>

        <h3 className="text-2xl font-bold text-foreground mb-2">
          {profile?.name || "Your Name"}
        </h3>
        <p className="text-primary font-mono mb-4">
          {profile?.title || "Your Title"}
        </p>

        <p className="text-muted-foreground mb-8">
          Download my resume to learn more about my experience, skills, and qualifications.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {activeResume ? (
            <a
              href={activeResume.url}
              download
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-mono text-sm hover:neon-glow transition-all"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </a>
          ) : (
            <div className="px-6 py-3 bg-secondary/50 text-muted-foreground rounded-lg font-mono text-sm">
              Resume not uploaded yet
            </div>
          )}
        </div>
      </div>

      {/* PDF Preview */}
      {activeResume && (
        <div className="bg-card border border-border rounded-lg overflow-hidden mb-8">
          <div className="px-4 py-3 bg-secondary/50 border-b border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-mono">{activeResume.filename}</span>
            <a
              href={activeResume.url}
              download
              className="flex items-center gap-1 text-xs text-primary font-mono hover:underline"
            >
              <Download className="h-3 w-3" />
              Download
            </a>
          </div>
          <iframe
            src={activeResume.url}
            className="w-full"
            style={{ height: "700px" }}
            title="Resume preview"
          />
        </div>
      )}
    </div>
  )
}
