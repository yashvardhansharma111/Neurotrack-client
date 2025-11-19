"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/analyze", label: "Analyze" },
  { href: "/docs", label: "Docs" },
  { href: "/about", label: "About" },
]

export function Navbar() {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-white/10",
        "backdrop-blur-xl bg-black/40",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
            <span className="text-sm font-bold text-white">NT</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            NeuroTrack
          </span>
          <span className="sr-only">NeuroTrack Home</span>
        </Link>

        <nav className="hidden gap-8 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-300 hover:text-white transition-all relative group"
            >
              {l.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
