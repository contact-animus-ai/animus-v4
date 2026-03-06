"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 dot-grid opacity-20" />
      <div className="absolute top-1/3 right-0 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[160px]" />

      {/* Animated teal wave SVG */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute bottom-0 right-0 w-[70%] h-[80%] opacity-20" viewBox="0 0 800 600" fill="none">
          <motion.path
            d="M400,500 Q500,300 600,350 T800,200"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          <motion.path
            d="M350,550 Q480,280 620,320 T850,150"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.4 }}
            transition={{ duration: 2.5, delay: 0.3, ease: "easeInOut" }}
          />
          <motion.path
            d="M300,580 Q450,350 580,380 T780,250"
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 3, delay: 0.6, ease: "easeInOut" }}
          />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column — text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Animus AI</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.08] mb-6">
              Your Brand-Led Email Marketing{" "}
              <span className="text-gradient-teal">Agent</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mb-4">
              Connected to Shopify. Trained on your brand. Revenue on autopilot.
            </p>
            <p className="text-sm text-muted-foreground/70 max-w-md mb-8">
              Animus autonomously researches your products, builds personalized email flows, 
              and optimizes campaigns — so you can focus on growing your store.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Button size="lg" className="gradient-teal text-primary-foreground hover:opacity-90 text-base px-8 h-12 glow-teal" asChild>
                <Link href="/signup">Start Free Trial <ArrowRight className="ml-2" size={18} /></Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 h-12 border-border hover:bg-secondary" asChild>
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>
          </motion.div>

          {/* Right column — laptop mockup */}
          <motion.div
            className="relative animate-float"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative mx-auto p-3 rounded-2xl bg-gradient-to-br from-secondary via-card to-secondary border border-primary/20 shadow-[0_0_40px_-10px_hsl(var(--primary)/0.3)]">
              {playing ? (
                <video
                  className="w-full rounded-xl object-cover bg-black"
                  src="https://cdn.shopify.com/videos/c/o/v/55b4637cf5a446929be49c8f41be30c4.mp4"
                  autoPlay
                  controls
                  playsInline
                />
              ) : (
                <button
                  onClick={() => setPlaying(true)}
                  className="relative w-full cursor-pointer group block"
                >
                  <img
                    src="/hero-dashboard.png"
                    alt="Animus AI demo video thumbnail"
                    className="w-full rounded-xl object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full gradient-teal flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform glow-teal">
                      <Play size={32} className="text-primary-foreground ml-1" fill="currentColor" />
                    </div>
                  </div>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
