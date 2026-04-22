"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, Loader2, Save, UserRound } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getSupabaseErrorMessage } from "@/lib/supabase/error"

interface Profile {
  id: string
  name: string
  title: string
  bio: string
  email: string | null
}

interface ProfileEditorProps {
  initialProfile: Profile | null
}

export function ProfileEditor({ initialProfile }: ProfileEditorProps) {
  const [name, setName] = useState(initialProfile?.name ?? "")
  const [title, setTitle] = useState(initialProfile?.title ?? "")
  const [bio, setBio] = useState(initialProfile?.bio ?? "")
  const [email, setEmail] = useState(initialProfile?.email ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const profileData = {
      name,
      title,
      bio,
      email: email || null,
      updated_at: new Date().toISOString(),
    }

    try {
      if (initialProfile?.id) {
        const { error: updateError } = await supabase
          .from("profile")
          .update(profileData)
          .eq("id", initialProfile.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from("profile")
          .insert(profileData)

        if (insertError) throw insertError
      }

      router.refresh()
    } catch (err: unknown) {
      setError(getSupabaseErrorMessage(err, "Failed to save profile"))
    } finally {
      setLoading(false)
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

          <button
            type="submit"
            form="profile-form"
            disabled={loading || !name || !title || !bio}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-mono hover:neon-glow transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Profile
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
              <UserRound className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Profile</h1>
              <p className="text-sm text-muted-foreground font-mono">
                This powers the hero section and CV card on your homepage.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive font-mono text-sm">
            Error: {error}
          </div>
        )}

        <form id="profile-form" onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-mono text-muted-foreground mb-2">name</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-mono text-muted-foreground mb-2">title</label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="Full Stack Developer"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-mono text-muted-foreground mb-2">bio</label>
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              rows={7}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-y"
              placeholder="Write a short intro for your portfolio."
            />
          </div>

          <div>
            <label className="block text-sm font-mono text-muted-foreground mb-2">email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="you@example.com"
            />
          </div>
        </form>
      </main>
    </div>
  )
}
