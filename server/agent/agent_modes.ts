/**
 * Agent Modes System
 * 
 * Inspired by Cursor's 4 specialized modes:
 * - Agent: Complex features, autonomous exploration, multi-file edits
 * - Ask: Read-only mode for learning and exploration
 * - Plan: Creates detailed plans before execution
 * - Custom: User-defined capabilities and tools
 */

import type { Message } from '../_core/llm';
import { invokeLLM } from '../_core/llm';

export type AgentMode = 'agent' | 'ask' | 'plan' | 'custom';

export interface ModeConfig {
  name: AgentMode;
  description: string;
  capabilities: {
    canEdit: boolean;
    canExecute: boolean;
    canSearch: boolean;
    canUseBrowser: boolean;
    canUseTools: boolean;
    requiresApproval: boolean;
  };
  tools: string[]; // List of allowed tool names
  instructions?: string; // Custom instructions for this mode
}

export interface PlanStep {
  id: number;
  title: string;
  description: string;
  dependencies: number[]; // IDs of steps that must complete first
  estimatedTime: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: string;
}

export interface Plan {
  id: string;
  title: string;
  description: string;
  steps: PlanStep[];
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'approved' | 'executing' | 'completed' | 'failed';
}

export class AgentModeSystem {
  private currentMode: AgentMode = 'agent';
  private customModes: Map<string, ModeConfig> = new Map();
  private activePlans: Map<string, Plan> = new Map();

  /**
   * Get mode configuration
   */
  getModeConfig(mode: AgentMode): ModeConfig {
    switch (mode) {
      case 'agent':
        return {
          name: 'agent',
          description: 'Complex features, autonomous exploration, multi-file edits',
          capabilities: {
            canEdit: true,
            canExecute: true,
            canSearch: true,
            canUseBrowser: true,
            canUseTools: true,
            requiresApproval: false,
          },
          tools: ['all'], // All tools enabled
        };

      case 'ask':
        return {
          name: 'ask',
          description: 'Read-only exploration, learning, no automatic changes',
          capabilities: {
            canEdit: false,
            canExecute: false,
            canSearch: true,
            canUseBrowser: true,
            canUseTools: false,
            requiresApproval: false,
          },
          tools: ['search', 'read', 'browse'], // Search tools only
        };

      case 'plan':
        return {
          name: 'plan',
          description: 'Creates detailed plans before execution, asks clarifying questions',
          capabilities: {
            canEdit: false, // Initially false, becomes true after plan approval
            canExecute: false,
            canSearch: true,
            canUseBrowser: false,
            canUseTools: false,
            requiresApproval: true,
          },
          tools: ['search', 'read'], // Research tools only during planning
        };

      case 'custom':
        return {
          name: 'custom',
          description: 'User-defined capabilities and tools',
          capabilities: {
            canEdit: false,
            canExecute: false,
            canSearch: true,
            canUseBrowser: false,
            canUseTools: false,
            requiresApproval: true,
          },
          tools: [],
        };

      default:
        return this.getModeConfig('agent');
    }
  }

  /**
   * Switch to different mode
   */
  switchMode(mode: AgentMode): void {
    this.currentMode = mode;
    console.log(`[AgentModes] Switched to ${mode} mode`);
  }

  /**
   * Get current mode
   */
  getCurrentMode(): AgentMode {
    return this.currentMode;
  }

  /**
   * Create custom mode
   */
  createCustomMode(name: string, config: Partial<ModeConfig>): void {
    const customMode: ModeConfig = {
      name: 'custom',
      description: config.description || 'Custom mode',
      capabilities: config.capabilities || {
        canEdit: false,
        canExecute: false,
        canSearch: true,
        canUseBrowser: false,
        canUseTools: false,
        requiresApproval: true,
      },
      tools: config.tools || [],
      instructions: config.instructions,
    };

    this.customModes.set(name, customMode);
    console.log(`[AgentModes] Created custom mode: ${name}`);
  }

  /**
   * Get custom mode
   */
  getCustomMode(name: string): ModeConfig | undefined {
    return this.customModes.get(name);
  }

  /**
   * Create implementation plan (Plan mode)
   */
  async createPlan(
    title: string,
    description: string,
    messages: Message[]
  ): Promise<Plan> {
    console.log('[AgentModes] Creating implementation plan...');

    // Ask clarifying questions first
    const clarifyingQuestions = await this.askClarifyingQuestions(messages);
    
    // Generate plan steps
    const steps = await this.generatePlanSteps(title, description, messages);

    const plan: Plan = {
      id: this.generatePlanId(),
      title,
      description,
      steps,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft',
    };

    this.activePlans.set(plan.id, plan);
    console.log(`[AgentModes] Created plan ${plan.id} with ${steps.length} steps`);

    return plan;
  }

