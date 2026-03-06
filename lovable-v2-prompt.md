# Lovable V2 Prompt — Paste this into Lovable

Build a Next.js 14 app named "Animus" using the App Router, TypeScript, and Tailwind CSS. This is an autonomous email marketing operator for Shopify merchants. The frontend should feel premium, interactive, and alive — like a product that's already generating revenue for merchants.

## Design System — Animus Brand Colors

Dark theme throughout. Use these EXACT brand colors everywhere:

**Primary Colors:**
- Background: #0B1120 (Deep Navy — primary background, all dark surfaces)
- Surface: #111827 (Dark Navy — cards, panels, secondary surfaces)
- Nested/Inputs: #1A2332 (slightly lighter navy for inputs, nested elements)
- Borders: rgba(45, 212, 191, 0.15) (subtle teal-tinted borders), #1A1A1A (minimal chrome borders)
- Accent: #2DD4BF (Teal/Cyan — primary accent for CTAs, buttons, active states, links, highlights)
- Accent hover: #5EEAD4 (Cyan Light — hover states, lighter accent variant)
- Accent glow: #14B8A6 (Teal Glow — gradient midpoint, glow effects)
- Text primary: #FFFFFF (headings, primary text on dark)
- Text secondary: #A0A0A0 (body text, secondary copy)
- Text muted: #707070 (tertiary text, captions)
- Text subtle: #404040 (footer text, fine print)
- Success: #22C55E (active status indicators)
- Warning: #F59E0B (pending status indicators)
- Error: #ef4444 (red)

**Gradients:**
- Background gradient: #0B1120 → #111827 (vertical, subtle)
- Accent gradient: #14B8A6 → #2DD4BF → #5EEAD4 (teal spectrum, used for glows and energy lines)
- Card border glow: rgba(45, 212, 191, 0.15) border with subtle teal tint

