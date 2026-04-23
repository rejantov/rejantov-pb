"use client"

import { useState } from "react"
import { Briefcase, Code, FileText, GraduationCap } from "lucide-react"

interface PortfolioTabsProps {
  projectsContent: React.ReactNode
  experienceContent: React.ReactNode
  educationContent: React.ReactNode
  cvContent: React.ReactNode
}

const tabs = [
  { id: "projects", label: "Projects", icon: Code },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "cv", label: "CV/Resume", icon: FileText },
]

export function PortfolioTabs({ projectsContent, experienceContent, educationContent, cvContent }: PortfolioTabsProps) {
  const [activeTab, setActiveTab] = useState("projects")

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Tab navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-mono text-sm transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground neon-glow"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div className="min-h-[400px]">
          {activeTab === "projects" && projectsContent}
          {activeTab === "experience" && experienceContent}
          {activeTab === "education" && educationContent}
          {activeTab === "cv" && cvContent}
        </div>
      </div>
    </section>
  )
}
