import { redirect } from "next/navigation"
import Link from "next/link"
import { isAdminEmail } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { Terminal, Plus, Edit2, Eye, EyeOff, UserRound, FolderKanban, GraduationCap, Share2, FileText } from "lucide-react"
import { DeletePostButton, LogoutButton } from "./admin-actions"

export default async function AdminPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  if (!isAdminEmail(user.email)) {
    redirect("/auth/login?error=unauthorized")
  }

  const [{ data: posts }, { data: projects }, { data: education }, { data: socialLinks }, { data: profile }] =
    await Promise.all([
      supabase.from("blog_posts").select("*").order("created_at", { ascending: false }),
      supabase.from("projects").select("id"),
      supabase.from("education").select("id"),
      supabase.from("social_links").select("id"),
      supabase.from("profile").select("id, resume_url").limit(1),
    ])
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Admin header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="h-6 w-6 text-primary" />
            <span className="font-mono font-bold">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground font-mono hidden sm:block">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-primary">{posts?.length || 0}</div>
            <div className="text-sm text-muted-foreground font-mono">Total Posts</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-green-500">
              {posts?.filter(p => p.published).length || 0}
            </div>
            <div className="text-sm text-muted-foreground font-mono">Published</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-500">
              {posts?.filter(p => !p.published).length || 0}
            </div>
            <div className="text-sm text-muted-foreground font-mono">Drafts</div>
          </div>
          <Link
            href="/admin/new"
            className="bg-primary/20 border border-primary/30 rounded-lg p-4 flex items-center justify-center gap-2 text-primary hover:bg-primary/30 transition-all"
          >
            <Plus className="h-5 w-5" />
            <span className="font-mono">New Post</span>
          </Link>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="font-mono font-bold text-lg">Portfolio Content</h2>
            <span className="text-xs text-muted-foreground font-mono">
              Edit the homepage sections from here
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <Link
              href="/admin/profile"
              className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <UserRound className="h-5 w-5 text-primary" />
                <span className="text-xs font-mono text-muted-foreground">
                  {profile?.length ? "Configured" : "Empty"}
                </span>
              </div>
              <div className="text-lg font-bold mb-1">Profile</div>
              <p className="text-sm text-muted-foreground mb-3">
                Name, title, bio, and contact email.
              </p>
              <div className="text-xs font-mono text-primary">Open editor</div>
            </Link>

            <Link
              href="/admin/resume"
              className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-xs font-mono text-muted-foreground">
                  {profile?.[0]?.resume_url ? "Uploaded" : "Missing"}
                </span>
              </div>
              <div className="text-lg font-bold mb-1">Resume</div>
              <p className="text-sm text-muted-foreground mb-3">
                Upload and replace your PDF resume.
              </p>
              <div className="text-xs font-mono text-primary">Open editor</div>
            </Link>

            <Link
              href="/admin/projects"
              className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <FolderKanban className="h-5 w-5 text-primary" />
                <span className="text-xs font-mono text-muted-foreground">{projects?.length || 0} items</span>
              </div>
              <div className="text-lg font-bold mb-1">Projects</div>
              <p className="text-sm text-muted-foreground mb-3">
                Portfolio cards, links, technologies, featured state.
              </p>
              <div className="text-xs font-mono text-primary">Open editor</div>
            </Link>

            <Link
              href="/admin/education"
              className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span className="text-xs font-mono text-muted-foreground">{education?.length || 0} items</span>
              </div>
              <div className="text-lg font-bold mb-1">Education</div>
              <p className="text-sm text-muted-foreground mb-3">
                Timeline entries for school, courses, and certifications.
              </p>
              <div className="text-xs font-mono text-primary">Open editor</div>
            </Link>

            <Link
              href="/admin/social-links"
              className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <Share2 className="h-5 w-5 text-primary" />
                <span className="text-xs font-mono text-muted-foreground">{socialLinks?.length || 0} items</span>
              </div>
              <div className="text-lg font-bold mb-1">Social Links</div>
              <p className="text-sm text-muted-foreground mb-3">
                Hero icons, URLs, and display order.
              </p>
              <div className="text-xs font-mono text-primary">Open editor</div>
            </Link>
          </div>
        </div>
        
        {/* Posts list */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-secondary/50 border-b border-border">
            <h2 className="font-mono font-bold">Blog Posts</h2>
          </div>
          
          {posts && posts.length > 0 ? (
            <div className="divide-y divide-border">
              {posts.map((post) => (
                <div key={post.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-foreground truncate">{post.title}</h3>
                      {post.published ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-500 text-xs font-mono rounded">
                          <Eye className="h-3 w-3" />
                          Live
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-xs font-mono rounded">
                          <EyeOff className="h-3 w-3" />
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">
                      {formatDate(post.created_at)} • /blog/{post.slug}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {post.published && (
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        title="View post"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    )}
                    <Link
                      href={`/admin/edit/${post.id}`}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors"
                      title="Edit post"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Link>
                    <DeletePostButton postId={post.id} postTitle={post.title} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Terminal className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground font-mono mb-4">No posts yet</p>
              <Link
                href="/admin/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-mono text-sm hover:neon-glow transition-all"
              >
                <Plus className="h-4 w-4" />
                Create your first post
              </Link>
            </div>
          )}
        </div>
        
        {/* Quick links */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/"
            className="px-4 py-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all font-mono text-sm"
          >
            View Portfolio
          </Link>
          <Link
            href="/blog"
            className="px-4 py-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all font-mono text-sm"
          >
            View Blog
          </Link>
        </div>
      </main>
    </div>
  )
}
