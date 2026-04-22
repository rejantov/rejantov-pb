import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { isAdminEmail } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isAdminEmail(user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF resumes are allowed" }, { status: 400 })
    }

    const maxSize = 10 * 1024 * 1024

    if (file.size > maxSize) {
      return NextResponse.json({ error: "Resume is too large. Maximum size is 10MB" }, { status: 400 })
    }

    const timestamp = Date.now()
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const pathname = `resume/${timestamp}-${safeFilename}`

    const blob = await put(pathname, file, {
      access: "public",
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("Resume upload error:", error)
    return NextResponse.json({ error: "Resume upload failed" }, { status: 500 })
  }
}
