"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@chowvest/ui"
import { Menu, X, Leaf } from "lucide-react"
import Image from "next/image"

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-13 h-13 flex items-center justify-center bg-accent/20 rounded-full">
              <Image src="/chowvest-logo-nobg.png" width={100} height={100} alt="Chowvest logo" className="w-13 h-13 object-contain" />
            </div>
            <span className="text-xl font-bold text-foreground">Chowvest</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#home" className="text-foreground font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="#how-it-works" className="text-foreground font-medium hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link href="#products" className="text-foreground font-medium hover:text-primary transition-colors">
              Products
            </Link>
            <Link href="#features" className="text-foreground font-medium hover:text-primary transition-colors">
              Features
            </Link>
            <Button asChild>
              <Link href="/">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t">
            <Link
              href="#home"
              className="block text-foreground font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="#how-it-works"
              className="block text-foreground font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="#products"
              className="block text-foreground font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="#features"
              className="block text-foreground font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Button asChild className="w-full">
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}
