import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { agentOrchestrator } from "../agent/orchestrator";
import {
  createSession,
  getUserSessions,
  getSessionById,
  updateSession,
  deleteSession,
  getSessionMessages,
} from "../db";

export const agentRouter = router({
  // Create a new session
  createSession: protectedProcedure
    .input(
      z.object({
        title: z.string().optional(),
        model: z.string().default("gpt-4"),
        mode: z.enum(["sandbox", "local"]).default("sandbox"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const sessionId = await createSession({
        userId: ctx.user.id,
        title: input.title,
        model: input.model,
        mode: input.mode,
        status: "active",
      });

      return {
        success: true,
        sessionId,
      };
    }),

  // Get all user sessions
  getSessions: protectedProcedure.query(async ({ ctx }) => {
    const sessions = await getUserSessions(ctx.user.id);
    return sessions;
  }),

  // Get a specific session
  getSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      const session = await getSessionById(input.sessionId);

      if (!session || session.userId !== ctx.user.id) {
        throw new Error("Session not found");
      }

      return session;
    }),

  // Get session messages
  getMessages: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      const session = await getSessionById(input.sessionId);

      if (!session || session.userId !== ctx.user.id) {
        throw new Error("Session not found");
      }

      const messages = await getSessionMessages(input.sessionId);
      return messages;
    }),

  // Send a message to the agent
  sendMessage: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        message: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const session = await getSessionById(input.sessionId);

      if (!session || session.userId !== ctx.user.id) {
        throw new Error("Session not found");
      }

      const response = await agentOrchestrator.processMessage(
        input.message,
        {
          sessionId: input.sessionId,
          userId: ctx.user.id,
          mode: session.mode,
        },
        {
          model: session.model,
        }
      );

      // Update session last message time
      await updateSession(input.sessionId, {
        lastMessageAt: new Date(),
      });

      return {
        success: true,
        response,
      };
    }),

  // Delete a session
  deleteSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const session = await getSessionById(input.sessionId);

      if (!session || session.userId !== ctx.user.id) {
        throw new Error("Session not found");
      }

      await deleteSession(input.sessionId);

      return {
        success: true,
      };
    }),

  // Get available tools
  getTools: protectedProcedure.query(() => {
    const tools = agentOrchestrator.getToolRegistry().getAllTools();
    return tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      category: tool.category,
      parameters: tool.parameters,
    }));
  }),

  // Get tools by category
  getToolsByCategory: protectedProcedure
    .input(z.object({ category: z.string() }))
    .query(({ input }) => {
      const tools = agentOrchestrator
        .getToolRegistry()
        .getToolsByCategory(input.category);
      return tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        category: tool.category,
        parameters: tool.parameters,
      }));
    }),
});
