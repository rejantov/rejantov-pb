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
    redirect("/login")
  }

  if (!isAdminEmail(user.email)) {
    redirect("/login?error=unauthorized")
  }

  const [{ data: profile }, { data: resumes }] = await Promise.all([
    supabase
      .from("profile")
      .select("id, name, title")
      .limit(1)
      .maybeSingle(),
    supabase
      .from("resumes")
      .select("*")
      .order("uploaded_at", { ascending: false }),
  ])

  return <ResumeManager profile={profile} initialResumes={resumes ?? []} />
}