**Typography:**
- Font Family: System stack — -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif
- Headings: White (#FFFFFF), font-weight 600-700, letter-spacing -0.5px
- Body: Light grey (#A0A0A0), font-weight 400, line-height 1.6
- Accent text: Teal (#2DD4BF), font-weight 600 — used for subheadings and emphasis

**Design Principles:**
1. Dark-first: All backgrounds are deep navy/near-black. No light mode.
2. Teal as signal: Teal/cyan is the ONLY accent color — used sparingly for CTAs, active states, and visual emphasis.
3. Minimal chrome: Borders are subtle (#1A1A1A or teal-tinted). No heavy outlines.
4. Calm authority: The palette communicates precision and trust.
5. High contrast text: White headings on dark backgrounds. Grey body text for comfortable reading.
6. NEVER mention "AI", "Claude", "Manus", "Perplexity", or any underlying technology on any merchant-facing page. Animus IS the product. The merchant only knows Animus.

- Border radius: rounded-lg (inputs), rounded-xl (cards), rounded-2xl (chat bubbles, hero cards)
- Install and use `sonner` for toast notifications. Add `<Toaster />` to root layout.

## Authentication & Database

Integrate Supabase for auth using @supabase/ssr. Environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY.

Create middleware.ts:
- Public routes: /, /login, /signup, /forgot-password, /reset-password, /auth/callback
- Public API routes: /api/billing/webhook, /api/shopify/webhooks, /api/inngest
- No session → redirect to /login
- If merchant_state starts with "onboarding_" → redirect to /onboarding
- Otherwise → allow through

## PAGES

---

### / (Landing Page) — Full marketing site, single scroll page with anchor navigation

This is the most important page. It must be engaging, interactive, and educate the merchant on everything Animus does — without ever saying "AI". Every section below should fade in on scroll using Intersection Observer. Make every section feel alive with subtle animations.

---

**Navigation bar** (sticky top, bg-[#0B1120]/80 backdrop-blur, z-50, border-b border-[rgba(45,212,191,0.08)]):
- Logo: the text "Animus" on left (text-xl font-bold text-white, with a small teal dot after it using a span with bg-[#2DD4BF] w-1.5 h-1.5 rounded-full inline-block)
- Nav links center: Features, How It Works, Compare, Pricing, FAQ (text-[#A0A0A0] hover:text-white transition-colors, smooth scroll to anchor)
- Right: "Login" text link (text-[#A0A0A0] hover:text-white) + "Get Started" teal button (bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#0B1120] font-semibold px-5 py-2.5 rounded-xl) → /signup
- Mobile: hamburger menu icon, slides in a full-height sidebar overlay with all nav links

---

**SECTION 1: Hero** (min-h-screen flex items-center justify-center, background gradient from #0B1120 to #111827):

- Animated gradient orb behind everything (absolute, blurred radial gradient using #14B8A6 and #2DD4BF at 30% opacity, slowly pulsing scale with CSS animation, mix-blend-screen)
- Eyebrow badge: "Autonomous Email Marketing" in a pill (bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20 rounded-full px-4 py-1.5 text-sm font-medium)
- Headline: "Your Brand-Led Email Marketing Operator." — text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight
- Subheadline: "Connected to Shopify. Trained to your brand. Revenue on autopilot." — text-lg md:text-xl text-[#A0A0A0] max-w-2xl mt-6
- Two CTAs side by side (mt-8 flex gap-4):
  - "Get Early Access" (bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#0B1120] px-8 py-4 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-[#2DD4BF]/20)
  - "See How It Works" (border border-[rgba(45,212,191,0.3)] text-white px-8 py-4 rounded-xl hover:bg-[#111827] transition-all)
- Below CTAs: "No credit card required · Set up in minutes" in text-sm text-[#707070] mt-4

**Below hero text, build an interactive dashboard mockup** (max-w-4xl mx-auto mt-16):
This is NOT an image — build it as a real component:
- Container: bg-[#111827] border border-[rgba(45,212,191,0.15)] rounded-2xl overflow-hidden shadow-2xl shadow-[#2DD4BF]/5
- Top bar: bg-[#0B1120] h-10 flex items-center px-4, three dots (red/yellow/green circles, w-3 h-3) on the left, "Animus — Dashboard" centered text-[#707070] text-xs
- Left sidebar (w-48 bg-[#0B1120] border-r border-[rgba(45,212,191,0.1)] p-4):
  - Nav items stacked: "Dashboard" (text-white bg-[#111827] rounded-lg px-3 py-2), "Flows", "Campaigns", "Segments", "Analytics", "Settings" (text-[#707070] px-3 py-2 hover:text-[#A0A0A0])
- Main content area (flex-1 p-6):
  - Row of 3 stat cards at top (flex gap-4):
    - "Open Rate" — large "45%" in text-[#2DD4BF] text-3xl font-bold, small bar chart below (5 bars of varying height using bg-[#2DD4BF] with different opacities)
    - "Click Rate" — "12%" same style
    - "Revenue" — "$24,500" in text-white text-3xl font-bold
  - Below: "Recent Automated Campaigns" heading in text-white text-sm font-medium mt-6
  - 4 campaign rows: each row has a teal dot (status), campaign name text-[#A0A0A0], and a status pill on the right ("Active" in bg-[#22C55E]/10 text-[#22C55E] or "Pending" in bg-[#F59E0B]/10 text-[#F59E0B])
- The entire mockup should have a subtle teal glow: shadow-2xl shadow-[#2DD4BF]/10
- On scroll, this mockup should slightly translate up (translate-y animation) as user scrolls past hero

---

**SECTION 2: Logos/Trust Bar** (py-16, border-b border-[#1A1A1A]):
- "Trusted by fast-growing Shopify brands" in text-sm text-[#707070] centered uppercase tracking-widest
- Row of 6 placeholder brand slots (flex justify-center gap-12 mt-8): each is a text-[#404040] text-lg font-semibold ("Brand", "Brand", "Brand", "Brand", "Brand", "Brand") — these are placeholders for future logos

---

**SECTION 3: Three Pillars — "Before It Writes a Single Email, It Studies Your Entire Business"** (py-24):

Section heading: "Before It Writes a Single Email, It Studies Your Entire Business" — text-3xl md:text-4xl font-bold text-white centered
Subtitle: "Animus connects to three data sources and builds a complete picture of your store, your brand, and your marketing." — text-[#A0A0A0] centered max-w-2xl mx-auto mt-4

Build this as an interactive diagram, NOT an image:
- Center hexagon/circle: "Animus Orchestration Engine" with a brain-circuit icon (use a simple SVG or an abstract icon). bg-[#111827] border-2 border-[#2DD4BF] rounded-2xl p-8 shadow-lg shadow-[#2DD4BF]/20. Label underneath: "Intelligent Email Marketing Platform" text-[#707070] text-xs
- Three nodes positioned around it (on desktop: left, bottom-left, right in a triangle layout; on mobile: stacked vertically):
  1. **Product Intelligence** — Shopify bag icon (simple SVG). "Catalog, orders, customer data" text-[#A0A0A0]. Card: bg-[#111827] border border-[rgba(45,212,191,0.15)] rounded-xl p-6
  2. **Marketing Intelligence** — chart/graph icon. "Flows, segments, campaigns, performance" text-[#A0A0A0]. Same card style.
  3. **Brand Intelligence** — palette/paintbrush icon. "Colors, fonts, tone, visual identity" text-[#A0A0A0]. Same card style.
- Animated connection lines between each node and the center: use CSS/SVG animated dashed lines or glowing lines (border-dashed with a teal color that pulses). On desktop these should curve between nodes. On mobile, use simple vertical connectors.
- Each node should fade in sequentially on scroll (stagger 200ms delay between each)

---

**SECTION 4: Features — "Everything Animus Does For You"** (py-24, bg-[#0B1120]):

Section heading: "Everything Animus Does For You" — text-3xl md:text-4xl font-bold text-white centered
Subtitle: "From audit to deployment — Animus handles the entire email marketing lifecycle" — text-[#A0A0A0] centered

3x2 grid of feature cards (max-w-6xl mx-auto, grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12):

Each card: bg-[#111827] border border-[rgba(45,212,191,0.15)] rounded-2xl p-8 hover:border-[#2DD4BF]/30 transition-all duration-300 group cursor-default
- Top: icon circle (w-12 h-12 bg-gradient-to-br from-[#14B8A6] to-[#2DD4BF] rounded-xl flex items-center justify-center, white icon inside, group-hover:shadow-lg group-hover:shadow-[#2DD4BF]/20 transition-all)
- Title: text-white font-semibold text-lg mt-4
- Description: text-[#A0A0A0] text-sm mt-2 leading-relaxed

Cards:
1. Icon: magnifying glass. Title: "14-Point Klaviyo Audit". Description: "Animus connects to your Klaviyo and Shopify accounts, pulls your flows, campaigns, segments, and customer data, then runs a 14-point analysis benchmarked against your industry's top performers. You get a health score, gap analysis, and a prioritized list of revenue opportunities — with dollar estimates."

2. Icon: chart-bar-trending-up. Title: "Revenue Opportunity Detection". Description: "Animus doesn't just report problems — it quantifies them. Every gap in your email program is mapped to a specific monthly revenue figure. Missing a post-purchase flow? Animus tells you exactly how much that's costing you and ranks every opportunity by impact."

3. Icon: users/people. Title: "Automated Segmentation". Description: "Once you confirm which opportunities to pursue, Animus builds the segments directly inside your Klaviyo account. VIP customers, at-risk churners, lapsed buyers, high-AOV repeat purchasers — all created programmatically from your actual store data."

4. Icon: mail/envelope. Title: "On-Brand Email Generation". Description: "Tell Animus what you need and it generates fully designed, conversion-focused emails using your exact brand colors, fonts, and voice. Welcome series, abandoned cart, post-purchase, winback — each one tailored to your brand and your customers."

5. Icon: paintbrush/edit. Title: "Visual Email Editor". Description: "Every generated email opens in a drag-and-drop editor with live preview. Move blocks around, swap images, edit copy — or just describe what you want changed in plain English and Animus updates the design instantly."

6. Icon: rocket. Title: "One-Click Klaviyo Push". Description: "When your email is ready, hit one button. Animus compiles it into production-grade HTML and pushes it directly into your Klaviyo account as a template — ready to go live. No exporting, no copy-pasting, no switching tabs."

---

**SECTION 5: How It Works — "From Connection to Revenue in Minutes"** (py-24):

Section heading: "From Connection to Revenue in Minutes" — text-3xl md:text-4xl font-bold text-white centered
Subtitle: "Not days. Not weeks. Minutes." — text-[#2DD4BF] centered font-medium

Build an interactive horizontal timeline (on desktop) / vertical timeline (on mobile):

5 steps connected by animated teal lines (use a horizontal flex with connecting line elements between steps):

Each step is a card:
- Top: time badge in a teal circle (w-16 h-16 rounded-full border-2 border-[#2DD4BF] bg-[#0B1120] flex items-center justify-center). Time text: "5 min", "15 min", "25 min", "You decide", "Instant" — text-[#2DD4BF] text-sm font-bold
- Icon below the circle (teal icon, 24px)
- Step name: text-white font-semibold text-lg mt-3
- Description: text-[#A0A0A0] text-sm mt-1 max-w-[180px] text-center

Steps:
1. Time: "5 min" | Icon: plug/connect | Title: "Connect" | Desc: "Link your Shopify and Klaviyo accounts. Under 5 minutes."
2. Time: "15 min" | Icon: magnifying glass | Title: "Research" | Desc: "Animus audits your brand, templates, data, and gaps."
3. Time: "25 min" | Icon: building/construct | Title: "Build" | Desc: "First flows, segments, and campaigns delivered as drafts."
4. Time: "You decide" | Icon: checkmark | Title: "Refine" | Desc: "You review. Request changes in plain English."
5. Time: "Instant" | Icon: rocket | Title: "Live" | Desc: "Full system active. Flows, segments, campaigns running."

The connecting lines between steps should be animated: a teal (#2DD4BF) dashed line with a subtle glow that pulses left-to-right using CSS animation (like a flowing energy line). Use a background gradient animation on the line.

On scroll into view, each step should appear sequentially (stagger 150ms).

---

**SECTION 6: Campaign Studio Mockup — "Tell Animus What You Need"** (py-24, bg-[#111827]/30):

Section heading: "Tell Animus What You Need" — text-3xl md:text-4xl font-bold text-white centered
Subtitle: "Describe your campaign in plain English. Animus writes the copy, designs the template, and matches your brand — live." — text-[#A0A0A0] centered max-w-2xl mx-auto

Build an interactive mockup of the Campaign Studio (NOT an image):
- Container: max-w-5xl mx-auto, bg-[#111827] border border-[rgba(45,212,191,0.15)] rounded-2xl overflow-hidden shadow-2xl shadow-[#2DD4BF]/5
- Top bar: "Animus — Campaign Studio" with window dots
- Split layout (flex, 50/50 on desktop, stacked on mobile):

  **Left panel — "Chat"** (bg-[#0B1120] p-6, border-r border-[rgba(45,212,191,0.1)]):
  - Label "Chat" at top in text-[#707070] text-xs uppercase tracking-wider
  - Simulated chat messages (static, not functional):
    - User bubble (bg-[#2DD4BF] text-[#0B1120] rounded-2xl rounded-br-sm px-4 py-3 ml-auto max-w-[80%]): "Write a campaign for our new winter collection"
    - Assistant bubble (bg-[#1A2332] text-[#A0A0A0] rounded-2xl rounded-bl-sm px-4 py-3 max-w-[80%]): "Sure! Here's a draft campaign.\n\nSubject: Warm Up Your Style!\nPreview Text: Discover cozy essentials and new arrivals for the season.\n\nGenerating email body copy..."
  - Fake input bar at bottom: bg-[#1A2332] border border-[#1A1A1A] rounded-xl h-12 flex items-center px-4, placeholder text "Type your brief..." text-[#707070], teal send button circle on right

  **Right panel — "Live Email Preview"** (bg-[#0B1120] p-6):
  - Label "Live Email Preview" at top in text-[#707070] text-xs uppercase tracking-wider
  - Email mockup card (bg-white rounded-xl p-6 max-w-sm mx-auto):
    - Top: small logo placeholder "LOGO" in teal text-[#2DD4BF] font-bold
    - Hero image area: bg-gray-200 rounded-lg h-40 flex items-center justify-center (placeholder)
    - Heading: "New Arrival: The Essential Tee" text-gray-900 font-bold text-lg mt-4
    - Body text: "Discover the perfect blend of comfort and style." text-gray-600 text-sm mt-2
    - Two product cards in a row (flex gap-3 mt-4): each has bg-gray-100 rounded-lg h-24, "Product Name" and "$Price" below
    - CTA button: bg-[#2DD4BF] text-[#0B1120] font-semibold rounded-lg px-6 py-3 text-center mt-4 w-full: "Shop Winter Collection"
  - Bottom bar: two badges "Brand Voice: Matched ✓" and "Shopify Products: Synced ✓" in text-[#2DD4BF] text-xs

---

**SECTION 7: Smart Segmentation — "Animus Builds Your Segments Automatically"** (py-24):

Section heading: "Animus Builds Your Segments Automatically" — text-3xl md:text-4xl font-bold text-white centered
Subtitle: "Based on your actual customer data — purchase frequency, order value, engagement, and lifecycle stage." — text-[#A0A0A0] centered max-w-2xl mx-auto

Build an interactive segmentation dashboard mockup:
- Container: max-w-4xl mx-auto mt-12, bg-[#111827] border border-[rgba(45,212,191,0.15)] rounded-2xl overflow-hidden
- Top bar with window dots and "Animus — Smart Segmentation"
- Grid of 5 segment cards (grid grid-cols-2 md:grid-cols-3 gap-4 p-6):
  1. "VIP Customers" — bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/20 rounded-xl p-4. Large "15%" text-white text-3xl font-bold. "3,675 Users" text-[#A0A0A0] text-sm
  2. "At-Risk Churners" — bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/20. "8%". "1,960 Users"
  3. "New Subscribers" — bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/20. "22%". "5,390 Users"
  4. "Repeat Buyers" — bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20. "35%". "8,575 Users"
  5. "Win-Back Targets" — bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/20. "20%". "4,900 Users"

- Right sidebar within the mockup (on desktop only, w-64): "Auto-Generating Rules..." heading text-[#2DD4BF] text-sm font-medium. List of rules appearing one by one:
  - "Purchase frequency > 3"
  - "Last order > 60 days ago"
  - "Average order value > $100"
  - "Inactive > 90 days"
  - "Signup date < 30 days"
  Each rule: bg-[#0B1120] rounded-lg px-3 py-2 text-[#A0A0A0] text-sm border border-[rgba(45,212,191,0.1)]

- Bottom bar: "Profiles analyzed: 24,500" and "Revenue segments identified: 8" in text-[#2DD4BF] text-sm, separated, bg-[#0B1120] px-6 py-3

- On scroll, the segment cards should animate in with a stagger (scale from 0.95 to 1, opacity 0 to 1, 100ms stagger between cards)

---

**SECTION 8: Before & After — "What Changes When Animus Takes Over Your Email"** (py-24, bg-[#111827]/30):

Section heading: "What Changes When Animus Takes Over Your Email" — text-3xl md:text-4xl font-bold text-white centered

Two-column comparison card (max-w-4xl mx-auto mt-12, flex gap-0, bg-[#111827] rounded-2xl overflow-hidden border border-[rgba(45,212,191,0.15)]):

**Left column — "BEFORE"** (flex-1 p-8, bg-[#111827]):
- "BEFORE" heading in text-[#707070] uppercase tracking-wider text-sm font-bold mb-6, with a small red indicator line (w-12 h-0.5 bg-red-500 mb-2)
- List items (space-y-4), each item: flex items-start gap-3
  - Red icon (X or down arrow, text-red-400 w-5 h-5 mt-0.5 flex-shrink-0)
  - Text in text-[#A0A0A0]
- Items:
  1. "1-2 basic flows"
  2. "One list, no segments"
  3. "Generic templates, broken on mobile"
  4. "15-20% open rate"
  5. "Under $5K/month email revenue"
  6. "10+ hrs/week or $5K/month agency"

**Right column — "AFTER"** (flex-1 p-8, bg-[#0B1120] border-l border-[#2DD4BF]/30):
- "AFTER" heading in text-[#2DD4BF] uppercase tracking-wider text-sm font-bold mb-6, with a teal indicator line (w-12 h-0.5 bg-[#2DD4BF] mb-2)
- List items (space-y-4), each item: flex items-start gap-3
  - Teal checkmark icon (text-[#2DD4BF] w-5 h-5 mt-0.5 flex-shrink-0)
  - Text in text-white font-medium
- Items:
  1. "8+ optimized flows covering every stage"
  2. "5+ revenue-driving segments auto-built"
  3. "Brand-matched, mobile + dark mode tested"
  4. "40-50% open rate"
  5. "Up to 300% revenue increase"
  6. "Zero time — it runs itself"

On scroll, left column slides in from left, right column slides in from right simultaneously.

---

**SECTION 9: Competitive Comparison — "This Isn't a Template Pack, a Course, or a Chatbot"** (py-24, id="compare"):

Section heading: "This Isn't a Template Pack, a Course, or a Chatbot" — text-3xl md:text-4xl font-bold text-white centered

Build a 3-column comparison table (max-w-4xl mx-auto mt-12):

Table with header row and 7 feature rows:
- Container: bg-[#111827] rounded-2xl overflow-hidden border border-[rgba(45,212,191,0.15)]
- Header row (bg-[#0B1120] border-b border-[rgba(45,212,191,0.15)]):
  - Col 1: "Feature" text-[#707070] text-sm font-medium
  - Col 2: "DIY / Manual" text-[#707070] text-sm font-medium
  - Col 3: "Agency" text-[#707070] text-sm font-medium
  - Col 4: "Animus" text-[#2DD4BF] text-sm font-bold — this column has a top highlight border (border-t-2 border-[#2DD4BF]) and bg-[#2DD4BF]/5

Feature rows (alternating bg-[#111827] and bg-[#0B1120]/50, each row px-6 py-4):

| Feature | DIY / Manual | Agency | Animus |
|---|---|---|---|
| Setup Time | 50+ hours (text-[#A0A0A0]) | 2-4 weeks (text-[#A0A0A0]) | **5 Min** (text-[#2DD4BF] font-bold) + green checkmark |
| Monthly Cost | $0 (your time) (text-[#A0A0A0]) | $5,000-$15,000/mo (text-[#A0A0A0]) | **$0 after setup** (text-[#2DD4BF]) + green checkmark |
| Brand Training | Red X icon | "Partial" text-[#F59E0B] | Green checkmark (text-[#22C55E]) |
| Runs 24/7 | Red X icon | Red X icon | Green checkmark |
| Learns Over Time | Red X icon | Red X icon | Green checkmark |
| Connected to Your Store | Red X icon | "Manual" text-[#A0A0A0] | **Live sync** (text-[#2DD4BF]) + green checkmark |
| Ongoing Strategy & Research | Red X icon | Red X icon | Green checkmark |

Red X: use a circle with X, text-red-400
Green checkmark: text-[#22C55E] using a check icon

The "Animus" column should visually stand out with a subtle teal background tint (bg-[#2DD4BF]/5) on all rows.

---

**SECTION 10: Flow Builder Mockup — "Animus Designs Your Entire Flow Architecture"** (py-24):

Section heading: "Animus Designs Your Entire Flow Architecture" — text-3xl md:text-4xl font-bold text-white centered
Subtitle: "Complete welcome sequences, abandoned cart recovery, post-purchase nurture, and win-back flows — all optimized for your store." — text-[#A0A0A0] centered max-w-2xl mx-auto

Build a Flow Builder mockup (NOT an image):
- Container: max-w-5xl mx-auto mt-12, bg-[#111827] border border-[rgba(45,212,191,0.15)] rounded-2xl overflow-hidden shadow-2xl shadow-[#2DD4BF]/5
- Top bar with dots + "Animus — Flow Builder"
- Split layout:
  **Left: Flow diagram** (flex-1 p-6):
  - Build a simplified visual flow chart using div nodes and connecting lines:
    - "New Customer Trigger" (bg-[#0B1120] border border-[#2DD4BF] rounded-lg px-4 py-2 text-white text-sm) at top center
    - Arrow down (teal line)
    - "Welcome Email" node (bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 rounded-lg px-4 py-2 text-[#2DD4BF] text-sm) — with small "Sent: 24.5k" badge
    - Diamond decision node "Opened?" (rotated 45deg square, border border-[#2DD4BF]/50, text-xs text-[#A0A0A0])
    - Branch left: "No" → "Re-engagement" (bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B])
    - Branch right: "Yes" → "Follow-up Path" (bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E])
    - Under re-engagement: "Reminder Email" → "Win-back Series"
    - Under follow-up: "Product Showcase" → "Discount Offer"
  - Use flex/grid layout to approximate a flow chart. Connecting lines can be simple vertical/horizontal borders in teal.

  **Right: Performance stats** (w-64 p-6 bg-[#0B1120] border-l border-[rgba(45,212,191,0.1)]):
  - "Performance Overview" heading text-white text-sm font-medium
  - "$8,200" large text-white text-3xl font-bold, "Revenue" text-[#707070] text-xs, small green up arrow
  - "67%" text-[#2DD4BF] text-2xl font-bold, "Open Rate" text-[#707070] text-xs
  - "12%" text-white text-2xl, "Conversion Rate" text-[#707070] text-xs
  - "22,450" text-white text-2xl, "Active Contacts" text-[#707070] text-xs
  - Divider line
  - "Email Preview" heading, small email preview card (bg-[#111827] rounded-lg p-3 border border-[rgba(45,212,191,0.1)]):
    - Small logo "Animus" text-[#2DD4BF] text-xs
    - "Welcome to Animus!" text-white text-xs font-medium
    - 2 lines of tiny placeholder body text in text-[#707070] text-[10px]
    - Small teal button "Explore Your Dashboard" bg-[#2DD4BF] text-[#0B1120] text-[10px] rounded px-2 py-1

---

**SECTION 11: Why Animus — Agency vs Animus** (py-24, bg-[#111827]/30):

Section heading: "Why Animus?" — text-3xl md:text-4xl font-bold text-white centered

Two cards side by side (max-w-4xl mx-auto mt-12 flex gap-6, stack on mobile):

**Left card — "Traditional Agency"** (flex-1, bg-[#111827] border border-[#1A1A1A] rounded-2xl p-8):
- Heading: "Traditional Agency" text-[#A0A0A0] text-lg font-semibold, with a briefcase icon
- List (space-y-4 mt-6):
  - "$5,000–$15,000/month" text-[#A0A0A0]
  - "Weeks to onboard" text-[#A0A0A0]
  - "Limited by human availability" text-[#A0A0A0]
  - "Scope creep and miscommunication" text-[#A0A0A0]
  - "Generic templates across clients" text-[#A0A0A0]
- Each item has a small grey icon on the left (coins, clock, users, message-x, copy icons)

**Right card — "Animus"** (flex-1, bg-[#0B1120] border border-[#2DD4BF]/30 rounded-2xl p-8, shadow-lg shadow-[#2DD4BF]/10):
- Heading: "Animus" text-[#2DD4BF] text-lg font-semibold, with the Animus brain icon or rocket
- List (space-y-4 mt-6):
  - "Minutes to set up" text-white font-medium
  - "Available 24/7" text-white font-medium
  - "Precise execution from your data" text-white font-medium
  - "Built from YOUR brand kit" text-white font-medium
  - "Learns and optimizes over time" text-white font-medium
- Each item has a teal icon on the left (zap, clock, target, palette, brain icons — all text-[#2DD4BF])

The Animus card should have a subtle animated teal border glow (use box-shadow animation).

---

**SECTION 12: Pricing** (py-24, id="pricing"):

Section heading: "Simple, Transparent Pricing" — text-3xl md:text-4xl font-bold text-white centered
Subtitle: "One plan. Everything included. Cancel anytime." — text-[#A0A0A0] centered

Single pricing card centered (max-w-md mx-auto mt-12, bg-[#111827] border border-[#2DD4BF]/30 rounded-2xl p-8 shadow-lg shadow-[#2DD4BF]/10):
- Badge at top: "Early Access" pill (bg-[#2DD4BF]/10 text-[#2DD4BF] text-sm rounded-full px-3 py-1)
- Plan name: "Animus Pro" text-white text-2xl font-bold mt-4
- Price: "Coming Soon" text-white text-4xl font-bold mt-2 (placeholder — pricing TBD)
- Subtitle: "Join the waitlist for early access pricing" text-[#A0A0A0] text-sm mt-1
- Feature list with teal checkmarks (mt-6, space-y-3):
  - Unlimited Klaviyo audits
  - Unlimited email generation
  - Automated segmentation
  - Visual email editor
  - One-click Klaviyo push
  - Shopify integration
  - Competitor research
  - Ongoing optimization
  - Priority support
- CTA: "Join Waitlist" teal button (bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#0B1120] font-semibold w-full py-4 rounded-xl mt-8 text-lg)
- Below: "No credit card required" text-[#707070] text-sm mt-3 text-center

---

**SECTION 13: FAQ** (py-24, id="faq"):

Section heading: "Frequently Asked Questions" — text-3xl md:text-4xl font-bold text-white centered

Accordion style (max-w-2xl mx-auto mt-12):

1. "What is Animus?" → "Animus is your autonomous email marketing operator. It connects to your Shopify and Klaviyo accounts, audits your entire email program, identifies revenue opportunities, builds segments, generates on-brand emails, and pushes them directly to Klaviyo — all on autopilot."
2. "How does the audit work?" → "Animus connects to your Klaviyo and Shopify accounts, analyzes your metrics against industry benchmarks, researches your competitors, and identifies the highest-impact revenue opportunities — all automatically. You get a health score, gap analysis, and prioritized action plan."
3. "How long does setup take?" → "Under 5 minutes. Connect your Shopify and Klaviyo accounts, configure your brand colors and fonts, and Animus handles the rest. Your first audit results are ready in about 15 minutes."
4. "Do I need a Klaviyo account?" → "Yes, Animus integrates directly with Klaviyo. You'll need a Klaviyo account with API access to use the platform."
5. "Can I edit the emails before pushing?" → "Absolutely. Every generated email opens in a visual drag-and-drop editor where you can modify text, images, colors, and layout. You can also describe changes in plain English — like 'make the headline bigger' or 'swap the hero image' — and Animus updates it instantly."
6. "What Shopify data do you access?" → "We use read-only access to your products, customers, and orders. This data helps Animus understand your business for better segmentation and email personalization. Your data is encrypted and never shared."
7. "Can I cancel anytime?" → "Yes, there are no contracts. Cancel your subscription anytime from the settings page."
8. "What makes Animus different from other email tools?" → "Other tools give you templates and leave you to figure it out. Animus studies your entire business — your products, customers, brand, and email performance — then builds and executes a complete strategy. It's not a tool you use. It's an operator that works for you."

Each FAQ item: button with text-left w-full, border-b border-[#1A1A1A], py-5. Click toggles the answer with smooth height transition. Chevron icon on the right that rotates 180deg on open (transition-transform duration-200). Question: text-white font-medium. Answer: text-[#A0A0A0] mt-3 leading-relaxed. Open state: chevron text-[#2DD4BF].

---

**SECTION 14: Final CTA** (py-24):

Centered content (max-w-2xl mx-auto text-center):
- Heading: "Ready to Put Your Email Marketing on Autopilot?" — text-3xl md:text-4xl font-bold text-white
- Subtitle: "Join merchants who are scaling revenue with Animus." — text-[#A0A0A0] mt-4
- CTA: "Get Early Access" (bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#0B1120] px-10 py-4 rounded-xl font-semibold text-lg mt-8 inline-block shadow-lg shadow-[#2DD4BF]/20 hover:shadow-[#2DD4BF]/30 transition-all) → /signup
- Below: "No credit card required · Set up in minutes" text-[#707070] text-sm mt-4

---

**Footer** (py-12, bg-[#0B1120] border-t border-[#1A1A1A]):
- 4-column layout on desktop, stacked on mobile (max-w-6xl mx-auto px-6)
- Col 1: "Animus" logo text + tagline "Your autonomous email operator" text-[#707070] text-sm
- Col 2: Product — Features, How It Works, Pricing, FAQ (text-[#A0A0A0] hover:text-white text-sm space-y-2)
- Col 3: Company — About, Blog (placeholder), Contact (same style)
- Col 4: Legal — Privacy Policy, Terms of Service (same style)
- Bottom bar (mt-8 pt-8 border-t border-[#1A1A1A]): "© 2026 Animus. All rights reserved." text-[#404040] text-sm

---
---

### /login
- Full page bg-[#0B1120]
- Centered card (bg-[#111827] border border-[rgba(45,212,191,0.15)] rounded-2xl p-8 max-w-md)
- "Welcome back" heading text-white text-2xl font-bold
- Subtitle: "Sign in to your Animus account" text-[#A0A0A0] text-sm mt-1
- Email + password inputs (bg-[#1A2332] border border-[#1A1A1A] text-white rounded-xl px-4 py-3 focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#2DD4BF]/30 outline-none)
- "Sign In" teal button (bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#0B1120] font-semibold w-full py-3 rounded-xl mt-4)
- "Forgot password?" link below (text-[#2DD4BF] hover:text-[#5EEAD4] text-sm mt-3)
- "Don't have an account? Sign up" at bottom (text-[#A0A0A0], "Sign up" in text-[#2DD4BF])

### /signup
- Same card style as login
- "Create your account" heading
- Email, password, confirm password inputs
- "Create Account" teal button
- On success: swap form for "Check your email to confirm your account" with a mail icon (text-[#2DD4BF])
- "Already have an account? Sign in" at bottom

### /forgot-password
- Same card style
- "Reset your password" heading
- Email input + "Send Reset Link" teal button
- Shows confirmation message after submit

### /reset-password
- Same card style
- New password + confirm password
- "Update Password" teal button

### /auth/callback (route handler)
- Exchanges auth code for session
- Queries merchants table for merchant_state
- Redirects to /onboarding or /chat accordingly

---

### /onboarding (Protected)
Multi-step form with progress indicator:
- Clean centered card layout (max-w-lg, bg-[#111827] border border-[rgba(45,212,191,0.15)] rounded-2xl p-8)
- Step indicator at top: 3 circles connected by lines. Active = bg-[#2DD4BF] with pulse animation, completed = bg-[#22C55E] with checkmark, inactive = bg-[#1A1A1A] border border-[#404040]
- Reads merchant_state to determine which step to show

Step 1 (onboarding_shopify):
- Heading: "Connect your Shopify store" text-white
- Subtext: "We'll sync your products, customers, and orders" text-[#A0A0A0]
- Input: store URL (*.myshopify.com) with validation
- "Connect Shopify" teal button
- POSTs to /api/onboarding/shopify-connect

Step 2 (onboarding_klaviyo):
- Heading: "Connect your Klaviyo account"
- Subtext: "We need your private API key to analyze your email performance" text-[#A0A0A0]
- Input: API key (masked with dots, font-mono, bg-[#1A2332])
- Help link: "Where do I find this?" (text-[#2DD4BF])
- "Connect Klaviyo" teal button
- POSTs to /api/onboarding/klaviyo-connect

Step 3 (onboarding_brand):
- Heading: "Set up your brand"
- Subtext: "These will be used to generate on-brand emails" text-[#A0A0A0]
- Fields: primary color (color picker + hex input), secondary color, heading font (dropdown), body font (dropdown), logo URL
- "Complete Setup" teal button
- POSTs to /api/onboarding/brand-config

Step 4 (loading):
- "Setting up your workspace..."
- Animated spinner (border-[#2DD4BF] border-t-transparent) with "Preparing your first audit..." text-[#A0A0A0]
- Auto-redirects to /chat after 3 seconds

---

### /chat (Protected) — CORE PAGE

Two-column layout, full height:

**Left sidebar** (w-[280px], bg-[#111827], border-r border-[rgba(45,212,191,0.15)], h-screen, fixed):
- "New Chat" button at top (bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#0B1120] rounded-xl py-2.5 w-full font-medium mt-4 mx-4 transition-all)
- Conversation list below (scrollable, fetched from GET /api/conversations, px-2 mt-4)
  - Each item: rounded-lg px-3 py-2.5 cursor-pointer transition-all
  - Title truncated + relative time (text-xs text-[#707070])
  - Active: bg-[#0B1120] text-white border-l-2 border-[#2DD4BF]
  - Hover: bg-[#0B1120]/50
- Bottom: user email (text-xs text-[#707070] px-4) + "Sign Out" button (text-[#707070] hover:text-white text-xs)

**Right panel** (ml-[280px], flex flex-col h-screen, bg-[#0B1120]):

**Empty state** (when no conversation selected):
- Centered content (flex-1 flex items-center justify-center):
  - Teal icon at top (text-[#2DD4BF] text-4xl)
  - "Welcome to Animus" — text-2xl font-bold text-white mt-4
  - "Start a conversation to audit your account, generate emails, or get marketing advice." — text-[#A0A0A0] mt-2 max-w-md text-center
  - 3 suggestion cards in a row (flex gap-3 mt-8): "Audit my Klaviyo account", "Create a welcome email", "Analyze my competitors" — each is a clickable card (bg-[#111827] border border-[rgba(45,212,191,0.15)] rounded-xl p-4 hover:border-[#2DD4BF]/30 cursor-pointer transition-all text-[#A0A0A0] hover:text-white text-sm) that when clicked, creates a new conversation and sends that message

**Message area** (flex-1, overflow-y-auto, px-4 py-6, scroll-smooth):
- Messages rendered based on `message_type` field:

  **"text"** messages:
  - User: right-aligned, bg-[#2DD4BF] text-[#0B1120] rounded-2xl rounded-br-sm px-4 py-3 max-w-[70%] ml-auto font-medium
  - Assistant: left-aligned, bg-[#111827] text-[#A0A0A0] rounded-2xl rounded-bl-sm px-4 py-3 max-w-[70%]

  **"audit_result"** messages:
  - Full-width card (bg-[#111827] border border-[rgba(45,212,191,0.15)] rounded-2xl p-6 max-w-2xl):
  - Parse the JSON content field
  - Top: "Audit Complete" badge (bg-[#2DD4BF]/10 text-[#2DD4BF] text-xs rounded-full px-3 py-1) + health_score as a large circular progress indicator (use an SVG circle with stroke-dasharray, stroke color = #2DD4BF, background stroke = #1A1A1A, score number in the center text-white text-3xl font-bold)
  - Summary text below the score text-[#A0A0A0]
  - Opportunities list: each opportunity is a card (bg-[#0B1120] rounded-xl p-4 mt-3 border border-[rgba(45,212,191,0.1)]) with:
    - Checkbox on the left (accent-[#2DD4BF], w-5 h-5)
    - Title (font-semibold text-white)
    - Category pill badge (text-xs bg-[#2DD4BF]/10 text-[#2DD4BF] rounded-full px-2 py-0.5)
    - estimated_monthly_revenue displayed as "+$X,XXX/mo" in text-[#22C55E] font-semibold
    - Description in text-[#A0A0A0] text-sm mt-1
    - Priority indicator (high = red dot, medium = #F59E0B dot, low = #22C55E dot)
  - "Confirm Selected Opportunities" teal button at bottom (bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#0B1120] font-semibold w-full py-3 rounded-xl mt-4)
  - When clicked: sends selected opportunity IDs as a chat message

  **"email_components"** messages:
  - Card (bg-[#111827] border border-[rgba(45,212,191,0.15)] rounded-2xl p-4 max-w-sm):
  - Email icon at top (text-[#2DD4BF])
  - Template name (from metadata) text-white font-medium
  - Mini preview area (bg-[#0B1120] rounded-lg h-40 flex items-center justify-center, showing a simplified email mockup)
  - "Open in Editor" teal button → links to /editor?templateId={metadata.template_id}

**Typing indicator** (shown when isLoading):
- 3 animated dots (bg-[#2DD4BF] rounded-full w-2 h-2) with staggered animation delays (0ms, 200ms, 400ms), bouncing up and down

**Supabase Realtime** — Subscribe to messages table for active conversation:
```typescript
const channel = supabase
  .channel(`messages:${conversationId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  }, (payload) => {
    setMessages(prev => [...prev, payload.new])
  })
  .subscribe()
```
Clean up subscription on unmount or conversation change.

**Input bar** (border-t border-[rgba(45,212,191,0.15)] p-4 bg-[#0B1120]):
- Textarea + send button in a container (bg-[#1A2332] border border-[#1A1A1A] rounded-2xl flex items-end px-4 py-3 focus-within:border-[#2DD4BF]/30)
- Textarea: no visible border, bg-transparent, text-white placeholder-[#707070] placeholder: "Message Animus...", auto-resize (min-h-[24px] max-h-[120px]), resize-none
- Send button: w-9 h-9 bg-[#2DD4BF] hover:bg-[#5EEAD4] rounded-full flex items-center justify-center ml-2 transition-all (white arrow-up icon inside)
- Enter to send, Shift+Enter for new line
- Disable send button when input is empty (opacity-50 cursor-not-allowed)

---

### /editor (Protected)
- Placeholder page with a 3-panel mockup:
  - Left panel (w-64): "Blocks" heading, list of block types (Heading, Text, Image, Button, Spacer, Divider) as draggable-looking cards
  - Center panel (flex-1): "Email Preview" — show a sample email layout
  - Right panel (w-72): "Properties" — show form fields for editing selected block
- All panels: bg-[#111827] with teal-tinted borders
- "Back to Chat" link at top left (text-[#2DD4BF])

### /settings (Protected)
- Max-w-2xl centered on bg-[#0B1120]
- Tab navigation: Profile | Integrations | Billing (tabs: text-[#A0A0A0], active: text-white border-b-2 border-[#2DD4BF], py-3 px-4 cursor-pointer)
- Profile: email display, account created date, "Change Password" button (border border-[rgba(45,212,191,0.15)])
- Integrations:
  - Shopify card (bg-[#111827] rounded-xl p-6 border border-[rgba(45,212,191,0.15)]): connection status (#22C55E dot + "Connected" or #707070 + "Not Connected"), store URL
  - Klaviyo card (same style): connection status, API key masked (show last 4 chars)
- Billing: current plan name, status badge, "Manage Subscription" button → calls /api/billing/portal

### /subscribe (Protected)
- Centered pricing card matching the landing page pricing section
- "Subscribe Now" teal button → calls /api/billing/create-checkout → redirects to Stripe

---

## Shared Protected Layout
- Left sidebar (same as chat sidebar) with navigation
- Nav items: Chat (message icon), Settings (gear icon) — text-[#707070], active: text-white bg-[#0B1120] border-l-2 border-[#2DD4BF]
- Mobile: sidebar collapses, hamburger menu to toggle (overlay sidebar with backdrop)

## API Routes — DO NOT CREATE

All API routes already exist in the codebase. The frontend should call:
- POST /api/chat → { message, conversationId } → returns { role, content, type, metadata? }
- POST /api/conversations → returns { id, created_at }
- GET /api/conversations → returns conversation list
- GET /api/conversations/[id]/messages → returns messages array
- POST /api/onboarding/shopify-connect → { shop }
- POST /api/onboarding/klaviyo-connect → { apiKey }
- POST /api/onboarding/brand-config → { primaryColor, secondaryColor, fontHeading, fontBody, logoUrl }
- POST /api/push-to-klaviyo → { templateId }
- GET /api/templates → returns templates list

DO NOT create any API route files. They are handled by the backend.

## Responsive Design
- All pages must be fully responsive
- Sidebar collapses on mobile (< 768px) with hamburger toggle
- Landing page grids: 3 cols → 2 cols → 1 col
- Landing page mockups: simplify on mobile (hide right sidebar panels, stack layouts)
- Chat input bar stays fixed at bottom on mobile
- Navigation becomes hamburger menu on mobile
- Before/After section stacks vertically on mobile
- Comparison table scrolls horizontally on mobile
- Timeline goes vertical on mobile

## Animations & Interactions
- All landing page sections: fade-in + slight translate-y on scroll (use Intersection Observer with threshold 0.1)
- Stagger animations for grid items (feature cards, segment cards, timeline steps): each item delays 100-150ms after the previous
- Hero gradient orb: slow scale pulse animation (custom @keyframes, 6s infinite)
- Card hover states: border-[#2DD4BF]/30 with transition-all duration-300
- Teal glow effects on key elements: box-shadow: 0 0 30px rgba(45, 212, 191, 0.1)
- Timeline connecting lines: animated gradient flow left-to-right (CSS background-position animation)
- Before/After: slide in from opposite sides on scroll
- FAQ accordion: smooth max-height transition with overflow-hidden
- Dashboard mockup in hero: translate-y on scroll for parallax feel
- Button hover: subtle lift (translate-y-[-1px]) + increased shadow
- Focus states on inputs: border-[#2DD4BF] ring-1 ring-[#2DD4BF]/30

Push to GitHub repo connected to this project.
