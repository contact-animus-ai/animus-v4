import { createBrowserClient } from '@supabase/ssr';

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
}

async function apiRequest<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

// Chat / Conversations
export const createConversation = () => apiRequest('POST', '/api/conversations');
export const getConversations = () => apiRequest('GET', '/api/conversations');
export const getMessages = (conversationId: string) =>
  apiRequest('GET', `/api/conversations/${conversationId}/messages`);
export const sendMessage = (message: string, conversationId: string) =>
  apiRequest('POST', '/api/chat', { message, conversationId });

// Onboarding
export const connectShopify = (shop: string) =>
  apiRequest('POST', '/api/onboarding/shopify-connect', { shop });
export const connectKlaviyo = (apiKey: string) =>
  apiRequest('POST', '/api/onboarding/klaviyo-connect', { apiKey });
export const saveBrandConfig = (config: {
  primaryColor: string; secondaryColor: string;
  fontHeading: string; fontBody: string; logoUrl: string;
}) => apiRequest('POST', '/api/onboarding/brand-config', config);

// Templates
export const getTemplates = () => apiRequest('GET', '/api/templates');
export const pushToKlaviyo = (templateId: string) =>
  apiRequest('POST', '/api/push-to-klaviyo', { templateId });

// Billing
export const createCheckout = () => apiRequest<{ url: string }>('POST', '/api/billing/create-checkout');
export const getBillingPortal = () => apiRequest<{ url: string }>('POST', '/api/billing/portal');
