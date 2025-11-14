/**
 * Workflow Orchestration System
 * Allows creating and executing multi-step workflows with dependencies
 */

import { AgentOrchestrator } from "./orchestrator";
import { ParallelExecutor } from "./parallel";

export interface WorkflowStep {
  id: string;
  name: string;
  prompt: string;
  dependencies?: string[]; // IDs of steps that must complete first
  parallel?: boolean; // Can run in parallel with other steps
  retryOnError?: boolean;
  maxRetries?: number;
  timeout?: number;
}

export interface WorkflowConfig {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  userId: number;
  sessionId: number;
  mode?: "sandbox" | "local";
}

export interface WorkflowResult {
  workflowId: string;
  status: "success" | "failed" | "partial";
  steps: StepResult[];
  totalDuration: number;
  error?: string;
}

export interface StepResult {
  stepId: string;
  status: "success" | "failed" | "skipped";
  output: any;
  error?: string;
  duration: number;
  retries: number;
}

export class WorkflowOrchestrator {
  private orchestrator: AgentOrchestrator;
  private parallelExecutor: ParallelExecutor;
  private workflows: Map<string, WorkflowConfig> = new Map();
  private results: Map<string, Map<string, any>> = new Map(); // workflowId -> stepId -> result

  constructor(orchestrator: AgentOrchestrator) {
    this.orchestrator = orchestrator;
    this.parallelExecutor = new ParallelExecutor(orchestrator);
  }

  /**
   * Register a workflow
   */
  registerWorkflow(config: WorkflowConfig): void {
    // Validate workflow
    this.validateWorkflow(config);
    this.workflows.set(config.id, config);
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflowId: string): Promise<WorkflowResult> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const startTime = Date.now();
    const stepResults: StepResult[] = [];
    const stepOutputs = new Map<string, any>();

    try {
      // Build dependency graph
      const graph = this.buildDependencyGraph(workflow.steps);

      // Execute steps in topological order
      const executionOrder = this.topologicalSort(graph);

      for (const level of executionOrder) {
        // Steps in the same level can run in parallel
        const parallelSteps = level.filter((stepId) => {
          const step = workflow.steps.find((s) => s.id === stepId);
          return step?.parallel !== false;
        });

        const sequentialSteps = level.filter((stepId) => {
          const step = workflow.steps.find((s) => s.id === stepId);
          return step?.parallel === false;
        });

        // Execute parallel steps
        if (parallelSteps.length > 0) {
          const parallelResults = await Promise.all(
            parallelSteps.map((stepId) =>
              this.executeStep(
                workflow.steps.find((s) => s.id === stepId)!,
                stepOutputs,
                workflow
              )
            )
          );

          parallelResults.forEach((result) => {
            stepResults.push(result);
            if (result.status === "success") {
              stepOutputs.set(result.stepId, result.output);
            }
          });
        }

        // Execute sequential steps
        for (const stepId of sequentialSteps) {
          const step = workflow.steps.find((s) => s.id === stepId)!;
          const result = await this.executeStep(step, stepOutputs, workflow);
          stepResults.push(result);

          if (result.status === "success") {
            stepOutputs.set(result.stepId, result.output);
          }
        }
      }

      // Check if all steps succeeded
      const allSuccess = stepResults.every((r) => r.status === "success");
      const anyFailed = stepResults.some((r) => r.status === "failed");

      return {
        workflowId,
        status: allSuccess ? "success" : anyFailed ? "failed" : "partial",
        steps: stepResults,
        totalDuration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        workflowId,
        status: "failed",
        steps: stepResults,
        totalDuration: Date.now() - startTime,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Execute a single workflow step
   */
  private async executeStep(
    step: WorkflowStep,
    previousOutputs: Map<string, any>,
    workflow: WorkflowConfig
  ): Promise<StepResult> {
    const startTime = Date.now();
    const maxRetries = step.maxRetries || 0;
    let retries = 0;

    // Check dependencies
    if (step.dependencies) {
      for (const depId of step.dependencies) {
        if (!previousOutputs.has(depId)) {
          return {
            stepId: step.id,
            status: "skipped",
            output: null,
            error: `Dependency ${depId} not satisfied`,
            duration: 0,
            retries: 0,
          };
        }
      }
    }

    // Prepare prompt with dependency outputs
    let prompt = step.prompt;
    if (step.dependencies) {
      const depOutputs = step.dependencies.map((depId) => ({
        stepId: depId,
        output: previousOutputs.get(depId),
      }));

      prompt = `${prompt}\n\nPrevious step outputs:\n${JSON.stringify(
        depOutputs,
        null,
        2
      )}`;
    }

    // Execute with retries
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.orchestrator.processMessage(
          prompt,
          {
            userId: workflow.userId,
            sessionId: workflow.sessionId,
            mode: workflow.mode || "sandbox",
          },
          {
            model: "gpt-4o-mini",
            maxIterations: 10,
          }
        );

        return {
          stepId: step.id,
          status: "success",
          output: result,
          duration: Date.now() - startTime,
          retries: attempt,
        };
      } catch (error) {
        retries = attempt;

        if (attempt < maxRetries && step.retryOnError) {
          // Exponential backoff
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
          continue;
        }

        return {
          stepId: step.id,
          status: "failed",
          output: null,
          error: error instanceof Error ? error.message : "Unknown error",
          duration: Date.now() - startTime,
          retries,
        };
      }
    }

    // Should never reach here
    return {
      stepId: step.id,
      status: "failed",
      output: null,
      error: "Max retries exceeded",
      duration: Date.now() - startTime,
      retries,
    };
  }

