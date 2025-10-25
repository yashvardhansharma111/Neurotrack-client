import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} NeuroTrack</p>
          <div className="flex items-center gap-4">
            <Link href="/docs" className="hover:text-foreground transition-colors">
              Docs
            </Link>
            <Link href="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <a href="mailto:contact@neurotrack.app" className="hover:text-foreground transition-colors">
              contact@neurotrack.app
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
