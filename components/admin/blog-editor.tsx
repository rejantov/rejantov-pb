"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { marked } from "marked"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Loader2,
  Terminal,
  Image as ImageIcon,
  FileVideo,
  FileText,
  X,
  Upload,
  Tag,
  Plus,
  FileCode,
} from "lucide-react"

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  published: boolean
  author_id: string
  categories: string[]
  created_at: string
  updated_at: string
}

interface BlogEditorProps {
  userId: string
  existingPost?: BlogPost
}

interface UploadedMedia {
  url: string
  type: string
  filename: string
}

const CATEGORY_SUGGESTIONS = [
  "Tech",
  "Life",
  "Books",
  "League of Legends",
  "Hiking",
  "Random",
  "Cybersecurity",
  "Travel",
]

export function BlogEditor({ userId, existingPost }: BlogEditorProps) {
  const [title, setTitle] = useState(existingPost?.title ?? "")
  const [slug, setSlug] = useState(existingPost?.slug ?? "")
  const [content, setContent] = useState(existingPost?.content ?? "")
  const [excerpt, setExcerpt] = useState(existingPost?.excerpt ?? "")
  const [published, setPublished] = useState(existingPost?.published ?? false)
  const [categories, setCategories] = useState<string[]>(existingPost?.categories ?? [])
  const [categoryInput, setCategoryInput] = useState("")
  const [previewMode, setPreviewMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([])
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const mdImportRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!existingPost) setSlug(generateSlug(value))
  }

  const addCategory = (cat: string) => {
    const trimmed = cat.trim()
    if (trimmed && !categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed])
    }
    setCategoryInput("")
  }

  const removeCategory = (cat: string) =>
    setCategories((prev) => prev.filter((c) => c !== cat))

  const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addCategory(categoryInput)
    }
  }

  const handleMdImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setContent(ev.target?.result as string)
    reader.readAsText(file)
    if (mdImportRef.current) mdImportRef.current.value = ""
  }

  const uploadToStorage = async (file: File, folder = "") => {
    const timestamp = Date.now()
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const pathname = folder ? `${folder}/${timestamp}-${safeFilename}` : `${timestamp}-${safeFilename}`

    const { error: uploadError } = await supabase.storage
      .from("blog-media")
      .upload(pathname, file, { contentType: file.type, upsert: false })

    if (uploadError) {
      if (uploadError.message?.toLowerCase().includes("bucket") || uploadError.message?.toLowerCase().includes("not found")) {
        throw new Error("Storage bucket missing — run scripts/006_create_storage_bucket.sql in your Supabase SQL editor first.")
      }
      throw new Error(uploadError.message)
    }

    const { data: { publicUrl } } = supabase.storage.from("blog-media").getPublicUrl(pathname)
    return publicUrl
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    for (const file of Array.from(files)) {
      try {
        const url = await uploadToStorage(file, "media")
        const mediaType = file.type.startsWith("image/")
          ? "image"
          : file.type.startsWith("video/")
          ? "video"
          : "file"

        setUploadedMedia((prev) => [...prev, { url, type: mediaType, filename: file.name }])

        if (mediaType === "image") {
          setContent((prev) => prev + `\n\n![${file.name}](${url})`)
        } else {
          setContent((prev) => prev + `\n\n[Download ${file.name}](${url})`)
        }
      } catch (err) {
        setError(`Failed to upload ${file.name}: ${err instanceof Error ? err.message : "Unknown error"}`)
      }
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async (e?: React.SyntheticEvent) => {
    e?.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)

    const baseData = {
      title,
      slug,
      content,
      excerpt: excerpt || null,
      published,
      author_id: userId,
      updated_at: new Date().toISOString(),
    }

    const save = async (withCategories: boolean) => {
      const data = withCategories ? { ...baseData, categories } : baseData
      if (existingPost) {
        return await supabase.from("blog_posts").update(data).eq("id", existingPost.id)
      }
      return await supabase.from("blog_posts").insert(data)
    }

    try {
      const first = await save(true)
      let dbError = first.error

      // If categories column hasn't been migrated yet, retry without it
      if (dbError && (dbError.message?.includes("categories") || dbError.code === "42703")) {
        const retry = await save(false)
        dbError = retry.error
      }

      if (dbError) throw new Error(dbError.message)

      router.push("/admin")
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save post")
      setLoading(false)
    }
  }

  const previewHtml = previewMode ? (marked.parse(content) as string) : ""

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-mono text-sm">Back</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPublished(!published)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-mono transition-all ${
                published
                  ? "bg-green-500/20 text-green-500 border border-green-500/30"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {published ? "Published" : "Draft"}
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !title || !slug || !content}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-mono hover:neon-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive font-mono text-sm">
            Error: {error}
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Post title..."
              className="w-full px-0 py-4 bg-transparent border-0 border-b border-border text-3xl font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-mono text-muted-foreground mb-1">
              URL slug — the address where this post lives
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(generateSlug(e.target.value))}
              placeholder="post-url-slug"
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground font-mono placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
            {slug && (
              <p className="mt-1 text-xs font-mono text-muted-foreground">
                Post will be at:{" "}
                <span className="text-primary">/blog/{slug}</span>
              </p>
            )}
          </div>

          {/* Categories */}
          <div>
            <label className="flex items-center gap-2 text-sm font-mono text-muted-foreground mb-2">
              <Tag className="h-3 w-3" /> categories
            </label>

            {/* Added tags */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/20 text-primary border border-primary/40 rounded-full text-xs font-mono"
                  >
                    {cat}
                    <button
                      type="button"
                      onClick={() => removeCategory(cat)}
                      className="hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Input row */}
            <div className="flex gap-2">
              <input
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                onKeyDown={handleCategoryKeyDown}
                placeholder="Type and press Enter or comma to add..."
                className="flex-1 px-4 py-2 bg-input border border-border rounded-lg text-foreground font-mono text-sm placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => addCategory(categoryInput)}
                className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-all"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-1 mt-2">
              {CATEGORY_SUGGESTIONS.filter((s) => !categories.includes(s)).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addCategory(s)}
                  className="px-2 py-0.5 text-xs font-mono text-muted-foreground border border-dashed border-border rounded-full hover:border-primary hover:text-primary transition-all"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-mono text-muted-foreground mb-2">
              excerpt <span className="opacity-50">(optional — shown on the blog listing)</span>
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief description of your post..."
              rows={2}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
            />
          </div>

          {/* Media upload */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-mono text-sm text-muted-foreground">
                  Media Attachments <span className="opacity-50">(optional)</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Images are auto-inserted into content as markdown
                </p>
              </div>
              <label className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-mono cursor-pointer hover:bg-secondary/80 transition-all">
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {uploadedMedia.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {uploadedMedia.map((media, index) => (
                  <div
                    key={index}
                    className="relative bg-secondary/50 rounded-lg p-3 flex flex-col items-center gap-2"
                  >
                    {media.type === "image" ? (
                      <ImageIcon className="h-6 w-6 text-primary" />
                    ) : media.type === "video" ? (
                      <FileVideo className="h-6 w-6 text-primary" />
                    ) : (
                      <FileText className="h-6 w-6 text-primary" />
                    )}
                    <span className="text-xs text-muted-foreground truncate w-full text-center">
                      {media.filename}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setUploadedMedia((prev) => prev.filter((_, i) => i !== index))
                      }
                      className="absolute -top-1 -right-1 p-1 bg-destructive text-destructive-foreground rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground text-sm py-3 font-mono">
                No media attached yet
              </p>
            )}
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-mono text-muted-foreground">content</label>
              <div className="flex items-center gap-2">
                {/* Import .md file */}
                <label className="flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs font-mono cursor-pointer hover:bg-secondary/80 transition-all">
                  <FileCode className="h-3 w-3" />
                  Import .md
                  <input
                    ref={mdImportRef}
                    type="file"
                    accept=".md,.txt"
                    onChange={handleMdImport}
                    className="hidden"
                  />
                </label>

                {/* Write / Preview toggle */}
                <div className="flex rounded-lg overflow-hidden border border-border text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setPreviewMode(false)}
                    className={`px-3 py-1 transition-all ${
                      !previewMode
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    Write
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(true)}
                    className={`px-3 py-1 transition-all ${
                      previewMode
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    Preview
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 border-b border-border">
                <Terminal className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-mono">
                  markdown supported — or click &quot;Import .md&quot; to load a file
                </span>
              </div>

              {previewMode ? (
                <div
                  className="px-6 py-6 min-h-[400px] prose prose-invert prose-purple max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    "Write your post here...\n\n# Headers with #\n**bold** and *italic*\n[links](url)\n![images](url)\n\n```\ncode blocks\n```"
                  }
                  rows={24}
                  className="w-full px-4 py-4 bg-transparent text-foreground font-mono text-sm placeholder:text-muted-foreground focus:outline-none resize-none"
                />
              )}
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
