import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Sparkles, Star, Heart, Gamepad2, BookOpen, Mountain, Code, Coffee, Music } from "lucide-react"

export const revalidate = 60

// Fake visitor count that increases
function getVisitorCount() {
  const base = 13847
  const daysSince = Math.floor((Date.now() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60 * 24))
  return base + daysSince * 7 + Math.floor(Math.random() * 10)
}

export default async function BlogPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false })
  
  const visitorCount = getVisitorCount()
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }
  
  return (
    <div className="min-h-screen bg-[hsl(260,25%,6%)] overflow-hidden">
      {/* Starfield background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              width: Math.random() > 0.7 ? '3px' : '2px',
              height: Math.random() > 0.7 ? '3px' : '2px',
            }}
          />
        ))}
      </div>
      
      {/* Top marquee banner */}
      <div className="bg-gradient-to-r from-purple-900 via-fuchsia-800 to-purple-900 border-y-4 border-double border-fuchsia-400 py-2 overflow-hidden">
        <div className="marquee flex items-center gap-8 text-fuchsia-200 font-bold">
          <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-yellow-300" /> WELCOME TO MY CORNER OF THE INTERNET</span>
          <span className="flex items-center gap-2"><Star className="h-4 w-4 text-yellow-300" /> TECH</span>
          <span className="flex items-center gap-2"><Gamepad2 className="h-4 w-4 text-purple-300" /> LEAGUE OF LEGENDS</span>
          <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-amber-300" /> BOOKS</span>
          <span className="flex items-center gap-2"><Mountain className="h-4 w-4 text-green-300" /> HIKING</span>
          <span className="flex items-center gap-2"><Heart className="h-4 w-4 text-pink-300" /> LIFE STUFF</span>
          <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-yellow-300" /> WELCOME TO MY CORNER OF THE INTERNET</span>
          <span className="flex items-center gap-2"><Star className="h-4 w-4 text-yellow-300" /> TECH</span>
          <span className="flex items-center gap-2"><Gamepad2 className="h-4 w-4 text-purple-300" /> LEAGUE OF LEGENDS</span>
          <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-amber-300" /> BOOKS</span>
        </div>
      </div>
      
      {/* Navigation back to portfolio */}
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
        <div className="max-w-6xl mx-auto">
          
          {/* Giant header */}
          <header className="text-center mb-8">
            <div className="inline-block retro-box p-6 mb-6">
              <h1 className="text-4xl md:text-6xl font-bold mb-2">
                <span className="rainbow-text">{"~*~"}</span>
                <span className="text-fuchsia-400 neon-text"> REJAN&apos;S </span>
                <span className="rainbow-text">{"~*~"}</span>
              </h1>
              <h2 className="text-3xl md:text-5xl font-bold text-white neon-text-pink">
                DIGITAL DIARY
              </h2>
              <p className="text-fuchsia-300 mt-2 text-lg">est. 2024 - best viewed with your EYES</p>
            </div>
            
            {/* Visitor counter */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="retro-box px-4 py-2">
                <span className="text-fuchsia-300 text-sm">VISITORS:</span>
                <span className="visitor-counter ml-2">{visitorCount.toString().padStart(6, '0')}</span>
              </div>
              <div className="retro-box px-4 py-2">
                <span className="text-green-400 blink">ONLINE NOW</span>
              </div>
            </div>
          </header>
          
          {/* Categories sidebar + posts */}
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Left sidebar - Categories & stuff */}
            <aside className="lg:w-64 space-y-4">
              {/* Categories box */}
              <div className="retro-box p-4">
                <h3 className="text-center text-fuchsia-400 font-bold border-b-2 border-fuchsia-600 pb-2 mb-3">
                  {">> CATEGORIES <<"}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-cyan-300 hover:text-cyan-100 cursor-pointer">
                    <Code className="h-4 w-4" /> Tech & Coding
                  </div>
                  <div className="flex items-center gap-2 text-purple-300 hover:text-purple-100 cursor-pointer">
                    <Gamepad2 className="h-4 w-4" /> League of Legends
                  </div>
                  <div className="flex items-center gap-2 text-amber-300 hover:text-amber-100 cursor-pointer">
                    <BookOpen className="h-4 w-4" /> Book Reviews
                  </div>
                  <div className="flex items-center gap-2 text-green-300 hover:text-green-100 cursor-pointer">
                    <Mountain className="h-4 w-4" /> Hiking Adventures
                  </div>
                  <div className="flex items-center gap-2 text-pink-300 hover:text-pink-100 cursor-pointer">
                    <Heart className="h-4 w-4" /> Life & Thoughts
                  </div>
                  <div className="flex items-center gap-2 text-orange-300 hover:text-orange-100 cursor-pointer">
                    <Coffee className="h-4 w-4" /> Random Stuff
                  </div>
                </div>
              </div>
              
              {/* Currently box */}
              <div className="retro-box p-4">
                <h3 className="text-center text-yellow-400 font-bold border-b-2 border-yellow-600 pb-2 mb-3">
                  {">> CURRENTLY <<"}
                </h3>
                <div className="text-sm space-y-2">
                  <p><span className="text-fuchsia-400">Playing:</span> <span className="text-white">League (ofc)</span></p>
                  <p><span className="text-fuchsia-400">Reading:</span> <span className="text-white">TBD</span></p>
                  <p><span className="text-fuchsia-400">Listening:</span> <span className="text-white flex items-center gap-1"><Music className="h-3 w-3" /> Lo-fi beats</span></p>
                  <p><span className="text-fuchsia-400">Mood:</span> <span className="text-green-400">vibing</span></p>
                </div>
              </div>
              
              {/* Fun decorative box */}
              <div className="retro-box p-4 text-center">
                <div className="text-4xl mb-2 spin-slow inline-block">{"@"}</div>
                <p className="text-xs text-fuchsia-300">THIS SITE IS MADE WITH</p>
                <p className="text-fuchsia-400 font-bold">100% PASSION</p>
                <p className="text-xs text-fuchsia-300">AND 0% SLEEP</p>
              </div>
              
              {/* Links box */}
              <div className="retro-box p-4">
                <h3 className="text-center text-cyan-400 font-bold border-b-2 border-cyan-600 pb-2 mb-3">
                  {">> COOL LINKS <<"}
                </h3>
                <div className="text-sm space-y-1">
                  <p className="hover:text-yellow-300 cursor-pointer">{">"} My Portfolio</p>
                  <p className="hover:text-yellow-300 cursor-pointer">{">"} GitHub</p>
                  <p className="hover:text-yellow-300 cursor-pointer">{">"} LinkedIn</p>
                  <p className="hover:text-yellow-300 cursor-pointer">{">"} op.gg (lol)</p>
                </div>
              </div>
            </aside>
            
            {/* Main content - Posts */}
            <div className="flex-1">
              <div className="retro-box p-4 mb-6">
                <h2 className="text-xl font-bold text-center text-fuchsia-300">
                  {"*~*~* LATEST POSTS *~*~*"}
                </h2>
              </div>
              
              {posts && posts.length > 0 ? (
                <div className="space-y-6">
                  {posts.map((post, index) => (
                    <article
                      key={post.id}
                      className="retro-box p-4 hover-glow transition-all"
                    >
                      <Link href={`/blog/${post.slug}`} className="block">
                        {/* Post header with decorations */}
                        <div className="flex items-start gap-4">
                          {/* Decorative number */}
                          <div className="hidden md:flex flex-col items-center">
                            <span className="text-3xl font-bold text-fuchsia-500 neon-text">#{(index + 1).toString().padStart(2, '0')}</span>
                            <div className="w-px h-full bg-gradient-to-b from-fuchsia-500 to-transparent mt-2" />
                          </div>
                          
                          <div className="flex-1">
                            {/* Date and sparkles */}
                            <div className="flex items-center gap-2 text-sm text-fuchsia-400 mb-2">
                              <Sparkles className="h-3 w-3" />
                              <span>{formatDate(post.created_at)}</span>
                              <Sparkles className="h-3 w-3" />
                            </div>
                            
                            {/* Title */}
                            <h3 className="text-xl md:text-2xl font-bold text-white hover:text-fuchsia-300 transition-colors mb-2">
                              {">> "}{post.title}
                            </h3>
                            
                            {/* Cover image if exists */}
                            {post.cover_image && (
                              <div className="border-4 border-double border-fuchsia-600 p-1 mb-3 inline-block">
                                <img
                                  src={post.cover_image}
                                  alt={post.title}
                                  className="max-h-40 object-cover"
                                />
                              </div>
                            )}
                            
                            {/* Excerpt */}
                            <p className="text-gray-300 text-sm mb-3">
                              {post.excerpt || post.content.substring(0, 200)}...
                            </p>
                            
                            {/* Read more link */}
                            <div className="flex items-center justify-between">
                              <span className="text-fuchsia-400 text-sm font-bold hover:text-yellow-300 blink">
                                {"[CLICK TO READ MORE]"}
                              </span>
                              <div className="flex gap-1">
                                <Star className="h-4 w-4 text-yellow-400" />
                                <Star className="h-4 w-4 text-yellow-400" />
                                <Star className="h-4 w-4 text-yellow-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="retro-box p-8 text-center">
                  <div className="text-6xl mb-4 bounce-retro inline-block">{"(>_<)"}</div>
                  <h2 className="text-2xl font-bold text-fuchsia-300 mb-2">NO POSTS YET!</h2>
                  <p className="text-gray-400">
                    The blog is under construction... check back soon!
                  </p>
                  <div className="under-construction h-4 mt-4" />
                </div>
              )}
            </div>
            
            {/* Right sidebar - More stuff */}
            <aside className="lg:w-64 space-y-4">
              {/* Updates box */}
              <div className="retro-box p-4">
                <h3 className="text-center text-green-400 font-bold border-b-2 border-green-600 pb-2 mb-3">
                  {">> UPDATES <<"}
                </h3>
                <div className="text-xs space-y-2 text-gray-300">
                  <p><span className="text-green-400">[NEW]</span> Site launched!</p>
                  <p><span className="text-yellow-400">[WIP]</span> Adding more posts</p>
                  <p><span className="text-fuchsia-400">[SOON]</span> Guestbook maybe?</p>
                </div>
              </div>
              
              {/* Quote box */}
              <div className="retro-box p-4">
                <h3 className="text-center text-pink-400 font-bold border-b-2 border-pink-600 pb-2 mb-3">
                  {">> QUOTE <<"}
                </h3>
                <p className="text-sm italic text-gray-300 text-center">
                  &quot;The only way to do great work is to love what you do.&quot;
                </p>
                <p className="text-xs text-pink-400 text-center mt-2">- Steve Jobs</p>
              </div>
              
              {/* Mini about */}
              <div className="retro-box p-4">
                <h3 className="text-center text-orange-400 font-bold border-b-2 border-orange-600 pb-2 mb-3">
                  {">> ABOUT ME <<"}
                </h3>
                <div className="text-center">
                  <div className="text-4xl mb-2">{"^_^"}</div>
                  <p className="text-sm text-gray-300">
                    Just a dev transitioning to cybersec who likes to write about stuff
                  </p>
                </div>
              </div>
              
              {/* Badges/buttons */}
              <div className="retro-box p-4">
                <h3 className="text-center text-purple-400 font-bold border-b-2 border-purple-600 pb-2 mb-3">
                  {">> BADGES <<"}
                </h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="btn-neon text-xs px-2 py-1">NEXTJS</span>
                  <span className="btn-neon text-xs px-2 py-1">REACT</span>
                  <span className="btn-neon text-xs px-2 py-1">TS</span>
                  <span className="btn-neon text-xs px-2 py-1">LOL</span>
                </div>
              </div>
              
              {/* Shoutbox style */}
              <div className="retro-box p-4">
                <h3 className="text-center text-red-400 font-bold border-b-2 border-red-600 pb-2 mb-3">
                  {">> SHOUTBOX <<"}
                </h3>
                <div className="text-xs space-y-1 text-gray-400 max-h-24 overflow-hidden">
                  <p><span className="text-cyan-400">guest:</span> cool site!</p>
                  <p><span className="text-pink-400">anon:</span> nice blog</p>
                  <p><span className="text-green-400">visitor:</span> gg wp</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      
      {/* Bottom marquee */}
      <div className="bg-gradient-to-r from-fuchsia-900 via-purple-800 to-fuchsia-900 border-y-4 border-double border-purple-400 py-2 overflow-hidden mt-8">
        <div className="marquee-slow flex items-center gap-8 text-purple-200">
          <span>{"*"} THANKS FOR VISITING {"*"}</span>
          <span className="text-yellow-300">{"<3"}</span>
          <span>{"*"} SIGN MY GUESTBOOK {"*"}</span>
          <span className="text-pink-300">{"^_^"}</span>
          <span>{"*"} COME BACK SOON {"*"}</span>
          <span className="text-cyan-300">{"(◕‿◕)"}</span>
          <span>{"*"} THANKS FOR VISITING {"*"}</span>
          <span className="text-yellow-300">{"<3"}</span>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="text-center py-6 text-sm text-fuchsia-400">
        <p>Made with {"<3"} and way too much caffeine</p>
        <p className="text-xs text-gray-500 mt-1">Best viewed in any browser because it&apos;s 2024+ lol</p>
      </footer>
    </div>
  )
}
