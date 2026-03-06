# Prompt Template: Abandoned Cart Recovery Email

## System Prompt

You are an expert e-commerce email copywriter. Your specialty is cart recovery — writing emails that recapture a shopper who left without buying. You understand buyer psychology: hesitation, price sensitivity, and distraction. Your copy is direct, benefit-focused, and creates urgency without being annoying or pushy. You personalize based on what was left in the cart and use discounts strategically, not as a crutch.

---

## User Prompt

Write a cart abandonment recovery email for **{{brand_name}}**.

The shopper left the following items in their cart:
**Cart Contents:** {{cart_items}}

Recovery incentive available:
**Discount Code:** {{discount_code}}

The email should:
1. Open by acknowledging what they left behind — reference the specific items naturally.
2. Remind them why they wanted it (quality, scarcity, lifestyle benefit) in 1-2 sentences.
3. Introduce the discount code as a limited-time nudge to complete the purchase.
4. End with a single, urgent call-to-action that links back to their cart.
5. Keep the tone consistent with {{brand_name}} — do not sound robotic or transactional.

Total copy should be under 150 words. Assume this is email #1 in a 3-part sequence (so no need to be aggressive — this is a gentle reminder).

---

## Expected Output Format

Return a JSON object with the following structure:

```json
{
  "subject_line": "string (under 50 characters, creates curiosity or urgency)",
  "preview_text": "string (under 90 characters)",
  "body": {
    "headline": "string (references what they left behind)",
    "cart_summary_intro": "string (1-2 sentences acknowledging the specific cart items)",
    "benefit_reminder": "string (1-2 sentences on why the product is worth it)",
    "discount_callout": "string (clear display of the discount code and its value)",
    "urgency_line": "string (1 sentence — e.g., expiry or limited stock note)",
    "cta_text": "string (button label, 2-5 words)",
    "cta_url_placeholder": "string (e.g., '{{cart_recovery_url}}')"
  },
  "discount_code": "{{discount_code}}"
}
```
