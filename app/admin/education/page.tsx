import { redirect } from "next/navigation"
import { isAdminEmail } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { EducationManager } from "@/components/admin/education-manager"

export default async function AdminEducationPage() {
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

  const { data: education } = await supabase
    .from("education")
    .select("*")
    .order("start_date", { ascending: false })

  return <EducationManager initialEducation={education ?? []} />
}
