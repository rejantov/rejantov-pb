import { Suspense } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import {
  Sparkles,
  Star,
  Heart,
  Gamepad2,
  BookOpen,
  Mountain,
  Code,
  Coffee,
  Music,
  Tag,
  Calendar,
  X,
} from "lucide-react"
import { BlogSearch } from "@/components/blog/blog-search"
import { ViewTracker } from "@/components/blog/view-tracker"

export const revalidate = 60

interface BlogPageProps {
  searchParams: Promise<{ category?: string; query?: string }>
}


const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Tech: Code,
  Cybersecurity: Code,
  "League of Legends": Gamepad2,
  Books: BookOpen,
  Hiking: Mountain,
  Life: Heart,
  Random: Coffee,
  Travel: Mountain,
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { category: selectedCategory, query: searchQuery } = await searchParams
  const supabase = await createClient()

  // All published posts ordered oldest→newest — for rank numbering, categories, and total likes
  const { data: allPublished } = await supabase
    .from("blog_posts")
    .select("id, likes, categories")
    .eq("published", true)
    .order("created_at", { ascending: true })

  // Build global rank map: post id → rank (1 = oldest)
  const rankMap = new Map(allPublished?.map((p, i) => [p.id, i + 1]) ?? [])

  // Extract unique categories (graceful: categories column may not exist yet)
  const allCategories = [
    ...new Set(
      allPublished?.flatMap((p) => (p.categories as string[] | null) ?? []) ?? []
    ),
  ].sort()

  const totalLikes = allPublished?.reduce((sum, p) => sum + ((p.likes as number) ?? 0), 0) ?? 0

  // Fetch opened count from site_stats (graceful: table may not exist yet)
  const { data: statRow } = await supabase
    .from("site_stats")
    .select("value")
    .eq("key", "blog_opens")
    .single()
  const openedCount = (statRow?.value as number) ?? 0

  // Fetch posts for display (newest first, with optional filters)
  let postsQuery = supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false })

  if (selectedCategory) {
    postsQuery = postsQuery.contains("categories", [selectedCategory])
  }
  if (searchQuery?.trim()) {
    postsQuery = postsQuery.or(
      `title.ilike.%${searchQuery.trim()}%,excerpt.ilike.%${searchQuery.trim()}%`
    )
  }

  const { data: posts } = await postsQuery

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

  return (
    <div className="min-h-screen bg-[hsl(260,25%,6%)] overflow-hidden">
      {/* Starfield */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${(i * 37 + 13) % 100}%`,
              top: `${(i * 53 + 7) % 100}%`,
              animationDelay: `${(i * 0.13) % 2}s`,
              width: i % 3 === 0 ? "3px" : "2px",
              height: i % 3 === 0 ? "3px" : "2px",
            }}
          />
        ))}
      </div>

      {/* Top marquee */}
      <div className="bg-gradient-to-r from-purple-900 via-fuchsia-800 to-purple-900 border-y-4 border-double border-fuchsia-400 py-2 overflow-hidden">
        <div className="marquee flex items-center gap-8 text-fuchsia-200 font-bold">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-300" /> WELCOME TO MY CORNER OF THE INTERNET
          </span>
          <span className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-300" /> TECH
          </span>
          <span className="flex items-center gap-2">
            <Gamepad2 className="h-4 w-4 text-purple-300" /> LEAGUE OF LEGENDS
          </span>
          <span className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-amber-300" /> BOOKS
          </span>
          <span className="flex items-center gap-2">
            <Mountain className="h-4 w-4 text-green-300" /> HIKING
          </span>
          <span className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-pink-300" /> LIFE STUFF
          </span>
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-300" /> WELCOME TO MY CORNER OF THE INTERNET
          </span>
          <span className="flex items-center gap-2">
            <Gamepad2 className="h-4 w-4 text-purple-300" /> LEAGUE OF LEGENDS
          </span>
          <span className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-amber-300" /> BOOKS
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="webring-nav flex items-center justify-center gap-4 text-sm">
        <span className="text-fuchsia-300">[</span>
        <Link href="/" className="text-white hover:text-yellow-300 transition-colors">
          {"<< PORTFOLIO"}
        </Link>
        <span className="text-fuchsia-300">|</span>
        <span className="text-fuchsia-200 blink">YOU ARE HERE: BLOG</span>
        <span className="text-fuchsia-300">|</span>
        <Link href="/login" className="text-white hover:text-yellow-300 transition-colors">
          {"ADMIN >>"}
        </Link>
        <span className="text-fuchsia-300">]</span>
      </nav>

      <main className="relative z-10 px-4 py-8">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <header className="text-center mb-8">
            <div className="inline-block retro-box p-6 mb-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-1">
                <span className="rainbow-text">{"~*~"}</span>
                <span className="text-fuchsia-400 neon-text"> REJAN&apos;S </span>
                <span className="rainbow-text">{"~*~"}</span>
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold text-white neon-text-pink">
                DIGITAL DIARY
              </h2>
              <p className="text-fuchsia-300 mt-2">est. 2026 · best viewed with your EYES</p>
            </div>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="retro-box px-4 py-2">
                <span className="text-fuchsia-300 text-sm">OPENED: </span>
                <span className="visitor-counter">{openedCount.toString().padStart(6, "0")}</span>
              </div>
              <div className="retro-box px-4 py-2">
                <span className="text-pink-400 text-sm">TOTAL LIKES: </span>
                <span className="visitor-counter">{totalLikes.toString().padStart(4, "0")}</span>
              </div>
            </div>
            <ViewTracker />
          </header>

          {/* Main layout */}
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Sidebar */}
            <aside className="lg:w-56 space-y-4 shrink-0">
              <div className="retro-box p-4">
                <h3 className="text-center text-fuchsia-400 font-bold border-b-2 border-fuchsia-600 pb-2 mb-3">
                  {">> CATEGORIES <<"}
                </h3>

                <Link
                  href="/blog"
                  className={`flex items-center gap-2 py-1 text-sm transition-colors ${
                    !selectedCategory && !searchQuery
                      ? "text-yellow-300 font-bold"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  <Sparkles className="h-3 w-3" /> All Posts
                  {!selectedCategory && !searchQuery && (
                    <span className="ml-auto text-xs text-yellow-500">◄</span>
                  )}
                </Link>

                {allCategories.length > 0 ? (
                  allCategories.map((cat) => {
                    const Icon = CATEGORY_ICONS[cat] ?? Tag
                    const isActive = selectedCategory === cat
                    return (
                      <Link
                        key={cat}
                        href={isActive ? "/blog" : `/blog?category=${encodeURIComponent(cat)}`}
                        className={`flex items-center gap-2 py-1 text-sm transition-colors ${
                          isActive
                            ? "text-yellow-300 font-bold"
                            : "text-gray-300 hover:text-white"
                        }`}
                      >
                        <Icon className="h-3 w-3 shrink-0" />
                        <span className="truncate">{cat}</span>
                        {isActive && <span className="ml-auto text-xs text-yellow-500">◄</span>}
                      </Link>
                    )
                  })
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No categories yet
                  </p>
                )}
              </div>

              {/* Currently */}
              <div className="retro-box p-4">
                <h3 className="text-center text-yellow-400 font-bold border-b-2 border-yellow-600 pb-2 mb-3">
                  {">> CURRENTLY <<"}
                </h3>
                <div className="text-sm space-y-2">
                  <p>
                    <span className="text-fuchsia-400">Playing: </span>
                    <span className="text-white">League (ofc)</span>
                  </p>
                  <p>
                    <span className="text-fuchsia-400">Reading: </span>
                    <span className="text-white">TBD</span>
                  </p>
                  <p className="flex items-center gap-1">
                    <span className="text-fuchsia-400">Listening: </span>
                    <Music className="h-3 w-3 text-white" />
                    <span className="text-white">Lo-fi</span>
                  </p>
                  <p>
                    <span className="text-fuchsia-400">Mood: </span>
                    <span className="text-green-400">vibing</span>
                  </p>
                </div>
              </div>

              <div className="retro-box p-4 text-center">
                <div className="text-3xl mb-2 spin-slow inline-block">{"@"}</div>
                <p className="text-xs text-fuchsia-300">MADE WITH</p>
                <p className="text-fuchsia-400 font-bold text-sm">100% PASSION</p>
                <p className="text-xs text-fuchsia-300">AND 0% SLEEP</p>
              </div>
            </aside>

            {/* Posts area */}
            <div className="flex-1 min-w-0">

              {/* Search bar */}
              <Suspense fallback={<div className="retro-box p-3 mb-4 h-14 animate-pulse" />}>
                <BlogSearch initialQuery={searchQuery} />
              </Suspense>

              {/* Active filter / search indicator */}
              <div className="retro-box p-3 mb-4 flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-lg font-bold text-fuchsia-300">
                  {searchQuery
                    ? `~*~ RESULTS FOR "${searchQuery}" ~*~`
                    : selectedCategory
                    ? `~*~ ${selectedCategory} ~*~`
                    : "*~*~* LATEST POSTS *~*~*"}
                </h2>
                {(selectedCategory || searchQuery) && (
                  <Link
                    href="/blog"
                    className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-white border border-border rounded px-2 py-1 transition-colors"
                  >
                    <X className="h-3 w-3" /> clear
                  </Link>
                )}
              </div>

              {posts && posts.length > 0 ? (
                <div className="space-y-5">
                  {posts.map((post) => {
                    const postNum = rankMap.get(post.id) ?? 0
                    return (
                      <article key={post.id} className="retro-box p-5 hover-glow transition-all">
                        <Link href={`/blog/${post.slug}`} className="block">
                          <div className="flex items-start gap-4">
                            {/* Global post number */}
                            <div className="hidden sm:block shrink-0">
                              <span className="text-2xl font-bold text-fuchsia-500 neon-text font-mono">
                                #{postNum.toString().padStart(2, "0")}
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 text-xs text-fuchsia-400 mb-1 font-mono">
                                <Calendar className="h-3 w-3" />
                                {formatDate(post.created_at)}
                              </div>

                              <h3 className="text-xl font-bold text-white hover:text-fuchsia-300 transition-colors mb-2">
                                {">> "}{post.title}
                              </h3>

                              {post.categories && post.categories.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {post.categories.map((cat: string) => (
                                    <span
                                      key={cat}
                                      className="px-2 py-0.5 text-xs font-mono bg-fuchsia-900/40 text-fuchsia-300 border border-fuchsia-700/50 rounded-full"
                                    >
                                      {cat}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <p className="text-gray-300 text-sm line-clamp-2">
                                {post.excerpt ||
                                  post.content.replace(/[#*`[\]()!]/g, "").substring(0, 180)}
                                ...
                              </p>

                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-fuchsia-400 text-xs font-bold font-mono hover:text-yellow-300">
                                  {"[CLICK TO READ MORE]"}
                                </span>
                                <div className="flex items-center gap-3">
                                  {(post.likes ?? 0) > 0 && (
                                    <span className="flex items-center gap-1 text-xs text-pink-400 font-mono">
                                      <Heart className="h-3 w-3 fill-current" />
                                      {post.likes}
                                    </span>
                                  )}
                                  <div className="flex gap-0.5">
                                    <Star className="h-3 w-3 text-yellow-400" />
                                    <Star className="h-3 w-3 text-yellow-400" />
                                    <Star className="h-3 w-3 text-yellow-400" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <div className="retro-box p-8 text-center">
                  <div className="text-5xl mb-4 bounce-retro inline-block">{"(>_<)"}</div>
                  <h2 className="text-xl font-bold text-fuchsia-300 mb-2">
                    {searchQuery
                      ? `No posts matching "${searchQuery}"`
                      : selectedCategory
                      ? `No posts in "${selectedCategory}" yet!`
                      : "NO POSTS YET!"}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {selectedCategory || searchQuery ? (
                      <Link href="/blog" className="text-fuchsia-400 hover:text-yellow-300">
                        ← Show all posts
                      </Link>
                    ) : (
                      "The blog is under construction... check back soon!"
                    )}
                  </p>
                  <div className="under-construction h-4 mt-4" />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom marquee */}
      <div className="bg-gradient-to-r from-fuchsia-900 via-purple-800 to-fuchsia-900 border-y-4 border-double border-purple-400 py-2 overflow-hidden mt-8">
        <div className="marquee-slow flex items-center gap-8 text-purple-200">
          <span>{"*"} THANKS FOR VISITING {"*"}</span>
          <span className="text-yellow-300">{"<3"}</span>
          <span>{"*"} COME BACK SOON {"*"}</span>
          <span className="text-pink-300">{"^_^"}</span>
          <span>{"*"} THANKS FOR VISITING {"*"}</span>
          <span className="text-cyan-300">{"(◕‿◕)"}</span>
          <span>{"*"} COME BACK SOON {"*"}</span>
          <span className="text-yellow-300">{"<3"}</span>
        </div>
      </div>

      <footer className="text-center py-6 text-sm text-fuchsia-400">
        <p>Made with {"<3"} and way too much free time</p>
        <p className="text-xs text-gray-500 mt-1">
          Best viewed in any browser because it&apos;s 2024+ lol
        </p>
      </footer>
    </div>
  )
}
