import { type NextRequest, NextResponse } from "next/server"
import { isAdminEmail } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const BUCKET = "blog-media"

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

    // Validate file type — check both MIME type and extension
    const allowedMime = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "application/pdf",
      "text/markdown",
      "text/x-markdown",
      "text/plain",
    ]
    const isMarkdown = file.name.toLowerCase().endsWith(".md")

    if (!allowedMime.includes(file.type) && !isMarkdown) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: images, videos, PDFs, .md files" },
        { status: 400 }
      )
    }

    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 50MB" },
        { status: 400 }
      )
    }

    const timestamp = Date.now()
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const pathname = `${timestamp}-${safeFilename}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(pathname, file, { contentType: file.type, upsert: false })

    if (uploadError) {
      if (
        uploadError.message?.toLowerCase().includes("bucket") ||
        uploadError.message?.toLowerCase().includes("not found")
      ) {
        return NextResponse.json(
          {
            error:
              "Storage bucket 'blog-media' not found. Run scripts/006_create_storage_bucket.sql in your Supabase SQL editor, then try again.",
          },
          { status: 500 }
        )
      }
      throw uploadError
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(pathname)

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
