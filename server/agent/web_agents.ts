/**
 * Web Agents - Autonomous Browser Control
 * 
 * Inspired by Cursor's Web Agents feature:
 * - Autonomous web browsing
 * - Form filling and submission
 * - Data extraction from websites
 * - Multi-step web workflows
 * - Screenshot and visual verification
 * - Session management
 */

import { invokeLLM } from '../_core/llm';
import type { Message } from '../_core/llm';

export interface WebAgentTask {
  id: string;
  goal: string;
  steps: WebAgentStep[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

export interface WebAgentStep {
  id: number;
  action: 'navigate' | 'click' | 'type' | 'extract' | 'wait' | 'screenshot' | 'verify';
  target?: string; // CSS selector or URL
  value?: string; // Text to type or data to verify
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  screenshot?: string;
}

export interface ExtractedData {
  [key: string]: string | string[] | boolean | number | ExtractedData;
}

export class WebAgents {
  private activeTasks: Map<string, WebAgentTask> = new Map();

  /**
   * Create autonomous web agent task
   */
  async createTask(goal: string): Promise<WebAgentTask> {
    console.log(`[WebAgents] Creating task: ${goal}`);

    const taskId = this.generateTaskId();
    const steps = await this.planSteps(goal);

    const task: WebAgentTask = {
      id: taskId,
      goal,
      steps,
      status: 'pending',
    };

    this.activeTasks.set(taskId, task);
    return task;
  }

  /**
   * Plan steps for achieving goal
   */
  private async planSteps(goal: string): Promise<WebAgentStep[]> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: `You are a web automation expert. Plan steps to achieve the goal using browser actions. Respond with JSON:
{
  "steps": [
    {
      "action": "navigate" | "click" | "type" | "extract" | "wait" | "screenshot" | "verify",
      "target": "CSS selector or URL",
      "value": "Text to type or data to verify (optional)"
    }
  ]
}

Available actions:
- navigate: Go to URL (target = URL)
- click: Click element (target = CSS selector)
- type: Type text (target = CSS selector, value = text)
- extract: Extract data (target = CSS selector)
- wait: Wait for element (target = CSS selector)
- screenshot: Take screenshot
- verify: Verify condition (value = condition description)`,
          },
          {
            role: 'user',
            content: `Plan steps to: ${goal}`,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'web_agent_plan',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                steps: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      action: {
                        type: 'string',
                        enum: ['navigate', 'click', 'type', 'extract', 'wait', 'screenshot', 'verify'],
                      },
                      target: { type: 'string' },
                      value: { type: 'string' },
                    },
                    required: ['action'],
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
        return [];
      }

      const textContent = typeof content === 'string' ? content : '';
      const result = JSON.parse(textContent);

