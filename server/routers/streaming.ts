import { Router } from "express";
import { agentOrchestrator } from "../agent/orchestrator";
import { getSessionById } from "../db";
import { createContext } from "../_core/context";

export const streamingRouter = Router();

streamingRouter.post("/stream", async (req, res) => {
  try {
    // Verify authentication
    const context = await createContext({ req, res } as any);
    if (!context.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const user = context.user;

    const { sessionId, message, model } = req.body;

    // Verify session ownership
    const session = await getSessionById(sessionId);
    if (!session || session.userId !== user.id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    // Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: "connected" })}\\n\\n`);

    // Process message with streaming
    await agentOrchestrator.processMessage(
      message,
      {
        sessionId,
        userId: user.id,
        mode: session.mode,
      },
      {
        model: model || session.model,
      },
      // onStream callback
      (chunk: string) => {
        res.write(`data: ${JSON.stringify({ type: "chunk", content: chunk })}\\n\\n`);
      },
      // onToolCall callback
      (toolName: string, params: any) => {
        res.write(
          `data: ${JSON.stringify({ type: "tool_call", tool: toolName, params })}\\n\\n`
        );
      },
      // onToolResult callback
      (toolName: string, result: any) => {
        res.write(
          `data: ${JSON.stringify({ type: "tool_result", tool: toolName, result })}\\n\\n`
        );
      }
    );

    // Send completion message
    res.write(`data: ${JSON.stringify({ type: "done" })}\\n\\n`);
    res.end();
  } catch (error: any) {
    console.error("[Streaming] Error:", error);
    res.write(
      `data: ${JSON.stringify({ type: "error", error: error.message })}\\n\\n`
    );
    res.end();
  }
});
