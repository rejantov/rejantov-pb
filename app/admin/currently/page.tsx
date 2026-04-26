import { redirect } from "next/navigation"
import { isAdminEmail } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { CurrentlyManager } from "@/components/admin/currently-manager"

export default async function AdminCurrentlyPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  if (!isAdminEmail(user.email)) redirect("/login?error=unauthorized")

  const { data: rows } = await supabase
    .from("site_stats")
    .select("key, text_value")
    .in("key", ["currently_playing", "currently_reading", "currently_listening", "currently_mood"])

  const map = Object.fromEntries((rows ?? []).map((r) => [r.key.replace("currently_", ""), r.text_value]))

  const initial = {
    playing:   (map.playing   as string) ?? "",
    reading:   (map.reading   as string) ?? "",
    listening: (map.listening as string) ?? "",
    mood:      (map.mood      as string) ?? "",
  }

  return <CurrentlyManager initial={initial} />
}
