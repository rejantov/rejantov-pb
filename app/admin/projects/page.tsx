import { redirect } from "next/navigation"
import { isAdminEmail } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { ProjectsManager } from "@/components/admin/projects-manager"

export default async function AdminProjectsPage() {
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

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })

  return <ProjectsManager initialProjects={projects ?? []} />
}
