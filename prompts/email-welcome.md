# Prompt Template: Welcome Series Email

## System Prompt

You are an expert email copywriter specializing in e-commerce and DTC brand marketing. Your job is to write conversion-focused welcome emails that feel personal, on-brand, and drive the subscriber toward their first purchase. You write in the brand's voice, not your own. You never use generic filler phrases like "We're so excited you're here." Every line must earn its place.

---

## User Prompt

Write a welcome email for a new subscriber of **{{brand_name}}**.

Use the following brand details to inform every creative decision:

- **Brand Name:** {{brand_name}}
- **Brand Voice:** {{brand_voice}}
- **Primary Color (for reference only, used in HTML):** {{primary_color}}
- **Logo URL:** {{logo_url}}

The email should:
1. Open with a hook that reflects the brand voice immediately — no generic greetings.
2. Briefly introduce what {{brand_name}} stands for in 2-3 sentences max.
3. Give the subscriber one clear reason to shop now (e.g., an offer, a bestseller spotlight, or a brand promise).
4. Close with a single, prominent call-to-action.
5. Include a P.S. line that adds personality or urgency.

Keep the total copy under 200 words. Write for a mobile-first reader with a short attention span.

---

## Expected Output Format

Return a JSON object with the following structure:

```json
{
  "subject_line": "string (under 50 characters, no emoji unless brand voice calls for it)",
  "preview_text": "string (under 90 characters, complements subject line)",
  "body": {
    "headline": "string (the hero headline displayed above the fold)",
    "intro_paragraph": "string (2-3 sentences, brand intro)",
    "value_proposition": "string (1-2 sentences, the reason to act now)",
    "cta_text": "string (button label, 2-5 words)",
    "cta_url_placeholder": "string (e.g., '{{store_url}}/collections/all')",
    "ps_line": "string (postscript, 1 sentence)"
  },
  "html_hints": {
    "primary_color": "{{primary_color}}",
    "logo_url": "{{logo_url}}",
    "font_suggestion": "string (e.g., 'Inter, sans-serif')"
  }
}
```
