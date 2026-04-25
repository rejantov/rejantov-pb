"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"

interface BlogSearchProps {
  initialQuery?: string
}

export function BlogSearch({ initialQuery }: BlogSearchProps) {
  const [query, setQuery] = useState(initialQuery ?? "")
  const router = useRouter()
  const searchParams = useSearchParams()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (query.trim()) {
        params.set("query", query.trim())
      } else {
        params.delete("query")
      }
      router.push(`/blog?${params.toString()}`)
    }, 300)

    return () => clearTimeout(timeout)
  }, [query]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="retro-box p-3 mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fuchsia-400 pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts by title or content..."
          className="w-full pl-9 pr-8 py-2 bg-transparent border border-fuchsia-700/50 rounded text-white placeholder:text-fuchsia-400/50 font-mono text-sm focus:outline-none focus:border-fuchsia-400 transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-fuchsia-400 hover:text-white transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  )
}
