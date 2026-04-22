"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, ExternalLink, Loader2, Pencil, Plus, Save, Share2, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface SocialLink {
  id: string
  platform: string
  url: string
  icon: string
  display_order: number
  created_at: string
}

interface SocialLinksManagerProps {
  initialLinks: SocialLink[]
}

const emptyForm = {
  platform: "",
  url: "",
  icon: "",
  displayOrder: "0",
}

export function SocialLinksManager({ initialLinks }: SocialLinksManagerProps) {
  const [links, setLinks] = useState(initialLinks)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [platform, setPlatform] = useState(emptyForm.platform)
  const [url, setUrl] = useState(emptyForm.url)
  const [icon, setIcon] = useState(emptyForm.icon)
  const [displayOrder, setDisplayOrder] = useState(emptyForm.displayOrder)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const resetForm = () => {
    setEditingId(null)
    setPlatform(emptyForm.platform)
    setUrl(emptyForm.url)
    setIcon(emptyForm.icon)
    setDisplayOrder(emptyForm.displayOrder)
  }

  const handleEdit = (link: SocialLink) => {
    setEditingId(link.id)
    setPlatform(link.platform)
    setUrl(link.url)
    setIcon(link.icon)
    setDisplayOrder(String(link.display_order))
    setError(null)
  }

  const sortLinks = (items: SocialLink[]) =>
    [...items].sort((a, b) => a.display_order - b.display_order || a.platform.localeCompare(b.platform))

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const socialData = {
      platform,
      url,
      icon,
      display_order: Number.parseInt(displayOrder || "0", 10) || 0,
    }

    try {
      if (editingId) {
        const { data, error: updateError } = await supabase
          .from("social_links")
          .update(socialData)
          .eq("id", editingId)
          .select("*")
          .single()

        if (updateError) throw updateError

        setLinks((current) => sortLinks(current.map((item) => (item.id === editingId ? data : item))))
      } else {
        const { data, error: insertError } = await supabase
          .from("social_links")
          .insert(socialData)
          .select("*")
          .single()

        if (insertError) throw insertError

        setLinks((current) => sortLinks([...current, data]))
      }

      resetForm()
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save social link")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (link: SocialLink) => {
    if (!confirm(`Delete "${link.platform}"?`)) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from("social_links")
        .delete()
        .eq("id", link.id)

      if (deleteError) throw deleteError

      setLinks((current) => current.filter((item) => item.id !== link.id))

      if (editingId === link.id) {
        resetForm()
      }

      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete social link")
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
            form="social-links-form"
            disabled={loading || !platform || !url || !icon}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-mono hover:neon-glow transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingId ? "Save Link" : "Add Link"}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-2">Social Links</h1>
            <p className="text-sm text-muted-foreground font-mono">
              Icons currently supported in the hero are: github, linkedin, twitter, and mail.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive font-mono text-sm">
              Error: {error}
            </div>
          )}

          <div className="space-y-4">
            {links.length > 0 ? (
              links.map((link) => (
                <article key={link.id} className="bg-card border border-border rounded-lg p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Share2 className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">{link.platform}</h2>
                        <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs font-mono">
                          order {link.display_order}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground font-mono mb-2">icon: {link.icon}</p>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors break-all">
                        <ExternalLink className="h-4 w-4" />
                        {link.url}
                      </a>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button type="button" onClick={() => handleEdit(link)} className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => handleDelete(link)} className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground font-mono text-sm">
                No social links yet.
              </div>
            )}
          </div>
        </section>

        <section>
          <form id="social-links-form" onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-5 sticky top-24">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">{editingId ? "Edit Social Link" : "New Social Link"}</h2>
                <p className="text-sm text-muted-foreground font-mono">Use `mail` for email links like `mailto:you@example.com`.</p>
              </div>
              {editingId && (
                <button type="button" onClick={resetForm} className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-mono hover:bg-secondary/80 transition-all">
                  Cancel
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-mono text-muted-foreground mb-2">platform</label>
              <input value={platform} onChange={(event) => setPlatform(event.target.value)} className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="GitHub" />
            </div>

            <div>
              <label className="block text-sm font-mono text-muted-foreground mb-2">url</label>
              <input value={url} onChange={(event) => setUrl(event.target.value)} className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="https://github.com/username" />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-mono text-muted-foreground mb-2">icon</label>
                <input value={icon} onChange={(event) => setIcon(event.target.value)} className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="github" />
              </div>
              <div>
                <label className="block text-sm font-mono text-muted-foreground mb-2">display_order</label>
                <input value={displayOrder} onChange={(event) => setDisplayOrder(event.target.value)} className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" inputMode="numeric" placeholder="0" />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
              <div className="font-mono mb-2">Quick icon values</div>
              <div className="flex flex-wrap gap-2 font-mono text-xs">
                <span className="px-2 py-1 rounded bg-background border border-border">github</span>
                <span className="px-2 py-1 rounded bg-background border border-border">linkedin</span>
                <span className="px-2 py-1 rounded bg-background border border-border">twitter</span>
                <span className="px-2 py-1 rounded bg-background border border-border">mail</span>
              </div>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}
