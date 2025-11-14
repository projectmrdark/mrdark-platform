import { invokeLLM } from "../_core/llm";
import { createMessage, createUsageLog, incrementUserQuota } from "../db";
import { ToolRegistry } from "./tools/registry";
import { initializeTools } from "./tools";
import { ContextManager } from "./context";

export interface AgentConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  maxIterations?: number;
}

export interface AgentContext {
  sessionId: number;
  userId: number;
  mode: "sandbox" | "local";
}

export class AgentOrchestrator {
  private toolRegistry: ToolRegistry;
  private contextManager: ContextManager;

  constructor() {
    this.toolRegistry = new ToolRegistry();
    initializeTools(this.toolRegistry);
    this.contextManager = new ContextManager();
  }

  async processMessage(
    userMessage: string,
    context: AgentContext,
    config: AgentConfig,
    onStream?: (chunk: string) => void,
    onToolCall?: (toolName: string, params: any) => void,
    onToolResult?: (toolName: string, result: any) => void
  ): Promise<string> {
    const { sessionId, userId, mode } = context;
    const { model, maxIterations = 10 } = config;

    // Save user message
    await createMessage({
      sessionId,
      role: "user",
      content: userMessage,
    });

    // Load conversation context
    const messages = await this.contextManager.getContextMessages(sessionId, model);

    let finalResponse = "";
    let totalTokens = 0;

    // Agent loop
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      // Get available tools
      const tools = this.toolRegistry.getFunctionSchemas();

      // Call LLM
      const response = await invokeLLM({
        messages,
        tools,
        tool_choice: "auto",
      });

      const message = response.choices[0].message;
      totalTokens += response.usage?.total_tokens || 0;

      // Check if there are tool calls
      if (message.tool_calls && message.tool_calls.length > 0) {
        // Execute each tool call
        for (const toolCall of message.tool_calls) {
          const toolName = toolCall.function.name;
          const toolParams = JSON.parse(toolCall.function.arguments);

          if (onToolCall) {
            onToolCall(toolName, toolParams);
          }

          // Execute tool
          const toolResult = await this.toolRegistry.executeTool(
            toolName,
            toolParams,
            { sessionId, userId, mode }
          );

          if (onToolResult) {
            onToolResult(toolName, toolResult);
          }

          // Add tool result to messages
          messages.push({
            role: "assistant",
            content: "",
            tool_calls: [toolCall],
          });

          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult),
          });
        }

        // Continue loop to get next response
        continue;
      } else {
        // No more tool calls, this is the final response
        finalResponse = typeof message.content === 'string' ? message.content : "";

        // Stream the response
        if (onStream && finalResponse) {
          onStream(finalResponse);
        }

        // Save assistant message
        await createMessage({
          sessionId,
          role: "assistant",
          content: finalResponse,
        });

        // Log usage
        await createUsageLog({
          userId,
          sessionId,
          model,
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens,
        });

        // Update user quota
        await incrementUserQuota(userId, totalTokens);

        break;
      }
    }

    return finalResponse;
  }

  getToolRegistry(): ToolRegistry {
    return this.toolRegistry;
  }
}

// Singleton instance
export const agentOrchestrator = new AgentOrchestrator();
