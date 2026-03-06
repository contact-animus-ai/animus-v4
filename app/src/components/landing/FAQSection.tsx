"use client";

import { useScrollFadeIn } from "@/hooks/useScrollFadeIn";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "How does Animus learn my brand?", a: "Animus analyzes your Shopify store, product descriptions, imagery, and existing email content to build a comprehensive brand profile. It captures your tone, visual style, and messaging patterns automatically." },
  { q: "Do I need Klaviyo?", a: "Yes, Animus currently integrates with Klaviyo as the email sending platform. We chose Klaviyo because it's the gold standard for Shopify email marketing. Support for additional ESPs is on our roadmap." },
  { q: "Can I edit what Animus creates?", a: "Absolutely. Animus generates emails and flows for your review. You can edit, approve, or ask Animus to revise anything before it goes live. You're always in control." },
  { q: "How is this different from Klaviyo's built-in AI?", a: "Klaviyo's AI assists with individual tasks like subject lines. Animus is a full autonomous operator — it researches your brand, builds complete strategies, creates full campaigns, and continuously optimizes. It's the difference between a tool and a teammate." },
  { q: "What if I already have email flows set up?", a: "Animus can work alongside your existing flows. It analyzes what you have, identifies gaps, and creates complementary campaigns without disrupting what's already working." },
  { q: "Is there a free trial?", a: "Yes! Every plan starts with a 14-day free trial. No credit card required. You can connect your store and see Animus in action before committing." },
];

export default function FAQSection() {
  const { ref, isVisible } = useScrollFadeIn();

  return (
    <section id="faq" ref={ref} className={`py-24 ${isVisible ? "animate-fade-in" : "opacity-0"}`}>
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Frequently Asked <span className="text-gradient-teal">Questions</span>
          </h2>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="glass-card rounded-xl px-6 border-border/50">
              <AccordionTrigger className="text-foreground hover:no-underline text-left">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