  /**
   * Ask clarifying questions before planning
   */
  private async askClarifyingQuestions(messages: Message[]): Promise<string[]> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: `You are a planning assistant. Analyze the user's request and generate clarifying questions to ensure you understand requirements fully. Respond with JSON:
{
  "questions": ["question 1", "question 2", ...]
}

Generate 2-5 questions that help clarify:
- Specific requirements
- Edge cases to handle
- Preferred approach
- Success criteria`,
          },
          ...messages,
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'clarifying_questions',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                questions: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              required: ['questions'],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return [];
      }

      const textContent = typeof content === 'string' ? content : '';
      const result = JSON.parse(textContent);
      return result.questions;
    } catch (error) {
      console.error('[AgentModes] Failed to generate clarifying questions:', error);
      return [];
    }
  }

  /**
   * Generate plan steps
   */
  private async generatePlanSteps(
    title: string,
    description: string,
    messages: Message[]
  ): Promise<PlanStep[]> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: `You are a planning assistant. Create a detailed implementation plan with clear steps. Respond with JSON:
{
  "steps": [
    {
      "title": "Step title",
      "description": "Detailed description",
      "dependencies": [0, 1], // IDs of prerequisite steps
      "estimatedTime": "5 minutes"
    }
  ]
}

Create 3-10 steps that:
- Break down the task logically
- Identify dependencies
- Provide clear descriptions
- Estimate time realistically`,
          },
          {
            role: 'user',
            content: `Title: ${title}\nDescription: ${description}`,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'implementation_plan',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                steps: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      description: { type: 'string' },
                      dependencies: {
                        type: 'array',
                        items: { type: 'number' },
                      },
                      estimatedTime: { type: 'string' },
                    },
                    required: ['title', 'description', 'dependencies', 'estimatedTime'],
                    additionalProperties: false,
                  },
                },
              },
              required: ['steps'],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from LLM');
      }

      const textContent = typeof content === 'string' ? content : '';
      const result = JSON.parse(textContent);

      return result.steps.map((step: any, index: number) => ({
        id: index + 1,
        title: step.title,
        description: step.description,
        dependencies: step.dependencies,
        estimatedTime: step.estimatedTime,
        status: 'pending' as const,
      }));
    } catch (error) {
      console.error('[AgentModes] Failed to generate plan steps:', error);
      return [];
    }
  }

  /**
   * Approve plan and start execution
   */
  async approvePlan(planId: string): Promise<void> {
    const plan = this.activePlans.get(planId);
    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }

    plan.status = 'approved';
    plan.updatedAt = new Date();
    console.log(`[AgentModes] Plan ${planId} approved, ready for execution`);
  }

  /**
   * Execute plan step by step
   */
  async executePlan(planId: string): Promise<void> {
    const plan = this.activePlans.get(planId);
    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }

    if (plan.status !== 'approved') {
      throw new Error(`Plan ${planId} must be approved before execution`);
    }

    plan.status = 'executing';
    console.log(`[AgentModes] Executing plan ${planId}...`);

    // Execute steps in dependency order
    for (const step of plan.steps) {
      // Check if dependencies are completed
      const dependenciesCompleted = step.dependencies.every(depId => {
        const depStep = plan.steps.find(s => s.id === depId);
        return depStep?.status === 'completed';
      });

      if (!dependenciesCompleted) {
        console.log(`[AgentModes] Waiting for dependencies of step ${step.id}`);
        continue;
      }

      // Execute step
      step.status = 'in_progress';
      console.log(`[AgentModes] Executing step ${step.id}: ${step.title}`);

      // In production, this would actually execute the step
      // For now, just mark as completed
      step.status = 'completed';
      step.result = 'Step completed successfully';
    }

    plan.status = 'completed';
    plan.updatedAt = new Date();
    console.log(`[AgentModes] Plan ${planId} completed`);
  }

  /**
   * Get plan
   */
  getPlan(planId: string): Plan | undefined {
    return this.activePlans.get(planId);
  }

  /**
   * List all plans
   */
  listPlans(): Plan[] {
    return Array.from(this.activePlans.values());
  }

  /**
   * Save plan to workspace
   */
  async savePlanToWorkspace(planId: string, workspacePath: string): Promise<string> {
    const plan = this.activePlans.get(planId);
    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }

    // In production, would save to .cursor/plans/ directory
    const planPath = `${workspacePath}/.cursor/plans/${plan.id}.md`;
    console.log(`[AgentModes] Plan ${planId} would be saved to ${planPath}`);
    
    return planPath;
  }

  /**
   * Generate unique plan ID
   */
  private generatePlanId(): string {
    return `plan_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Check if tool is allowed in current mode
   */
  isToolAllowed(toolName: string): boolean {
    const config = this.getModeConfig(this.currentMode);
    
    if (config.tools.includes('all')) {
      return true;
    }

    return config.tools.includes(toolName);
  }

  /**
   * Check if action is allowed in current mode
   */
  canPerformAction(action: 'edit' | 'execute' | 'search' | 'browse' | 'useTool'): boolean {
    const config = this.getModeConfig(this.currentMode);

    switch (action) {
      case 'edit':
        return config.capabilities.canEdit;
      case 'execute':
        return config.capabilities.canExecute;
      case 'search':
        return config.capabilities.canSearch;
      case 'browse':
        return config.capabilities.canUseBrowser;
      case 'useTool':
        return config.capabilities.canUseTools;
      default:
        return false;
    }
  }
}

// Singleton instance
export const agentModeSystem = new AgentModeSystem();
