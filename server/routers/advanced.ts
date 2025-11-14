/**
 * Advanced Features Router
 * Handles scheduling, workflows, and memory management
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TaskScheduler } from "../agent/scheduler";
import { WorkflowOrchestrator } from "../agent/workflow";
import { MemoryManager } from "../agent/memory";
import { AgentOrchestrator } from "../agent/orchestrator";

// Initialize services (singleton pattern)
let orchestrator: AgentOrchestrator;
let scheduler: TaskScheduler;
let workflowOrchestratorInstance: WorkflowOrchestrator;
let memoryManagerInstance: MemoryManager;

function getOrchestrator() {
  if (!orchestrator) {
    orchestrator = new AgentOrchestrator();
  }
  return orchestrator;
}

function getScheduler() {
  if (!scheduler) {
    scheduler = new TaskScheduler(getOrchestrator());
    scheduler.loadTasks();
  }
  return scheduler;
}

function getWorkflowOrchestrator() {
  if (!workflowOrchestratorInstance) {
    workflowOrchestratorInstance = new WorkflowOrchestrator(getOrchestrator());
  }
  return workflowOrchestratorInstance;
}

function getMemoryManager() {
  if (!memoryManagerInstance) {
    memoryManagerInstance = new MemoryManager();
  }
  return memoryManagerInstance;
}


export const advancedRouter = router({
  // ===== Scheduling =====
  scheduling: router({
    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          prompt: z.string(),
          schedule: z.string(),
          type: z.enum(["cron", "interval"]),
          enabled: z.boolean().default(true),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const taskId = await getScheduler().scheduleTask({
          userId: ctx.user.id,
          name: input.name,
          prompt: input.prompt,
          schedule: input.schedule,
          type: input.type,
          enabled: input.enabled,
        });

        return { taskId, success: true };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      // Get user's scheduled tasks from database
      const { getDb } = await import("../db");
      const { sql } = await import("drizzle-orm");
      const db = await getDb();

      if (!db) {
        return [];
      }

      const tasks = await db.execute(
        sql`SELECT * FROM scheduled_tasks WHERE user_id = ${ctx.user.id} ORDER BY created_at DESC`
      );

      return Array.isArray(tasks) ? tasks : [];
    }),

    stop: protectedProcedure
      .input(z.object({ taskId: z.number() }))
      .mutation(async ({ input }) => {
        await getScheduler().stopTask(input.taskId);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ taskId: z.number() }))
      .mutation(async ({ input }) => {
        await getScheduler().deleteTask(input.taskId);
        return { success: true };
      }),
  }),

  // ===== Workflows =====
  workflows: router({
    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          sessionId: z.number(),
          steps: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              prompt: z.string(),
              dependencies: z.array(z.string()).optional(),
              parallel: z.boolean().optional(),
              retryOnError: z.boolean().optional(),
              maxRetries: z.number().optional(),
              timeout: z.number().optional(),
            })
          ),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const workflowId = `workflow-${Date.now()}`;

        getWorkflowOrchestrator().registerWorkflow({
          id: workflowId,
          name: input.name,
          description: input.description,
          steps: input.steps,
          userId: ctx.user.id,
          sessionId: input.sessionId,
          mode: "sandbox",
        });

        return { workflowId, success: true };
      }),

    execute: protectedProcedure
      .input(z.object({ workflowId: z.string() }))
      .mutation(async ({ input }) => {
        const result = await getWorkflowOrchestrator().executeWorkflow(
          input.workflowId
        );
        return result;
      }),

    list: protectedProcedure.query(async () => {
      const workflows = getWorkflowOrchestrator().listWorkflows();
      return workflows;
    }),

    get: protectedProcedure
      .input(z.object({ workflowId: z.string() }))
      .query(async ({ input }) => {
        const workflow = getWorkflowOrchestrator().getWorkflow(input.workflowId);
        return workflow;
      }),

    delete: protectedProcedure
      .input(z.object({ workflowId: z.string() }))
      .mutation(async ({ input }) => {
        const success = getWorkflowOrchestrator().deleteWorkflow(input.workflowId);
        return { success };
      }),
  }),

  // ===== Memory =====
  memory: router({
    store: protectedProcedure
      .input(
        z.object({
          sessionId: z.number().optional(),
          type: z.enum(["fact", "preference", "skill", "context", "summary"]),
          key: z.string(),
          value: z.string(),
          metadata: z.record(z.string(), z.any()).optional(),
          importance: z.number().min(1).max(10).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const id = await getMemoryManager().store({
          userId: ctx.user.id,
          sessionId: input.sessionId,
          type: input.type,
          key: input.key,
          value: input.value,
          metadata: input.metadata,
          importance: input.importance,
        });

        return { id, success: true };
      }),

    getByUser: protectedProcedure
      .input(
        z.object({
          type: z
            .enum(["fact", "preference", "skill", "context", "summary"])
            .optional(),
          limit: z.number().default(100),
        })
      )
      .query(async ({ ctx, input }) => {
        const memories = await getMemoryManager().getByUser(
          ctx.user.id,
          input.type,
          input.limit
        );
        return memories;
      }),

    getBySession: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        const memories = await getMemoryManager().getBySession(input.sessionId);
        return memories;
      }),

    search: protectedProcedure
      .input(
        z.object({
          keyword: z.string(),
          limit: z.number().default(50),
        })
      )
      .query(async ({ ctx, input }) => {
        const memories = await getMemoryManager().search(
          ctx.user.id,
          input.keyword,
          input.limit
        );
        return memories;
      }),

    updateImportance: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          importance: z.number().min(1).max(10),
        })
      )
      .mutation(async ({ input }) => {
        await getMemoryManager().updateImportance(input.id, input.importance);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await getMemoryManager().delete(input.id);
        return { success: true };
      }),

    getPreferences: protectedProcedure.query(async ({ ctx }) => {
      const preferences = await getMemoryManager().getPreferences(ctx.user.id);
      return preferences;
    }),

    setPreference: protectedProcedure
      .input(
        z.object({
          key: z.string(),
          value: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await getMemoryManager().setPreference(ctx.user.id, input.key, input.value);
        return { success: true };
      }),

    getSummary: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        const summary = await getMemoryManager().getSummary(input.sessionId);
        return summary;
      }),

    storeSummary: protectedProcedure
      .input(
        z.object({
          sessionId: z.number(),
          summary: z.string(),
          keyPoints: z.array(z.string()),
          topics: z.array(z.string()),
        })
      )
      .mutation(async ({ input }) => {
        await getMemoryManager().storeSummary({
          sessionId: input.sessionId,
          summary: input.summary,
          keyPoints: input.keyPoints,
          topics: input.topics,
          createdAt: new Date(),
        });
        return { success: true };
      }),

    cleanup: protectedProcedure
      .input(z.object({ daysOld: z.number().default(30) }))
      .mutation(async ({ ctx, input }) => {
        const deleted = await getMemoryManager().cleanup(ctx.user.id, input.daysOld);
        return { deleted, success: true };
      }),
  }),
});
