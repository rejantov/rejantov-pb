import Link from "next/link"
import { notFound } from "next/navigation"
import { marked } from "marked"
import { createClient } from "@/lib/supabase/server"
import { ArrowLeft, Calendar, Sparkles, Star, Tag } from "lucide-react"
import { BlogPostActions } from "@/components/blog/blog-post-actions"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, excerpt")
    .eq("slug", slug)
    .eq("published", true)
    .single()

  if (!post) return { title: "Post Not Found" }

  return {
    title: `${post.title} | Rejan's Digital Diary`,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single()

  if (!post) notFound()

  // Post-process: style download links as highlighted buttons
  const htmlContent = (marked.parse(post.content) as string).replace(
    /<a href="([^"]+)">(Download [^<]+)<\/a>/g,
    '<a href="$1" class="file-download-link" download>⬇ $2</a>'
  )

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

  return (
    <div className="min-h-screen bg-[hsl(260,25%,6%)] overflow-hidden">
      {/* Starfield */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${(i * 37 + 13) % 100}%`,
              top: `${(i * 53 + 7) % 100}%`,
              animationDelay: `${(i * 0.17) % 2}s`,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="webring-nav flex items-center justify-center gap-4 text-sm">
        <Link href="/blog" className="flex items-center gap-1 text-white hover:text-yellow-300 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {"<< BACK TO BLOG"}
        </Link>
        <span className="text-fuchsia-300">|</span>
        <span className="text-fuchsia-200">READING POST</span>
        <span className="text-fuchsia-300">|</span>
        <Link href="/" className="text-white hover:text-yellow-300 transition-colors">
          {"PORTFOLIO >>"}
        </Link>
      </nav>

      <main className="relative z-10 px-4 py-8">
        <article className="max-w-3xl mx-auto">

          {/* Post header */}
          <header className="retro-box p-6 mb-6">
            <div className="flex items-center justify-center gap-2 text-fuchsia-400 mb-4">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm">{"~*~*~*~*~*~*~*~"}</span>
              <Sparkles className="h-4 w-4" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-center text-white mb-4 neon-text-pink">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-fuchsia-300 mb-3">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(post.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400" />
                <Star className="h-4 w-4 text-yellow-400" />
                <Star className="h-4 w-4 text-yellow-400" />
              </span>
            </div>

            {/* Categories */}
            {post.categories && post.categories.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                <Tag className="h-3 w-3 text-fuchsia-400" />
                {post.categories.map((cat: string) => (
                  <Link
                    key={cat}
                    href={`/blog?category=${encodeURIComponent(cat)}`}
                    className="px-2 py-0.5 text-xs font-mono bg-fuchsia-900/40 text-fuchsia-300 border border-fuchsia-600/50 rounded-full hover:bg-fuchsia-800/40 hover:text-fuchsia-100 transition-all"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-fuchsia-400 mt-4">
              <span className="text-sm">{"~*~*~*~*~*~*~*~"}</span>
            </div>
          </header>

          {/* Excerpt */}
          {post.excerpt && (
            <div className="retro-box p-4 mb-6 border-l-4 border-l-fuchsia-500">
              <p className="text-lg text-fuchsia-200 italic">&quot;{post.excerpt}&quot;</p>
            </div>
          )}

          {/* Main content — rendered markdown */}
          <div className="retro-box p-6 md:p-8">
            <div
              className="blog-content prose prose-invert prose-purple max-w-none
                prose-headings:text-fuchsia-300 prose-headings:font-bold
                prose-p:text-gray-200 prose-p:leading-relaxed
                prose-a:text-fuchsia-400 prose-a:underline hover:prose-a:text-yellow-300
                prose-strong:text-white
                prose-code:text-fuchsia-300 prose-code:bg-purple-900/40 prose-code:px-1 prose-code:rounded
                prose-pre:bg-purple-950/60 prose-pre:border prose-pre:border-purple-700
                prose-blockquote:border-l-fuchsia-500 prose-blockquote:text-fuchsia-200
                prose-li:text-gray-200
                prose-img:rounded-lg prose-img:border-2 prose-img:border-fuchsia-700
                prose-img:shadow-lg prose-img:shadow-fuchsia-900/60"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>

          {/* Post footer */}
          <footer className="mt-6 space-y-4">
            <BlogPostActions postId={post.id} initialLikes={post.likes ?? 0} />

            <div className="retro-box p-4 flex items-center justify-between">
              <Link
                href="/blog"
                className="flex items-center gap-2 text-fuchsia-400 hover:text-yellow-300 transition-colors font-bold"
              >
                <ArrowLeft className="h-5 w-5" />
                {"<< MORE POSTS"}
              </Link>
              <div className="text-fuchsia-300 text-sm">{"~ END OF POST ~"}</div>
              <span className="text-gray-500 text-sm">{">>"}</span>
            </div>

            <div className="text-center py-4">
              <p className="text-fuchsia-400 text-sm">{"* * * * * * * * * *"}</p>
              <p className="text-gray-400 text-xs mt-1">Thanks for reading! {"<3"}</p>
              <p className="text-fuchsia-400 text-sm mt-2">{"* * * * * * * * * *"}</p>
            </div>
          </footer>
        </article>
      </main>
    </div>
  )
}
