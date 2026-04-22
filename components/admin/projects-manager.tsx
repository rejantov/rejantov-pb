"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, ExternalLink, Github, Loader2, Pencil, Plus, Save, Star, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Project {
  id: string
  title: string
  description: string
  technologies: string[] | null
  image_url: string | null
  live_url: string | null
  github_url: string | null
  featured: boolean
  created_at: string
  updated_at: string
}

interface ProjectsManagerProps {
  initialProjects: Project[]
}

const emptyForm = {
  title: "",
  description: "",
  technologies: "",
  imageUrl: "",
  liveUrl: "",
  githubUrl: "",
  featured: false,
}

export function ProjectsManager({ initialProjects }: ProjectsManagerProps) {
  const [projects, setProjects] = useState(initialProjects)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState(emptyForm.title)
  const [description, setDescription] = useState(emptyForm.description)
  const [technologies, setTechnologies] = useState(emptyForm.technologies)
  const [imageUrl, setImageUrl] = useState(emptyForm.imageUrl)
  const [liveUrl, setLiveUrl] = useState(emptyForm.liveUrl)
  const [githubUrl, setGithubUrl] = useState(emptyForm.githubUrl)
  const [featured, setFeatured] = useState(emptyForm.featured)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const resetForm = () => {
    setEditingId(null)
    setTitle(emptyForm.title)
    setDescription(emptyForm.description)
    setTechnologies(emptyForm.technologies)
    setImageUrl(emptyForm.imageUrl)
    setLiveUrl(emptyForm.liveUrl)
    setGithubUrl(emptyForm.githubUrl)
    setFeatured(emptyForm.featured)
  }

  const handleEdit = (project: Project) => {
    setEditingId(project.id)
    setTitle(project.title)
    setDescription(project.description)
    setTechnologies(project.technologies?.join(", ") ?? "")
    setImageUrl(project.image_url ?? "")
    setLiveUrl(project.live_url ?? "")
    setGithubUrl(project.github_url ?? "")
    setFeatured(project.featured)
    setError(null)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const projectData = {
      title,
      description,
      technologies: technologies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      image_url: imageUrl || null,
      live_url: liveUrl || null,
      github_url: githubUrl || null,
      featured,
      updated_at: new Date().toISOString(),
    }

    try {
      if (editingId) {
        const { data, error: updateError } = await supabase
          .from("projects")
          .update(projectData)
          .eq("id", editingId)
          .select("*")
          .single()

        if (updateError) throw updateError

        setProjects((current) =>
          current
            .map((project) => (project.id === editingId ? data : project))
            .sort((a, b) => Number(b.featured) - Number(a.featured) || b.created_at.localeCompare(a.created_at)),
        )
      } else {
        const { data, error: insertError } = await supabase
          .from("projects")
          .insert(projectData)
          .select("*")
          .single()

        if (insertError) throw insertError

        setProjects((current) =>
          [data, ...current].sort(
            (a, b) => Number(b.featured) - Number(a.featured) || b.created_at.localeCompare(a.created_at),
          ),
        )
      }

      resetForm()
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save project")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (project: Project) => {
    if (!confirm(`Delete "${project.title}"?`)) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from("projects")
        .delete()
        .eq("id", project.id)

      if (deleteError) throw deleteError

      setProjects((current) => current.filter((item) => item.id !== project.id))

      if (editingId === project.id) {
        resetForm()
      }

      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete project")
    } finally {
      setLoading(false)
    }
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
            form="projects-form"
            disabled={loading || !title || !description}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-mono hover:neon-glow transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingId ? "Save Project" : "Add Project"}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-2">Projects</h1>
            <p className="text-sm text-muted-foreground font-mono">
              Create and reorder your portfolio pieces. Technologies should be comma-separated.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive font-mono text-sm">
              Error: {error}
            </div>
          )}

          <div className="space-y-4">
            {projects.length > 0 ? (
              projects.map((project) => (
                <article key={project.id} className="bg-card border border-border rounded-lg p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h2 className="text-lg font-semibold">{project.title}</h2>
                        {project.featured && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-mono rounded bg-primary/15 text-primary border border-primary/30">
                            <Star className="h-3 w-3" />
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.technologies?.map((tech) => (
                          <span key={tech} className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs font-mono">
                            {tech}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        {project.github_url && (
                          <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                            <Github className="h-4 w-4" />
                            Code
                          </a>
                        )}
                        {project.live_url && (
                          <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                            <ExternalLink className="h-4 w-4" />
                            Live
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEdit(project)}
                        className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all"
                        title="Edit project"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(project)}
                        className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
                        title="Delete project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground font-mono text-sm">
                No projects yet.
              </div>
            )}
          </div>
        </section>

        <section>
          <form id="projects-form" onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-5 sticky top-24">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">{editingId ? "Edit Project" : "New Project"}</h2>
                <p className="text-sm text-muted-foreground font-mono">
                  Keep this focused and portfolio-friendly.
                </p>
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
              <label className="block text-sm font-mono text-muted-foreground mb-2">title</label>
              <input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
            </div>

            <div>
              <label className="block text-sm font-mono text-muted-foreground mb-2">description</label>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={5} className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-y" />
            </div>

            <div>
              <label className="block text-sm font-mono text-muted-foreground mb-2">technologies</label>
              <input value={technologies} onChange={(event) => setTechnologies(event.target.value)} className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Next.js, Supabase, Tailwind CSS" />
            </div>

            <div>
              <label className="block text-sm font-mono text-muted-foreground mb-2">image_url</label>
              <input type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="https://..." />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-mono text-muted-foreground mb-2">live_url</label>
                <input type="url" value={liveUrl} onChange={(event) => setLiveUrl(event.target.value)} className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="https://..." />
              </div>

              <div>
                <label className="block text-sm font-mono text-muted-foreground mb-2">github_url</label>
                <input type="url" value={githubUrl} onChange={(event) => setGithubUrl(event.target.value)} className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="https://github.com/..." />
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm font-mono text-muted-foreground">
              <input
                type="checkbox"
                checked={featured}
                onChange={(event) => setFeatured(event.target.checked)}
                className="h-4 w-4 rounded border-border bg-input"
              />
              Featured project
            </label>
          </form>
        </section>
      </main>
    </div>
  )
}
