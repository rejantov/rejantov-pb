"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Terminal, Loader2, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const routeError = searchParams.get("error")

  const routeErrorMessage =
    routeError === "unauthorized"
      ? "This admin area is restricted to the configured owner account."
      : routeError === "auth_failed"
        ? "Authentication failed. Please try logging in again."
        : null
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Invalid login credentials. This usually means the user has not been created in Supabase Auth yet, or the password is incorrect."
          : error.message,
      )
      setLoading(false)
      return
    }
    
    router.push("/admin")
    router.refresh()
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 cyber-grid">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-mono text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        
        {/* Login card */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border-b border-border">
            <div className="w-3 h-3 rounded-full bg-destructive/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="ml-2 text-xs text-muted-foreground font-mono">admin_login.sh</span>
          </div>
          
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Terminal className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Admin Access</h1>
                <p className="text-muted-foreground text-sm font-mono">{">"} Authentication required</p>
              </div>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm font-mono">
                Error: {error}
              </div>
            )}

            {!error && routeErrorMessage && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm font-mono">
                Error: {routeErrorMessage}
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-mono text-muted-foreground mb-2">
                  email:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground font-mono placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="admin@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-mono text-muted-foreground mb-2">
                  password:
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground font-mono placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-mono text-sm hover:neon-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Terminal className="h-4 w-4" />
                    Login
                  </>
                )}
              </button>
            </form>
            
            <p className="mt-6 text-center text-muted-foreground text-sm font-mono">
              Private admin access only
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
