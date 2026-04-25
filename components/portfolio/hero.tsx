import { Github, Linkedin, Twitter, Mail, Facebook, Instagram, Phone } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

const SnapchatIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.031-.569c-.098-1.626-.225-3.651.304-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z" />
  </svg>
)

const SpotifyIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
)

const GoodreadsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M11.43 23.992c-3.896-.2-7.3-2.393-8.728-5.726-.54-1.264-.7-2.47-.64-4.9.056-2.243.18-3.082.76-5.19.36-1.324 1.128-2.71 2.143-3.84 1.34-1.483 2.9-2.463 4.72-2.97 1.012-.28 2.743-.432 3.917-.348 2.048.144 3.812.82 5.24 2.01.72.59 1.883 1.874 2.307 2.545.12.19.252.343.295.343.042 0 .066-2.055.066-4.566V1.35h2.52v11.1c0 6.106-.024 11.177-.054 11.267-.048.14-.15.162-1.273.162h-1.223l-.08-.48c-.12-.724-.162-.902-.24-1.008-.075-.1-.115-.1-.232 0-.077.065-.273.244-.436.396-1.604 1.51-3.712 2.31-6.02 2.316-.38 0-.875-.05-1.1-.107zm1.83-3.51c.57-.065 1.027-.18 1.56-.39 2.04-.807 3.46-2.524 4.05-4.897.13-.52.155-.784.165-1.843.01-.815-.01-1.38-.06-1.68-.354-2.012-1.226-3.508-2.6-4.458-1.023-.706-2.168-1.04-3.508-1.04-1.348 0-2.504.346-3.532 1.056-1.363.94-2.215 2.4-2.562 4.37-.12.666-.12 2.367 0 3.035.404 2.27 1.468 3.9 3.133 4.795.882.47 1.8.668 2.75.596l.604-.544z" />
  </svg>
)

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  mail: Mail,
  facebook: Facebook,
  instagram: Instagram,
  snapchat: SnapchatIcon,
  spotify: SpotifyIcon,
  goodreads: GoodreadsIcon,
}

export async function Hero() {
  const supabase = await createClient()

  const [{ data: profile }, { data: socialLinks }] = await Promise.all([
    supabase.from("profile").select("*").single(),
    supabase.from("social_links").select("*").order("display_order"),
  ])

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center py-20 px-4 overflow-hidden">
      {/* Subtle gradient background - no grid */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-fuchsia-950/10" />

      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Terminal-style header */}
        <div className="inline-block mb-8">
          <div className="bg-card/80 backdrop-blur border-2 border-purple-500/50 rounded-lg overflow-hidden neon-glow">
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-900/50 border-b border-purple-500/50">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 text-xs text-purple-300 font-mono">terminal</span>
            </div>
            <div className="px-6 py-4 font-mono text-sm text-left">
              <p className="text-purple-400">
                <span className="text-fuchsia-400">$</span> whoami
              </p>
              <p className="text-white mt-1 neon-text">
                {profile?.name || "Anonymous Hacker"}
              </p>
            </div>
          </div>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
          <span className="text-white">{profile?.name?.split(" ")[0] || "Cyber"}</span>
          <span className="text-fuchsia-400 neon-text"> {profile?.name?.split(" ").slice(1).join(" ") || "Dev"}</span>
        </h1>

        {/* Title with neon effect */}
        <p className="text-xl md:text-2xl text-purple-400 font-mono mb-6 neon-text-pink">
          {profile?.title || "Full Stack Developer"}
        </p>

        {/* Bio */}
        <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
          {profile?.bio || "Loading bio..."}
        </p>

        {/* Social links */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {socialLinks?.map((link) => {
            const Icon = iconMap[link.icon] || Mail
            const href = link.icon === "mail" ? "mailto:rejantoverlani00@gmail.com" : link.url
            const isExternal = link.icon !== "mail"
            return (
              <a
                key={link.id}
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="p-3 rounded-lg border-2 border-purple-500/50 bg-purple-900/20 hover:border-fuchsia-400 hover:bg-purple-800/30 hover:neon-glow transition-all group"
                aria-label={link.platform}
              >
                <Icon className="h-5 w-5 text-purple-300 group-hover:text-fuchsia-400 transition-colors" />
              </a>
            )
          })}
        </div>

        {/* Contact info */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm font-mono text-muted-foreground">
          <a
            href="tel:+38346148528"
            className="flex items-center gap-2 hover:text-purple-300 transition-colors"
          >
            <Phone className="h-4 w-4" />
            +383 46148528
          </a>
          <span className="hidden sm:block text-purple-700">|</span>
          <a
            href="mailto:rejantoverlani00@gmail.com"
            className="flex items-center gap-2 hover:text-purple-300 transition-colors"
          >
            <Mail className="h-4 w-4" />
            rejantoverlani00@gmail.com
          </a>
        </div>
      </div>
    </section>
  )
}
