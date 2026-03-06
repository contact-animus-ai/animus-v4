"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg gradient-teal flex items-center justify-center text-primary-foreground font-bold text-sm">A</div>
          <span className="text-lg font-bold tracking-tight text-foreground">Animus AI</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" asChild><Link href="/login">Log In</Link></Button>
          <Button className="gradient-teal text-primary-foreground hover:opacity-90" asChild><Link href="/signup">Get Started Free</Link></Button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl px-4 py-4 space-y-3">
          <a href="#how-it-works" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>How It Works</a>
          <a href="#features" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>Features</a>
          <Link href="/pricing" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>Pricing</Link>
          <a href="#faq" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>FAQ</a>
          <div className="pt-2 flex flex-col gap-2">
            <Button variant="ghost" asChild><Link href="/login">Log In</Link></Button>
            <Button className="gradient-teal text-primary-foreground" asChild><Link href="/signup">Get Started Free</Link></Button>
          </div>
        </div>
      )}
    </nav>
  );
}
