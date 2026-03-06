"use client";

import { useScrollFadeIn } from "@/hooks/useScrollFadeIn";

const testimonials = [
  { name: "Nathan B", role: "Founder, L Skincare", quote: "Animus replaced our $5K/month agency and our email revenue went up 40%. It's honestly unreal.", avatar: "NB" },
  { name: "Andy N", role: "CEO, Urban Co.", quote: "Setup took 10 minutes. By the next day, we had 6 flows running that felt like our team wrote them.", avatar: "AN" },
  { name: "Phoebe L", role: "Head of Growth, PetBox", quote: "The AI understands our brand voice better than most humans we've worked with. Our open rates jumped to 44%.", avatar: "PL" },
];

export default function TestimonialsSection() {
  const { ref, isVisible } = useScrollFadeIn();

  return (
    <section ref={ref} className={`py-24 bg-secondary/30 ${isVisible ? "animate-fade-in" : "opacity-0"}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Loved by <span className="text-gradient-teal">Merchants</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <div key={t.name} className="glass-card rounded-xl p-8">
              <p className="text-foreground text-sm leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-teal flex items-center justify-center text-primary-foreground text-sm font-bold">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
