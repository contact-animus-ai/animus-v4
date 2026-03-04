import { createClient } from "@supabase/supabase-js";

// Admin client — bypasses RLS. ONLY use in API routes and server actions.
// NEVER import this from client components.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
