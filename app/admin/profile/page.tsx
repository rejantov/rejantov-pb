import { redirect } from "next/navigation"
import { isAdminEmail } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { ProfileEditor } from "@/components/admin/profile-editor"

export default async function AdminProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (!isAdminEmail(user.email)) {
    redirect("/auth/login?error=unauthorized")
  }

  const { data: profile } = await supabase
    .from("profile")
    .select("id, name, title, bio, email")
    .limit(1)
    .maybeSingle()

  return <ProfileEditor initialProfile={profile} />
}
