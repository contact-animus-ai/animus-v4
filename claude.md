# Animus V2: The Complete Implementation Guide

**To:** Phillip Vo
**From:** Manus AI (Your Strategic Co-founder)
**Date:** March 4, 2026
**Version:** 2.0
**Subject:** This is the definitive, step-by-step playbook for building and launching Animus as a scalable, multi-merchant SaaS product. It replaces all previous guides and is architected around the n8n, Claude Code, Kombai, and Thesys stack.

---

## Introduction: The Operator Stack

This document is the executable plan for building Animus V2. The previous guide was a prototype; this is the production architecture. We are not just building a tool; we are building an autonomous, AI-powered marketing operator that merchants can hire.

The core shift is moving from a manually configured system (Make.com) to a code-driven, programmatically generated one. You will not be building this by clicking buttons in a UI. You will be directing a team of AI agents to build it for you.

**Your Development Environment:**

- **The Cockpit:** Antigravity IDE. This is where you will manage the project.
- **The Architect:** Gemini. You will use it within Antigravity for high-level planning and architecture.
- **The Engineer:** Claude Code (as an extension in Antigravity). It will read the plans from Gemini and write the production code, n8n workflows, and UI components.

Follow this guide sequentially. Each phase builds upon the last, resulting in a robust, defensible, and first-to-market product.

---

## Pre-flight Checklist: The Animus V2 Stack

Before you begin, create accounts for all services. This is the definitive stack.

