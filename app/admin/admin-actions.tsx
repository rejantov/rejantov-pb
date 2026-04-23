"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Trash2, LogOut, Loader2 } from "lucide-react"
import { useState } from "react"

export function DeletePostButton({ postId, postTitle }: { postId: string; postTitle: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  
  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${postTitle}"? This cannot be undone.`)) {
      return
    }
    
    setLoading(true)
    
    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", postId)
    
    if (error) {
      alert("Failed to delete post: " + error.message)
      setLoading(false)
      return
    }
    
    router.refresh()
  }
  
  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
      title="Delete post"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  )
}

export function LogoutButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  
  const handleLogout = async () => {
    setLoading(true)
    // Clear the browser-session marker so re-opening admin requires a new login
    document.cookie = "admin-active=; path=/; max-age=0; SameSite=Strict"
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }
  
  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm hover:bg-secondary/80 transition-all disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      <span className="hidden sm:inline">Logout</span>
    </button>
  )
}
