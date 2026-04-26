import { ExternalLink, Github, Star } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export async function Projects() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {projects?.map((project) => (
        <article
          key={project.id}
          className="group relative bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all hover:neon-glow"
        >
          {/* Featured badge */}
          {project.featured && (
            <div className="absolute top-4 right-4 z-10">
              <span className="flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary text-xs font-mono rounded border border-primary/30">
                <Star className="h-3 w-3" />
                Featured
              </span>
            </div>
          )}
          
          {/* Project image */}
          <div className="h-48 bg-secondary/30 border-b border-border overflow-hidden flex items-center justify-center">
            {project.image_url ? (
              <img
                src={project.image_url}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="text-6xl font-mono text-primary/30 group-hover:text-primary/50 transition-colors">
                {"</>"}
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              {project.description}
            </p>
            
            {/* Technologies */}
            <div className="flex flex-wrap gap-2 mb-4">
              {project.technologies?.map((tech: string) => (
                <span
                  key={tech}
                  className="px-2 py-1 bg-secondary text-secondary-foreground text-xs font-mono rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
            
            {/* Links */}
            <div className="flex items-center gap-4">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Github className="h-4 w-4" />
                  Code
                </a>
              )}
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Live Demo
                </a>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
