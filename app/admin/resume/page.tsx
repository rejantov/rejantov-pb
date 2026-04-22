import { redirect } from "next/navigation"
import { isAdminEmail } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { ResumeManager } from "@/components/admin/resume-manager"

export default async function AdminResumePage() {
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
    .select("id, name, title, resume_url")
    .limit(1)
    .maybeSingle()

  return <ResumeManager profile={profile} />
}
