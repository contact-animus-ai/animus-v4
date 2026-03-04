# Animus: Capabilities & Requirements Specification (v6)

**Version:** 6.0
**Date:** 2026-03-04
**Status:** Final

---

## 1. Overall Architecture

Animus is a multi-agent system designed to provide automated, research-backed email marketing strategy and execution for e-commerce merchants. It comprises a custom web application for the user interface and a powerful backend orchestration engine built on Make.com.

| Category | Component | Technology | Purpose |
|---|---|---|---|
| **Build-Time** | Code Generation | Lovable | Generates the Next.js codebase from natural language prompts. |
| | Code Refinement | Claude Code | Refines and debugs the Lovable-generated code. |
| | Code Storage | GitHub | Stores the application source code. |
| **Runtime** | Frontend Hosting | Vercel | Deploys and hosts the live Next.js web application. |
| | Backend Orchestration | Make.com | Runs the core workflows, routes tasks, and connects to all APIs. |
| | Database | Supabase (Postgres) | Stores user data, subscriptions, brand configurations, and results. |
| | Authentication | Supabase Auth | Manages user login, sessions, and access control. |
| | Research & Strategy | Manus AI (Open API) | The core research engine for market analysis, audits, and strategy. |
| | Code & Template Generation | Claude API | Generates HTML email templates and other code-based assets. |
| | E-commerce Data | Shopify API | Provides product, customer, and order data for analysis. |
| | Email Marketing Platform | Klaviyo API | Provides email data for analysis and is the execution layer for templates and campaigns. |
| | Payment Processing | Stripe API | Handles user subscriptions and payments. |
| | Document Delivery | Google Drive API | Creates and stores audit reports and strategy documents. |

---

## 2. Feature Specification

### 2.1. Marketing Website

| User Story | Technical Requirement |
|---|---|
| As a potential customer, I want to understand what Animus does, so I can decide if it’s right for my business. | A multi-page marketing website with sections for features, pricing, and case studies. |
| As a potential customer, I want to see pricing options, so I can choose a plan. | A pricing page with multiple tiers (e.g., Basic, Pro, Enterprise). |
| As a potential customer, I want to sign up and pay for a subscription. | Integration with Stripe Checkout for secure payment processing. |

### 2.2. Onboarding & Brand Configuration

| User Story | Technical Requirement |
|---|---|
| As a new user, I want to set up my brand’s visual identity, so all generated emails are on-brand. | On first login, the user is presented with a mandatory, multi-step onboarding form to capture their brand configuration. |
| As a new user, I want my Animus agent to have a dedicated, private workspace. | On successful payment, a new Manus Project is created via the API, named after the merchant’s brand. The Animus Base Skill is injected into the project’s `instruction` field. |
| As a new user, I want a confirmation that I’ve successfully subscribed. | On successful payment, a welcome email is triggered via the Klaviyo API. |

### 2.3. Core Chat & Editor Application

| User Story | Technical Requirement |
|---|---|
| As a user, I want to interact with Animus via a chat interface. | A persistent chat interface that sends every message to the main Make.com webhook. |
| As a user, I want Animus to remember our conversation history. | Chat history is stored in the Supabase database and passed with every webhook call. |
| As a user, I want to upload files like brand guidelines or style guides. | A file upload button that sends the file to a secure storage location (e.g., Vercel Blob) and passes the URL to Make.com. |
| As a user, I want to see a preview of my Google Doc reports directly in the chat. | The frontend detects Google Doc URLs and renders them in a sandboxed `<iframe>` for an embedded preview experience. |
| As a user, I want to see a preview of my HTML emails before they are sent to Klaviyo. | The frontend includes a component that can render raw HTML in a sandboxed `<iframe>`. |
| As a user, I want to edit the copy and spacing of my emails without touching code. | A **Structured Email Editor** with a live preview and a properties panel. Users edit fields in the panel (text, spacing sliders), and the preview updates in real-time. |
| As a user, I want to give feedback on generated content and have Animus refine it. | The chat interface supports an iterative feedback loop where user messages can trigger an `Update Task` call to the Manus API. |
| As a user, I want to know when a long-running task (like an audit) is complete. | The application listens for real-time updates (e.g., via a WebSocket or polling) to be notified when the Manus Completion Handler webhook has received a result. |

