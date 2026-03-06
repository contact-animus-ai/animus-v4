const KLAVIYO_API_BASE = "https://a.klaviyo.com/api";
const KLAVIYO_REVISION = "2024-10-15";
const MAX_FLOWS = 100;

interface KlaviyoTemplateResult {
  id: string;
  name: string;
}

interface KlaviyoFlowEmail {
  templateId: string;
  subject: string;
  delaySeconds?: number;
}

interface KlaviyoFlowOptions {
  name: string;
  triggerType: "metric" | "list" | "segment" | "price_drop" | "date";
  triggerMetricId?: string;
  triggerListId?: string;
  triggerSegmentId?: string;
  emails: KlaviyoFlowEmail[];
}

interface KlaviyoFlowResult {
  id: string;
  name: string;
}

function klaviyoHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Klaviyo-API-Key ${apiKey}`,
    revision: KLAVIYO_REVISION,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

/**
 * Creates an email template in Klaviyo.
 */
export async function createKlaviyoTemplate(
  apiKey: string,
  name: string,
  html: string
): Promise<KlaviyoTemplateResult> {
  const res = await fetch(`${KLAVIYO_API_BASE}/templates/`, {
    method: "POST",
    headers: klaviyoHeaders(apiKey),
    body: JSON.stringify({
      data: {
        type: "template",
        attributes: {
          name,
          editor_type: "CODE",
          html,
        },
      },
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Klaviyo API error (${res.status}): ${error}`);
  }

  const json = await res.json();
  return {
    id: json.data.id,
    name: json.data.attributes.name,
  };
}

/**
 * Counts existing flows. Throws if at the 100-flow limit.
 */
async function enforceFlowLimit(apiKey: string): Promise<void> {
  const res = await fetch(`${KLAVIYO_API_BASE}/flows/?page[size]=1`, {
    headers: klaviyoHeaders(apiKey),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Klaviyo API error checking flows (${res.status}): ${error}`);
  }

  const json = await res.json();
  const total = json.meta?.total ?? json.data?.length ?? 0;

  if (total >= MAX_FLOWS) {
    throw new Error(`Flow limit reached (${MAX_FLOWS}). Delete existing flows before creating new ones.`);
  }
}

/**
 * Creates a flow in Klaviyo with email actions referencing existing templates.
 * Enforces a max of 100 flows per account.
 */
export async function createKlaviyoFlow(
  apiKey: string,
  options: KlaviyoFlowOptions
): Promise<KlaviyoFlowResult> {
  await enforceFlowLimit(apiKey);

  // Build trigger definition
  const trigger: Record<string, unknown> = { type: options.triggerType };
  if (options.triggerType === "metric" && options.triggerMetricId) {
    trigger.metric_id = options.triggerMetricId;
  } else if (options.triggerType === "list" && options.triggerListId) {
    trigger.list_id = options.triggerListId;
  } else if (options.triggerType === "segment" && options.triggerSegmentId) {
    trigger.segment_id = options.triggerSegmentId;
  }

  // Build email actions with temporary IDs
  const actions = options.emails.map((email, i) => ({
    temporary_id: `action_${i}`,
    type: "flow-action",
    attributes: {
      action_type: "EMAIL",
      settings: {
        subject: email.subject,
        template_id: email.templateId,
      },
      ...(email.delaySeconds && i > 0
        ? { time_delay: { delay: email.delaySeconds, unit: "seconds" } }
        : {}),
    },
  }));

  const res = await fetch(`${KLAVIYO_API_BASE}/flows/`, {
    method: "POST",
    headers: klaviyoHeaders(apiKey),
    body: JSON.stringify({
      data: {
        type: "flow",
        attributes: {
          name: options.name,
          trigger,
          actions,
          status: "draft",
        },
      },
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Klaviyo flow creation error (${res.status}): ${error}`);
  }

  const json = await res.json();
  return {
    id: json.data.id,
    name: json.data.attributes.name,
  };
}
