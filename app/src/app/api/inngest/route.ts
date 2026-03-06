import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { syncShopifyFunction } from "@/lib/inngest/functions/shopify-sync";
import { auditPhase1Function } from "@/lib/inngest/functions/audit-phase1";
import { auditPhase2Function } from "@/lib/inngest/functions/audit-phase2";
import { createSegmentsFunction } from "@/lib/inngest/functions/create-segments";
import { generateEmailFunction } from "@/lib/inngest/functions/generate-email";
import { refineEmailFunction } from "@/lib/inngest/functions/refine-email";
import { createManusProjectFunction } from "@/lib/inngest/functions/create-manus-project";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    syncShopifyFunction,
    auditPhase1Function,
    auditPhase2Function,
    createSegmentsFunction,
    generateEmailFunction,
    refineEmailFunction,
    createManusProjectFunction,
  ],
});
