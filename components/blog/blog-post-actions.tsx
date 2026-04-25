"use client"

import { useState, useEffect } from "react"
import { Heart, Share2, Check } from "lucide-react"

interface BlogPostActionsProps {
  postId: string
  initialLikes: number
}

export function BlogPostActions({ postId, initialLikes }: BlogPostActionsProps) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(initialLikes)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try {
      const likedPosts: string[] = JSON.parse(localStorage.getItem("liked_posts") ?? "[]")
      setLiked(likedPosts.includes(postId))
    } catch {
      // ignore
    }
  }, [postId])

  const handleLike = async () => {
    const action = liked ? "unlike" : "like"
    const optimisticLikes = liked ? likes - 1 : likes + 1

    // Optimistic update
    setLiked(!liked)
    setLikes(optimisticLikes)

    try {
      const likedPosts: string[] = JSON.parse(localStorage.getItem("liked_posts") ?? "[]")
      const updated = liked
        ? likedPosts.filter((id) => id !== postId)
        : [...likedPosts, postId]
      localStorage.setItem("liked_posts", JSON.stringify(updated))

      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        const data = await res.json()
        setLikes(data.likes ?? optimisticLikes)
      }
    } catch {
      // revert on error
      setLiked(liked)
      setLikes(likes)
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const el = document.createElement("textarea")
      el.value = window.location.href
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="retro-box p-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="text-fuchsia-300">Did you like this post?</span>
        <button
          onClick={handleLike}
          className={`btn-neon text-sm px-3 py-1 flex items-center gap-1.5 transition-all ${
            liked ? "border-pink-500 text-pink-400" : ""
          }`}
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-current text-pink-400" : ""}`} />
          {liked ? "Liked!" : "Like"}
          <span className="font-mono text-xs opacity-70">({likes})</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-fuchsia-300">Share:</span>
        <button
          onClick={handleShare}
          className="btn-neon text-sm px-3 py-1 flex items-center gap-1 transition-all"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" /> Copy Link
            </>
          )}
        </button>
      </div>
    </div>
  )
}
