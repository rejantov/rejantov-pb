import { GraduationCap, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

function getDegreeTag(degree: string): { label: string; className: string } {
  const d = degree.toLowerCase()
  if (d.includes("high school") || d.includes("secondary") || d.includes("diploma")) {
    return { label: "High School", className: "bg-slate-500/20 text-slate-300 border-slate-500/40" }
  }
  if (d.includes("phd") || d.includes("ph.d") || d.includes("doctor")) {
    return { label: "PhD", className: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40" }
  }
  if (d.includes("master") || d.includes("m.s.") || d.includes("m.a.") || d.includes("msc")) {
    return { label: "Master", className: "bg-purple-500/20 text-purple-300 border-purple-500/40" }
  }
  if (d.includes("bachelor") || d.includes("b.s.") || d.includes("b.a.") || d.includes("bsc")) {
    return { label: "Bachelor", className: "bg-blue-500/20 text-blue-300 border-blue-500/40" }
  }
  if (d.includes("associate") || d.includes("a.a.") || d.includes("a.s.")) {
    return { label: "Associate", className: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" }
  }
  if (d.includes("certificate") || d.includes("certification") || d.includes("professional")) {
    return { label: "Certificate", className: "bg-green-500/20 text-green-300 border-green-500/40" }
  }
  if (d.includes("bootcamp") || d.includes("program") || d.includes("course")) {
    return { label: "Program", className: "bg-orange-500/20 text-orange-300 border-orange-500/40" }
  }
  return { label: "Education", className: "bg-primary/20 text-primary border-primary/40" }
}

export async function Education() {
  const supabase = await createClient()
  const { data: education } = await supabase
    .from("education")
    .select("*")
    .order("start_date", { ascending: false })

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    })
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />

        {education?.map((item) => {
          const tag = getDegreeTag(item.degree)
          return (
            <div key={item.id} className="relative pl-20 pb-12 last:pb-0">
              {/* Timeline dot */}
              <div className="absolute left-6 top-0 w-5 h-5 rounded-full bg-primary border-4 border-background animate-pulse-glow" />

              {/* Content card */}
              <article className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-foreground">{item.institution}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono border ${tag.className}`}>
                        {tag.label}
                      </span>
                    </div>
                    <p className="text-primary font-mono text-sm">
                      {item.degree} in {item.field}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm font-mono shrink-0">
                    <Calendar className="h-4 w-4" />
                    {formatDate(item.start_date)} — {item.end_date ? formatDate(item.end_date) : <span className="text-green-500">Present</span>}
                  </div>
                </div>

                {/* Description */}
                {item.description && (
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                )}
              </article>
            </div>
          )
        })}
      </div>
    </div>
  )
}