| Layer | Service | Purpose | Setup Action |
| :--- | :--- | :--- | :--- |
| **Frontend Shell** | Lovable | AI Code Generation (for initial app scaffold) | [Sign up](https://lovable.dev) |
| **Deployment** | Vercel | Frontend Hosting & Serverless Functions | [Sign up](https://vercel.com) (Hobby/Free tier) |
| **Database & Auth** | Supabase | User Management, Database | [Create Project](https://supabase.com) (Free tier) |
| **Automation Engine** | n8n | **Core Backend Orchestration** | [Sign up for n8n Cloud](https://n8n.cloud) or self-host |
| **Brand Component System** | Kombai | AI-Powered Design System Ingestion | [Sign up](https://www.kombai.com/) |
| **Generative UI** | Thesys | Interactive AI Dashboard & Results UI | [Sign up](https://www.thesys.com/) |
| **Payments** | Stripe | Subscription Billing | [Create Account](https://stripe.com) (Test Mode) |
| **Email Execution** | Klaviyo | Pushing Final HTML Templates | You have an account. |
| **Research Engine** | Manus AI | Async Audits & Strategy | You have an account. |
| **Build Environment** | Antigravity IDE | Your local development environment | [Download](https://antigravity.dev) |
| **Code Generation** | Claude API | The engine for your AI Engineer | You have an Anthropic account. |
| **Source Control** | GitHub | Code Repository | You have an account. |

---

## Phase 1: Core Infrastructure & Scaffolding

**Objective:** To establish the foundational code, database, and deployment pipeline.

**Testable Outcome:** A live URL on Vercel showing a default marketing page, connected to a GitHub repo and a fully configured Supabase database.

### Action 1.1: Set Up Your AI Development Environment

1.  Install **Antigravity IDE** on your local machine.
2.  Inside Antigravity, go to Extensions and install the **Claude Code** extension.
3.  Configure the extension with your Anthropic API key.
4.  Create a new project folder on your machine named `animus-v2` and open it in Antigravity.

### Action 1.2: Create the Supabase Database Schema

This schema is robust and multi-tenant. It is unchanged from the previous guide.

1.  In Antigravity, open a new terminal.
2.  Use the following prompt with your Claude Code agent:

    ```
    You are an expert database architect. Here is the complete SQL script to create the 7-table schema for the Animus application in Supabase. I will paste this into the Supabase SQL Editor. Review it for correctness and confirm it is ready.

    [Paste the entire SQL script from the previous guide's Action 1.1 here]
    ```
3.  Once Claude confirms, navigate to your Supabase project's **SQL Editor**, paste the script, and click **RUN**.

### Action 1.3: Generate the Frontend Shell with Lovable

We use Lovable for one job: to generate the initial Next.js boilerplate. We will then take over development in Antigravity.

1.  Go to Lovable and start a new project.
2.  Use the exact same prompt from the previous guide's **Action 1.2** to create the Next.js app with Supabase integration, a marketing page, and a protected `/chat` route.
3.  Once Lovable generates the code and pushes it to GitHub, **clone that repository into your `animus-v2` folder.** You are now taking over development locally.

### Action 1.4: Deploy to Vercel

Follow the exact steps from the previous guide's **Action 1.3** to import the new GitHub repo into Vercel, set the Supabase environment variables, and deploy.

---

## Phase 2: Code-Driven Backend with n8n

**Objective:** To replace the manual Make.com backend with a scalable, code-driven n8n architecture.

**Testable Outcome:** The chat UI can send a message to a secure API route, which triggers an n8n workflow and returns a hardcoded response.

### Action 2.1: Set Up n8n

1.  Log in to your n8n Cloud account (or local instance).
2.  Create a new workflow named **"[Router] Main Animus Engine"**.
3.  The trigger for this workflow is **Webhook**. Create a new webhook named "Animus Chat Receiver".
4.  **Copy the TEST URL.** We will use this for development.
5.  In your Vercel project settings, add this URL as an environment variable: `N8N_WEBHOOK_URL`.

### Action 2.2: Build the API Route with Claude Code

Now, we use your new AI Engineer. In Antigravity, give Claude Code the following prompt:

```
I am replacing Make.com with n8n. You need to rewrite the backend connection.

1. Create a new API route at `/api/chat`.
2. This route should securely forward the user's message, conversation history, and user ID to the webhook URL stored in the `N8N_WEBHOOK_URL` environment variable.
3. It should then wait for the response from n8n and stream it back to the frontend.
4. Update the frontend chat component to call this new API route instead of the old one.
```

### Action 2.3: Create the n8n Test Workflow

In your n8n workflow:

1.  After the Webhook trigger, add a **Respond to Webhook** node.
2.  In the body, enter the following JSON:

    ```json
    {
      "role": "assistant",
      "content": "Animus V2 is connected via n8n."
    }
    ```
3.  **Save and activate the workflow.**

### Action 2.4: Test the Full Loop

1.  Redeploy your Vercel app to apply the changes.
2.  Go to the `/chat` page, send a message.
3.  **Verification:** The message "Animus V2 is connected via n8n." should appear in the chat.

---

## Phase 3: The Kombai Onboarding Flow

**Objective:** To create the core onboarding experience where Animus ingests a new merchant's brand and generates a locked component library.

**Testable Outcome:** A new user can provide their website URL. An n8n workflow is triggered that uses Kombai to analyze the site and stores a generated set of brand-consistent UI components in Supabase.

### Action 3.1: Design the Onboarding UI

Use Claude Code in Antigravity to build a new protected route: `/onboarding`.

```
Create a new page at `/onboarding`. It should be a simple, multi-step form.

Step 1: "Welcome to Animus. What is your store's website URL?" (Text input)
Step 2: "Connect your Klaviyo account." (API Key input)
Step 3: "Analyzing your brand..." (Loading state)

When the user submits the URL and API key, POST this data to a new API route: `/api/onboarding`.
```

### Action 3.2: Build the Kombai n8n Workflow

This is a new, separate n8n workflow named **"[Onboarding] Brand Ingestion"**.

1.  **Trigger:** A new **Webhook** named "Onboarding Receiver". Add the URL to Vercel as `N8N_ONBOARDING_URL` and have your `/api/onboarding` route call it.
2.  **Kombai Node:** Add an **HTTP Request** node to call the Kombai API. You will need to add your Kombai API key to n8n's credentials.
    - **URL:** `https://api.kombai.com/v1/ingest` (or similar, check their docs)
    - **Body:** Send the website URL received from the webhook.
3.  **Data Processing:** The Kombai API will return a structured JSON object representing the merchant's design system (colors, fonts, spacing) and a set of generated components.
4.  **Supabase Node:** Add a **Supabase > Insert / Upsert Record** node. Store the generated design system and components in the `brand_configs` table, linked to the user's ID.

### Action 3.3: Test the Onboarding

1.  Go to the `/onboarding` page.
2.  Enter a URL (e.g., `https://naeon.co`).
3.  **Verification:** Check your n8n workflow history for a successful run. Then, check the `brand_configs` table in Supabase. There should be a new entry containing the JSON output from Kombai.

---

## Phase 4: The Thesys Dashboard & Manus Integration

**Objective:** To build the main Animus cockpit using Thesys and integrate the asynchronous research capabilities of Manus AI.

**Testable Outcome:** The `/chat` page is now a Thesys-powered dashboard. Triggering an audit results in a Manus task running, and the results are pushed back to the Thesys UI as an interactive component.

### Action 4.1: Replace the Chat UI with Thesys

1.  Sign up for Thesys and create a new project.
2.  Thesys provides a React component or a similar SDK. Use Claude Code to replace the simple `ChatView` component with the Thesys component.
3.  The Thesys component will connect to an n8n workflow endpoint. Update your **"[Router] Main Animus Engine"** workflow. Instead of responding directly, it will now have steps that push updates to Thesys.

### Action 4.2: Re-architect the Manus Workflow

This follows the same asynchronous pattern as the old guide, but with n8n and Thesys.

1.  **Main Engine (n8n):** Add a router path that filters for the word "audit". This path calls the Manus API to start the task.
2.  **Completion Handler (n8n):** Create a new workflow, **"[Handler] Manus Completion"**, triggered by a webhook from Manus when a task finishes.
3.  **Push to Thesys:** Instead of inserting a message into Supabase, this handler workflow now makes an API call to **Thesys**, pushing the structured data from the Manus result.
4.  **Thesys Renders:** Thesys receives this data and automatically renders it in the dashboard as a pre-defined component (e.g., an "Audit Report" card).

### Action 4.3: Test the Audit Loop

1.  From the Thesys-powered UI, type "audit my competitor, [URL]".
2.  **Verification 1:** A loading state appears in the UI, managed by Thesys.
3.  **Verification 2:** A Manus task starts.
4.  **Verification 3:** When the task finishes, a new, interactive audit report component appears in the Thesys dashboard.

---

## Subsequent Phases: Building the Operator

With this new architecture in place, the remaining phases from the old guide can be implemented far more quickly and robustly.

-   **Phase 5: Claude Email Generation:** This becomes another path in the main n8n router. Claude Code generates the structured JSON for the email, which is passed to the frontend.
-   **Phase 6: The Visual Email Editor:** This UI is built with Claude Code, using the Kombai-generated components as its library. It lives inside a panel in the Thesys dashboard.
-   **Phase 7: Push to Klaviyo:** The editor has a "Push to Klaviyo" button that triggers a final n8n workflow, which takes the finalized HTML and uses the Klaviyo API to create the template.

This guide provides the strategic framework. Your job is to use your AI Engineer (Claude Code in Antigravity) to execute it, one phase at a time. Prompt it with the objectives for each action item, and it will build the system for you. This is how we build Animus V2. 
