"use client"

import Link from "next/link"
import { Menu, User } from "lucide-react"
import { useState } from "react"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex flex-col">
            <h1 className="text-xl font-semibold text-foreground">Missing App</h1>
            <p className="text-xs text-muted-foreground">Douala Community Alert Network</p>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-foreground hover:text-primary transition text-sm">
              Cases
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:bg-primary/90 transition"
            >
              Report Missing Person
            </Link>
            <Link href="/reporter" className="text-foreground hover:text-primary transition">
              <User className="w-5 h-5" />
            </Link>
          </nav>

          {/* Mobile Menu */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-foreground">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-border pt-4 mt-4 space-y-3">
            <Link href="/" className="block text-foreground hover:text-primary transition">
              Cases
            </Link>
            <Link
              href="/login"
              className="block px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:bg-primary/90 transition text-center"
            >
              Report Missing Person
            </Link>
            <Link href="/reporter" className="block text-foreground hover:text-primary transition">
              My Cases
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
