import { redirect } from "next/navigation"
import { isAdminEmail } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { ExperienceManager } from "@/components/admin/experience-manager"

export default async function AdminExperiencePage() {
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

  const { data: experience } = await supabase
    .from("work_experience")
    .select("*")
    .order("start_date", { ascending: false })

  return <ExperienceManager initialExperience={experience ?? []} />
}
