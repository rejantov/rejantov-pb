import { redirect } from "next/navigation"
import { isAdminEmail } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { SocialLinksManager } from "@/components/admin/social-links-manager"

export default async function AdminSocialLinksPage() {
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

  const { data: socialLinks } = await supabase
    .from("social_links")
    .select("*")
    .order("display_order")

  return <SocialLinksManager initialLinks={socialLinks ?? []} />
}