---

## 3. Non-Functional Requirements

- **Performance:** The application must load quickly and feel responsive. API calls should be asynchronous to avoid blocking the UI.
- **Security:** All API keys and secrets must be stored as environment variables on the server (Vercel and Make.com), never exposed on the client. User authentication must be secure.
- **Scalability:** The architecture must be able to handle a growing number of users and tasks. Vercel, Supabase, and Make.com all offer scalable infrastructure.
- **Reliability:** The system must be resilient to errors. API calls should have error handling and retry logic. Webhook failures should be logged.

---

## 4. Data Model (Supabase)

| Table | Purpose |
|---|---|
| `users` | Stores user authentication data (from Supabase Auth). |
| `subscriptions` | Stores user subscription status, plan tier, and Stripe customer ID. |
| `brand_configs` | Stores the user’s brand identity as a JSON object (fonts, colors, etc.). Linked to `subscriptions`. |
| `projects` | Stores the `manus_project_id` for each user, linking them to their dedicated Manus workspace. |
| `messages` | Stores the full conversation history for each user. |
| `results` | Stores the outputs of completed Manus and Claude tasks (e.g., Google Doc URLs, HTML content). |

---

## 5. Recommended Build Order

| Phase | What You Build | Where You Build It | Testable Outcome |
|---|---|---|---|
| **1. Scaffolding** | Initialize the Next.js project, set up Supabase, connect GitHub to Vercel. | Lovable, Supabase, Vercel | A basic "Hello World" app is live on a Vercel URL. |
| **2. Authentication** | Build user login, signup, and session management. | Lovable/Cursor, Supabase Auth | Users can create an account, log in, and log out. |
| **3. Payment & Onboarding** | Integrate Stripe Checkout. Build the Make.com webhook to create the Supabase user, Manus Project, and trigger the Klaviyo welcome email. | Lovable/Cursor, Make.com, Stripe | A user can pay, a Manus Project is created, a user record appears in Supabase, and a welcome email is sent. |
| **4. Brand Configuration** | Build the multi-step onboarding form to capture the brand config. | Lovable/Cursor | On first login, the user is forced to complete the form, and the data is saved to Supabase. |
| **5. Basic Chat UI** | Build the core chat interface (message list, input bar) without any backend connection. | Lovable/Cursor | The chat UI renders correctly on the page. |
| **6. Frontend → Make.com** | Wire the chat UI to the main Make.com webhook. | Lovable/Cursor, Make.com | You can send a message in the chat, it hits Make.com, and a hardcoded response appears. |
| **7. Conversational Fallback** | Implement the first router path in Make.com to call Claude for a simple conversational reply. | Make.com | You can have a basic conversation with the chatbot. |
| **8. Manus Integration** | Implement the full audit flow: Make.com calls the Manus API, and the Manus completion handler pushes the result back to the chat. | Make.com | You can type "audit my account" and receive a structured analysis. |
| **9. Claude Integration** | Implement the email template generation flow. | Make.com | You can request an email template and receive HTML back. |
| **10. Structured Editor** | Build the structured email editor with the properties panel and live preview. | Lovable/Cursor | You can edit the generated email HTML without touching code. |
| **11. Rich Content Rendering** | Build the frontend components to render HTML previews and Google Doc previews. | Lovable/Cursor | Email templates and reports render visually in the chat. |
| **12. Polish & Launch** | Test the full user journey end-to-end and launch. | All | The full system works from landing page to paid subscription to completed audit. |
