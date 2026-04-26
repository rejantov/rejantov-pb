import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { isAdminEmail } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { AccentPicker } from "@/components/admin/accent-picker"

export default async function AppearancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdminEmail(user.email)) {
    redirect("/login")
  }

  const { data: accentRow } = await supabase
    .from("site_stats")
    .select("text_value")
    .eq("key", "site_accent")
    .maybeSingle()

  const accent = accentRow?.text_value ?? "purple"

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-mono text-sm">Back</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-1">Appearance</h1>
          <p className="text-sm text-muted-foreground font-mono">
            Colour theme for the whole site. Visitors can switch light/dark themselves via the nav toggle.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <AccentPicker initialAccent={accent} />
        </div>
      </main>
    </div>
  )
}
