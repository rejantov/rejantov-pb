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
    const storagePath = `${timestamp}-${safeFilename}`

    const fileBuffer = await file.arrayBuffer()

    const { error: storageError } = await supabase.storage
      .from("resumes")
      .upload(storagePath, fileBuffer, {
        contentType: "application/pdf",
        upsert: false,
      })

    if (storageError) {
      return NextResponse.json(
        { error: `Storage error: ${storageError.message}` },
        { status: 500 },
      )
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("resumes").getPublicUrl(storagePath)

    // Mark as active automatically if no active resume exists yet
    const { data: existing } = await supabase
      .from("resumes")
      .select("id")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle()

    const { data: inserted, error: insertError } = await supabase
      .from("resumes")
      .insert({
        filename: file.name,
        url: publicUrl,
        is_active: !existing,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: "Failed to save resume record" }, { status: 500 })
    }

    return NextResponse.json({ url: publicUrl, resume: inserted })
  } catch (error) {
    console.error("Resume upload error:", error)
    return NextResponse.json({ error: "Resume upload failed" }, { status: 500 })
  }
}
