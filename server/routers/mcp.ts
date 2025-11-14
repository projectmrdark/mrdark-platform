import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { mcpClient } from "../agent/mcp/client";

export const mcpRouter = router({
  /**
   * List all registered MCP servers
   */
  listServers: protectedProcedure.query(async () => {
    return mcpClient.getServers();
  }),

  /**
   * Register a new MCP server
   */
  registerServer: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        url: z.string().url(),
        apiKey: z.string().optional(),
        enabled: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      await mcpClient.registerServer(input);
      return { success: true };
    }),

  /**
   * Toggle server enabled/disabled
   */
  toggleServer: protectedProcedure
    .input(
      z.object({
        serverName: z.string(),
        enabled: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      await mcpClient.toggleServer(input.serverName, input.enabled);
      return { success: true };
    }),

  /**
   * List all available MCP tools
   */
  listTools: protectedProcedure.query(async () => {
    return mcpClient.getTools();
  }),

  /**
   * List all available MCP resources
   */
  listResources: protectedProcedure.query(async () => {
    return mcpClient.getResources();
  }),

  /**
   * Call an MCP tool
   */
  callTool: protectedProcedure
    .input(
      z.object({
        toolName: z.string(),
        args: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ input }) => {
      const result = await mcpClient.callTool(input.toolName, input.args);
      return result;
    }),

  /**
   * Read an MCP resource
   */
  readResource: protectedProcedure
    .input(
      z.object({
        uri: z.string(),
      })
    )
    .query(async ({ input }) => {
      const content = await mcpClient.readResource(input.uri);
      return content;
    }),

  /**
   * Refresh all MCP servers
   */
  refresh: protectedProcedure.mutation(async () => {
    await mcpClient.refresh();
    return { success: true };
  }),
});
