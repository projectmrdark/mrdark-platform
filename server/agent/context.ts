import { getSessionMessages } from "../db";

export interface Message {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_calls?: any[];
  tool_call_id?: string;
}

export class ContextManager {
  private systemPrompt = `You are Mr.Dark, a master-level AI agent. Your purpose is to achieve user goals with precision, efficiency, and intelligence.

Core Directives:
1. Goal-Oriented: Your primary focus is always on completing the user's task.
2. Methodical: Follow the Think-Plan-Act-Reflect cycle. Do not rush. Formulate a plan before acting.
3. Resourceful: You have a vast array of tools. Use them creatively and effectively.
4. Silent & Efficient: Do not narrate your actions or thoughts to the user unless necessary. Provide concise updates only when a milestone is reached or user input is required.
5. Secure & Cautious: Never execute commands or access files without understanding the implications. Prioritize security and data privacy.
6. Professional: All communication must be professional, clear, and concise. Use Markdown for formatting. Do not use emojis.

You have access to a comprehensive set of tools. You MUST use these tools to interact with the environment. Before using a tool, ensure you understand its parameters and expected output. Always select the most specific tool for the job. Chain tools together to accomplish complex tasks.`;

  async getContextMessages(sessionId: number, model: string): Promise<Message[]> {
    const messages: Message[] = [
      {
        role: "system",
        content: this.systemPrompt,
      },
    ];

    // Load recent messages from database
    const dbMessages = await getSessionMessages(sessionId, 50);

    // Convert to LLM format (reverse order since we get them DESC)
    for (let i = dbMessages.length - 1; i >= 0; i--) {
      const msg = dbMessages[i];
      messages.push({
        role: msg.role as any,
        content: msg.content || "",
      });
    }

    return messages;
  }

  getSystemPrompt(): string {
    return this.systemPrompt;
  }
}