  /**
   * Build dependency graph
   */
  private buildDependencyGraph(
    steps: WorkflowStep[]
  ): Map<string, Set<string>> {
    const graph = new Map<string, Set<string>>();

    for (const step of steps) {
      if (!graph.has(step.id)) {
        graph.set(step.id, new Set());
      }

      if (step.dependencies) {
        for (const depId of step.dependencies) {
          if (!graph.has(depId)) {
            graph.set(depId, new Set());
          }
          graph.get(depId)!.add(step.id);
        }
      }
    }

    return graph;
  }

  /**
   * Topological sort for dependency resolution
   * Returns array of levels, where each level contains steps that can run in parallel
   */
  private topologicalSort(graph: Map<string, Set<string>>): string[][] {
    const levels: string[][] = [];
    const inDegree = new Map<string, number>();
    const processed = new Set<string>();

    // Calculate in-degrees
    for (const [node, _] of Array.from(graph.entries())) {
      if (!inDegree.has(node)) {
        inDegree.set(node, 0);
      }
    }

    for (const [_, neighbors] of Array.from(graph.entries())) {
      for (const neighbor of Array.from(neighbors)) {
        inDegree.set(neighbor, (inDegree.get(neighbor) || 0) + 1);
      }
    }

    // Process nodes level by level
    while (processed.size < graph.size) {
      const currentLevel: string[] = [];

      // Find all nodes with in-degree 0
      for (const [node, degree] of Array.from(inDegree.entries())) {
        if (degree === 0 && !processed.has(node)) {
          currentLevel.push(node);
        }
      }

      if (currentLevel.length === 0) {
        throw new Error("Circular dependency detected in workflow");
      }

      levels.push(currentLevel);

      // Mark as processed and update in-degrees
      for (const node of currentLevel) {
        processed.add(node);
        inDegree.delete(node);

        const neighbors = graph.get(node) || new Set();
        for (const neighbor of Array.from(neighbors)) {
          inDegree.set(neighbor, (inDegree.get(neighbor) || 1) - 1);
        }
      }
    }

    return levels;
  }

  /**
   * Validate workflow configuration
   */
  private validateWorkflow(config: WorkflowConfig): void {
    const stepIds = new Set(config.steps.map((s) => s.id));

    // Check for duplicate step IDs
    if (stepIds.size !== config.steps.length) {
      throw new Error("Duplicate step IDs found in workflow");
    }

    // Check dependencies exist
    for (const step of config.steps) {
      if (step.dependencies) {
        for (const depId of step.dependencies) {
          if (!stepIds.has(depId)) {
            throw new Error(
              `Step ${step.id} depends on non-existent step ${depId}`
            );
          }
        }
      }
    }

    // Check for circular dependencies
    try {
      const graph = this.buildDependencyGraph(config.steps);
      this.topologicalSort(graph);
    } catch (error) {
      throw new Error("Workflow validation failed: circular dependencies");
    }
  }

  /**
   * Get workflow status
   */
  getWorkflow(workflowId: string): WorkflowConfig | undefined {
    return this.workflows.get(workflowId);
  }

  /**
   * List all workflows
   */
  listWorkflows(): WorkflowConfig[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Delete a workflow
   */
  deleteWorkflow(workflowId: string): boolean {
    return this.workflows.delete(workflowId);
  }
}
