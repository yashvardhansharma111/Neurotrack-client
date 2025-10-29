"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { LogOut, User } from "lucide-react"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/analyze", label: "Analyze" },
  { href: "/docs", label: "Docs" },
  { href: "/about", label: "About" },
  { href: "/questionnaire", label: "Questionnaire", requiresAuth: true },
]

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/60",
        "backdrop-blur supports-[backdrop-filter]:bg-background/60",
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="relative font-semibold tracking-tight">
            NeuroTrack
            <span
              className="absolute -right-2 -top-2 inline-block size-2 animate-pulse rounded-full bg-primary"
              aria-hidden
            />
          </span>
          <span className="sr-only">NeuroTrack Home</span>
        </Link>

        <nav className="hidden gap-6 md:flex">
          {navLinks.map((l) => {
            if (l.requiresAuth && !isAuthenticated) return null
            return (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {l.label}
              </Link>
            )
          })}
          {isAuthenticated && (
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-muted-foreground md:inline-flex items-center gap-1">
                <User className="h-4 w-4" />
                {user?.username}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