      return result.steps.map((step: any, index: number) => ({
        id: index + 1,
        action: step.action,
        target: step.target,
        value: step.value,
        status: 'pending' as const,
      }));
    } catch (error) {
      console.error('[WebAgents] Failed to plan steps:', error);
      return [];
    }
  }

  /**
   * Execute web agent task
   */
  async executeTask(taskId: string): Promise<WebAgentTask> {
    const task = this.activeTasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    console.log(`[WebAgents] Executing task: ${task.goal}`);
    task.status = 'running';

    try {
      for (const step of task.steps) {
        step.status = 'running';
        console.log(`[WebAgents] Executing step ${step.id}: ${step.action}`);

        try {
          const result = await this.executeStep(step);
          step.result = result;
          step.status = 'completed';
        } catch (error) {
          console.error(`[WebAgents] Step ${step.id} failed:`, error);
          step.status = 'failed';
          task.status = 'failed';
          task.error = `Step ${step.id} failed: ${error}`;
          return task;
        }
      }

      task.status = 'completed';
      task.result = this.collectResults(task.steps);
      console.log(`[WebAgents] Task completed: ${task.goal}`);
    } catch (error) {
      task.status = 'failed';
      task.error = String(error);
      console.error(`[WebAgents] Task failed:`, error);
    }

    return task;
  }

  /**
   * Execute single step
   */
  private async executeStep(step: WebAgentStep): Promise<any> {
    // Note: In production, this would use actual browser automation (Playwright/Puppeteer)
    // For now, we simulate the execution

    console.log(`[WebAgents] Simulating ${step.action} on ${step.target}`);

    switch (step.action) {
      case 'navigate':
        return { url: step.target, success: true };

      case 'click':
        return { clicked: step.target, success: true };

      case 'type':
        return { typed: step.value, into: step.target, success: true };

      case 'extract':
        return await this.extractData(step.target || '');

      case 'wait':
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { waited: true };

      case 'screenshot':
        return { screenshot: 'base64_encoded_image', success: true };

      case 'verify':
        return { verified: true, condition: step.value };

      default:
        throw new Error(`Unknown action: ${step.action}`);
    }
  }

  /**
   * Extract data from webpage
   */
  private async extractData(selector: string): Promise<ExtractedData> {
    // In production, would use actual browser to extract data
    // For now, return simulated data
    console.log(`[WebAgents] Extracting data from ${selector}`);
    return {
      extracted: true,
      selector,
      data: 'Simulated extracted data',
    };
  }

  /**
   * Collect results from all steps
   */
  private collectResults(steps: WebAgentStep[]): any {
    const results: any = {};

    for (const step of steps) {
      if (step.action === 'extract' && step.result) {
        results[`step_${step.id}`] = step.result;
      }
    }

    return results;
  }

  /**
   * Get task status
   */
  getTask(taskId: string): WebAgentTask | undefined {
    return this.activeTasks.get(taskId);
  }

  /**
   * List all tasks
   */
  listTasks(): WebAgentTask[] {
    return Array.from(this.activeTasks.values());
  }

  /**
   * Cancel task
   */
  async cancelTask(taskId: string): Promise<void> {
    const task = this.activeTasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    if (task.status === 'running') {
      task.status = 'failed';
      task.error = 'Task cancelled by user';
      console.log(`[WebAgents] Task ${taskId} cancelled`);
    }
  }

  /**
   * Retry failed task
   */
  async retryTask(taskId: string): Promise<WebAgentTask> {
    const task = this.activeTasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    // Reset failed steps
    for (const step of task.steps) {
      if (step.status === 'failed') {
        step.status = 'pending';
        step.result = undefined;
      }
    }

    task.status = 'pending';
    task.error = undefined;

    return this.executeTask(taskId);
  }

  /**
   * Generate task ID
   */
  private generateTaskId(): string {
    return `web_agent_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Smart form filling
   */
  async fillForm(
    formSelector: string,
    data: Record<string, string>
  ): Promise<WebAgentTask> {
    const goal = `Fill form ${formSelector} with provided data`;
    const task = await this.createTask(goal);

    // Add steps for each form field
    for (const [field, value] of Object.entries(data)) {
      task.steps.push({
        id: task.steps.length + 1,
        action: 'type',
        target: `${formSelector} [name="${field}"]`,
        value,
        status: 'pending',
      });
    }

    // Add submit step
    task.steps.push({
      id: task.steps.length + 1,
      action: 'click',
      target: `${formSelector} button[type="submit"]`,
      status: 'pending',
    });

    return this.executeTask(task.id);
  }

  /**
   * Extract structured data from page
   */
  async scrapeData(
    url: string,
    schema: Record<string, string>
  ): Promise<ExtractedData> {
    const goal = `Extract data from ${url}`;
    const task = await this.createTask(goal);

    // Navigate to URL
    task.steps.push({
      id: 1,
      action: 'navigate',
      target: url,
      status: 'pending',
    });

    // Extract each field
    for (const [key, selector] of Object.entries(schema)) {
      task.steps.push({
        id: task.steps.length + 1,
        action: 'extract',
        target: selector,
        value: key,
        status: 'pending',
      });
    }

    const result = await this.executeTask(task.id);
    return result.result || {};
  }

  /**
   * Monitor webpage for changes
   */
  async monitorPage(
    url: string,
    selector: string,
    interval: number = 60000
  ): Promise<string> {
    const monitorId = this.generateTaskId();
    console.log(`[WebAgents] Starting monitor ${monitorId} for ${url}`);

    // In production, would set up actual monitoring
    // For now, just log
    console.log(`[WebAgents] Would monitor ${selector} on ${url} every ${interval}ms`);

    return monitorId;
  }

  /**
   * Stop monitoring
   */
  async stopMonitoring(monitorId: string): Promise<void> {
    console.log(`[WebAgents] Stopping monitor ${monitorId}`);
    // In production, would clean up monitoring interval
  }

  /**
   * Perform multi-step workflow
   */
  async executeWorkflow(
    name: string,
    steps: Array<{
      action: string;
      params: Record<string, any>;
    }>
  ): Promise<WebAgentTask> {
    const goal = `Execute workflow: ${name}`;
    const task = await this.createTask(goal);

    // Convert workflow steps to agent steps
    task.steps = steps.map((step, index) => ({
      id: index + 1,
      action: step.action as any,
      target: step.params.target,
      value: step.params.value,
      status: 'pending' as const,
    }));

    return this.executeTask(task.id);
  }

  /**
   * Intelligent element selection
   */
  async findElement(
    description: string,
    context?: string
  ): Promise<string> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: `You are a web automation expert. Given a description of an element, provide the best CSS selector to find it. Respond with just the selector.`,
          },
          {
            role: 'user',
            content: `Find element: ${description}${context ? `\nContext: ${context}` : ''}`,
          },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from LLM');
      }

      return typeof content === 'string' ? content.trim() : '';
    } catch (error) {
      console.error('[WebAgents] Failed to find element:', error);
      throw error;
    }
  }

  /**
   * Visual verification
   */
  async verifyVisual(
    screenshot: string,
    expectedCondition: string
  ): Promise<boolean> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: `You are a visual verification expert. Analyze the screenshot and determine if the expected condition is met. Respond with JSON:
{
  "verified": true | false,
  "confidence": 0.0-1.0,
  "explanation": "Why verified or not"
}`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Verify: ${expectedCondition}`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: screenshot,
                },
              },
            ],
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'visual_verification',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                verified: { type: 'boolean' },
                confidence: { type: 'number' },
                explanation: { type: 'string' },
              },
              required: ['verified', 'confidence', 'explanation'],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return false;
      }

      const textContent = typeof content === 'string' ? content : '';
      const result = JSON.parse(textContent);
      return result.verified && result.confidence > 0.7;
    } catch (error) {
      console.error('[WebAgents] Failed to verify visual:', error);
      return false;
    }
  }
}

// Singleton instance
export const webAgents = new WebAgents();
