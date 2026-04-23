import { Navigation } from "@/components/navigation"
import { Hero } from "@/components/portfolio/hero"
import { PortfolioTabs } from "@/components/portfolio/portfolio-tabs"
import { Projects } from "@/components/portfolio/projects"
import { Experience } from "@/components/portfolio/experience"
import { Education } from "@/components/portfolio/education"
import { CVSection } from "@/components/portfolio/cv-section"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pt-16">
        <Hero />
        <PortfolioTabs
          projectsContent={<Projects />}
          experienceContent={<Experience />}
          educationContent={<Education />}
          cvContent={<CVSection />}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground font-mono text-sm">
            <span className="text-primary">&gt;</span> Built with Next.js & Supabase
          </p>
          <p className="text-muted-foreground/50 font-mono text-xs mt-2">
            &copy; {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
