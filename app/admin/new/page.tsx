import { redirect } from "next/navigation"
import { isAdminEmail } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { BlogEditor } from "@/components/admin/blog-editor"

export default async function NewPostPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  if (!isAdminEmail(user.email)) {
    redirect("/auth/login?error=unauthorized")
  }
  
  return <BlogEditor userId={user.id} />
}
