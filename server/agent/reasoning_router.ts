/**
 * Unified Reasoning Router
 * 
 * Inspired by GPT-5's unified system that automatically chooses between:
 * - Fast reasoning: Quick responses for simple tasks
 * - Deep reasoning: Extended thinking for complex problems
 * 
 * The router analyzes:
 * - Conversation type
 * - Task complexity
 * - Tool needs
 * - Explicit user intent (e.g., "think hard about this")
 */

import { invokeLLM } from '../_core/llm';
import type { Message } from '../_core/llm';

export interface RouterDecision {
  mode: 'fast' | 'deep';
  confidence: number;
  reasoning: string;
  estimatedTokens: number;
  estimatedTime: number;
}

export interface TaskAnalysis {
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  requiresTools: boolean;
  requiresMultiStep: boolean;
  requiresDeepReasoning: boolean;
  explicitIntent?: 'fast' | 'deep';
}

export class ReasoningRouter {
  private decisionHistory: RouterDecision[] = [];

  /**
   * Analyze task to determine routing decision
   */
  async analyzeTask(messages: Message[]): Promise<TaskAnalysis> {
    const lastMessage = messages[messages.length - 1];
    let userMessage = '';
    
    if (typeof lastMessage.content === 'string') {
      userMessage = lastMessage.content;
    } else if (Array.isArray(lastMessage.content)) {
      // Extract text from content array
      for (const item of lastMessage.content) {
        if (typeof item === 'object' && item !== null && 'type' in item && item.type === 'text' && 'text' in item) {
          userMessage = item.text as string;
          break;
        }
      }
    }

    // Check for explicit intent keywords
    const explicitIntent = this.detectExplicitIntent(userMessage);

    // Analyze complexity using LLM
    const complexityAnalysis = await this.analyzeComplexity(messages);

    return {
      ...complexityAnalysis,
      explicitIntent,
    };
  }

  /**
   * Route to appropriate reasoning mode
   */
  async route(messages: Message[]): Promise<RouterDecision> {
    const analysis = await this.analyzeTask(messages);

    // Explicit intent overrides automatic routing
    if (analysis.explicitIntent) {
      return this.createDecision(
        analysis.explicitIntent,
        1.0,
        'User explicitly requested this mode',
        analysis
      );
    }

    // Automatic routing based on analysis
    if (analysis.complexity === 'expert' || analysis.requiresDeepReasoning) {
      return this.createDecision(
        'deep',
        0.9,
        'Complex task requiring extended thinking',
        analysis
      );
    }

    if (analysis.complexity === 'complex' || analysis.requiresMultiStep) {
      return this.createDecision(
        'deep',
        0.7,
        'Multi-step task benefits from deeper reasoning',
        analysis
      );
    }

    if (analysis.complexity === 'moderate' && analysis.requiresTools) {
      return this.createDecision(
        'fast',
        0.8,
        'Moderate task with tools can be handled quickly',
        analysis
      );
    }

    return this.createDecision(
      'fast',
      0.9,
      'Simple task suitable for fast reasoning',
      analysis
    );
  }

  /**
   * Detect explicit user intent from message
   */
  private detectExplicitIntent(message: string): 'fast' | 'deep' | undefined {
    const deepKeywords = [
      'think hard',
      'think carefully',
      'deep reasoning',
      'extended thinking',
      'take your time',
      'be thorough',
      'analyze deeply',
      'คิดอย่างรอบคอบ',
      'คิดให้ลึก',
      'วิเคราะห์อย่างละเอียด',
    ];

    const fastKeywords = [
      'quick',
      'fast',
      'briefly',
      'simple answer',
      'just tell me',
      'ตอบสั้นๆ',
      'เร็วๆ',
      'แค่บอก',
    ];

    const lowerMessage = message.toLowerCase();

    for (const keyword of deepKeywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return 'deep';
      }
    }

