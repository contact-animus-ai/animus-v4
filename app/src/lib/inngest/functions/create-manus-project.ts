import { inngest } from "@/lib/inngest/client";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createManusProject, MANUS_SYSTEM_PROMPT } from "@/lib/skills/manus-research";

export const createManusProjectFunction = inngest.createFunction(
  { id: "create-manus-project", retries: 2 },
  { event: "manus/project.create" },
  async ({ event, step }) => {
    const { merchantId, storeName } = event.data;

    const project = await step.run("create-project", () =>
      createManusProject(storeName, MANUS_SYSTEM_PROMPT)
    );

    await step.run("save-project-id", () =>
      supabaseAdmin
        .from("merchants")
        .update({ manus_project_id: project.id })
        .eq("id", merchantId)
    );

    return { success: true, projectId: project.id };
  }
);