    for (const keyword of fastKeywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return 'fast';
      }
    }

    return undefined;
  }

  /**
   * Analyze task complexity using LLM
   */
  private async analyzeComplexity(messages: Message[]): Promise<Omit<TaskAnalysis, 'explicitIntent'>> {
    try {
      const analysisPrompt: Message[] = [
        {
          role: 'system',
          content: `You are a task complexity analyzer. Analyze the user's request and respond with JSON:
{
  "complexity": "simple" | "moderate" | "complex" | "expert",
  "requiresTools": boolean,
  "requiresMultiStep": boolean,
  "requiresDeepReasoning": boolean,
  "reasoning": "brief explanation"
}

Guidelines:
- simple: Direct questions, basic tasks, single-step
- moderate: Multi-step tasks, some tool use, straightforward logic
- complex: Multi-file changes, complex logic, multiple tools, planning needed
- expert: Research, mathematical proofs, long-running tasks, expert-level reasoning

- requiresTools: true if task needs external tools (search, code execution, etc.)
- requiresMultiStep: true if task has multiple dependent steps
- requiresDeepReasoning: true if task requires mathematical proofs, research, or expert-level thinking`,
        },
        ...messages.slice(-3), // Last 3 messages for context
      ];

      const response = await invokeLLM({
        messages: analysisPrompt,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'task_analysis',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                complexity: {
                  type: 'string',
                  enum: ['simple', 'moderate', 'complex', 'expert'],
                },
                requiresTools: { type: 'boolean' },
                requiresMultiStep: { type: 'boolean' },
                requiresDeepReasoning: { type: 'boolean' },
                reasoning: { type: 'string' },
              },
              required: ['complexity', 'requiresTools', 'requiresMultiStep', 'requiresDeepReasoning', 'reasoning'],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from LLM');
      }

      const textContent = this.extractTextContent(content);
      const analysis = JSON.parse(textContent);
      return {
        complexity: analysis.complexity,
        requiresTools: analysis.requiresTools,
        requiresMultiStep: analysis.requiresMultiStep,
        requiresDeepReasoning: analysis.requiresDeepReasoning,
      };
    } catch (error) {
      console.error('[ReasoningRouter] Failed to analyze complexity:', error);
      // Fallback to moderate complexity
      return {
        complexity: 'moderate',
        requiresTools: false,
        requiresMultiStep: false,
        requiresDeepReasoning: false,
      };
    }
  }

  /**
   * Create routing decision
   */
  private createDecision(
    mode: 'fast' | 'deep',
    confidence: number,
    reasoning: string,
    analysis: Omit<TaskAnalysis, 'explicitIntent'>
  ): RouterDecision {
    const decision: RouterDecision = {
      mode,
      confidence,
      reasoning,
      estimatedTokens: mode === 'deep' ? 4000 : 1000,
      estimatedTime: mode === 'deep' ? 30 : 5, // seconds
    };

    this.decisionHistory.push(decision);
    return decision;
  }

  /**
   * Get routing statistics
   */
  getStatistics() {
    const total = this.decisionHistory.length;
    const fast = this.decisionHistory.filter(d => d.mode === 'fast').length;
    const deep = this.decisionHistory.filter(d => d.mode === 'deep').length;
    const avgConfidence = this.decisionHistory.reduce((sum, d) => sum + d.confidence, 0) / total;

    return {
      total,
      fast,
      deep,
      fastPercentage: (fast / total) * 100,
      deepPercentage: (deep / total) * 100,
      avgConfidence,
    };
  }

  /**
   * Learn from user feedback
   * Called when user switches models or rates responses
   */
  async learn(
    decision: RouterDecision,
    userFeedback: {
      switched?: boolean; // User manually switched mode
      preferredMode?: 'fast' | 'deep';
      rating?: number; // 1-5 stars
    }
  ) {
    // In production, this would update the router's training data
    // For now, we log for analysis
    console.log('[ReasoningRouter] Learning from feedback:', {
      decision,
      userFeedback,
    });

    // Future: Update routing model based on feedback
    // - If user switched from fast to deep, increase complexity threshold
    // - If user rated deep response low, decrease deep routing confidence
    // - Track patterns in user preferences
  }

  /**
   * Extract text content from Message
   */
  private extractTextContent(content: Message['content']): string {
    if (typeof content === 'string') {
      return content;
    }
    
    if (Array.isArray(content)) {
      for (const item of content) {
        if (typeof item === 'object' && item !== null && 'type' in item && item.type === 'text' && 'text' in item) {
          return item.text as string;
        }
      }
    }
    
    return '';
  }
}

// Singleton instance
export const reasoningRouter = new ReasoningRouter();
