/**
 * Parallel Execution System (Map)
 * Allows executing multiple tasks in parallel with result aggregation
 */

import { AgentOrchestrator } from "./orchestrator";

export interface MapTask {
  id: string;
  input: any;
  prompt: string;
}

export interface MapResult {
  id: string;
  input: any;
  output: any;
  error?: string;
  duration: number;
}

export interface MapOptions {
  maxConcurrency?: number;
  timeout?: number;
  continueOnError?: boolean;
}

export class ParallelExecutor {
  private orchestrator: AgentOrchestrator;

  constructor(orchestrator: AgentOrchestrator) {
    this.orchestrator = orchestrator;
  }

  /**
   * Execute multiple tasks in parallel with controlled concurrency
   */
  async map(
    tasks: MapTask[],
    options: MapOptions = {}
  ): Promise<MapResult[]> {
    const {
      maxConcurrency = 5,
      timeout = 60000,
      continueOnError = true,
    } = options;

    const results: MapResult[] = [];
    const executing: Promise<void>[] = [];

    for (const task of tasks) {
      // Wait if we've reached max concurrency
      if (executing.length >= maxConcurrency) {
        await Promise.race(executing);
      }

      // Start task execution
      const promise = this.executeTask(task, timeout, continueOnError).then(
        (result) => {
          results.push(result);
          // Remove from executing array
          const index = executing.indexOf(promise);
          if (index > -1) {
            executing.splice(index, 1);
          }
        }
      );

      executing.push(promise);
    }

    // Wait for all remaining tasks
    await Promise.all(executing);

    return results;
  }

  /**
   * Execute a single task with timeout
   */
  private async executeTask(
    task: MapTask,
    timeout: number,
    continueOnError: boolean
  ): Promise<MapResult> {
    const startTime = Date.now();

    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Task timeout")), timeout);
      });

      // Execute task with orchestrator
      const executionPromise = this.orchestrator.processMessage(
        task.prompt,
        {
          userId: 0, // System user for parallel tasks
          sessionId: 0,
          mode: "sandbox",
        },
        {
          model: "gpt-4o-mini",
          maxIterations: 5,
        }
      );

      // Race between execution and timeout
      const result = await Promise.race([executionPromise, timeoutPromise]);

      return {
        id: task.id,
        input: task.input,
        output: result,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (!continueOnError) {
        throw error;
      }

      return {
        id: task.id,
        input: task.input,
        output: null,
        error: errorMessage,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Map over an array of inputs with a template prompt
   */
  async mapArray<T, R>(
    inputs: T[],
    promptTemplate: (input: T) => string,
    options: MapOptions = {}
  ): Promise<Array<{ input: T; output: R; error?: string }>> {
    const tasks: MapTask[] = inputs.map((input, index) => ({
      id: `task-${index}`,
      input,
      prompt: promptTemplate(input),
    }));

    const results = await this.map(tasks, options);

    return results.map((result) => ({
      input: result.input as T,
      output: result.output as R,
      error: result.error,
    }));
  }

  /**
   * Parallel reduce: execute tasks and aggregate results
   */
  async reduce<T, R>(
    inputs: T[],
    promptTemplate: (input: T) => string,
    reducer: (acc: R, current: any, input: T) => R,
    initialValue: R,
    options: MapOptions = {}
  ): Promise<R> {
    const results = await this.mapArray(inputs, promptTemplate, options);

    return results.reduce((acc, { input, output }) => {
      return reducer(acc, output, input);
    }, initialValue);
  }

  /**
   * Parallel filter: execute tasks and filter based on results
   */
  async filter<T>(
    inputs: T[],
    promptTemplate: (input: T) => string,
    predicate: (output: any, input: T) => boolean,
    options: MapOptions = {}
  ): Promise<T[]> {
    const results = await this.mapArray(inputs, promptTemplate, options);

    return results
      .filter(({ input, output }) => predicate(output, input))
      .map(({ input }) => input);
  }

  /**
   * Batch processing with automatic chunking
   */
  async batch<T, R>(
    inputs: T[],
    promptTemplate: (input: T) => string,
    batchSize: number,
    options: MapOptions = {}
  ): Promise<Array<{ input: T; output: R; error?: string }>> {
    const batches: T[][] = [];

    // Split into batches
    for (let i = 0; i < inputs.length; i += batchSize) {
      batches.push(inputs.slice(i, i + batchSize));
    }

    const allResults: Array<{ input: T; output: R; error?: string }> = [];

    // Process each batch sequentially
    for (const batch of batches) {
      const batchResults = await this.mapArray<T, R>(
        batch,
        promptTemplate,
        options
      );
      allResults.push(...batchResults);
    }

    return allResults;
  }

  /**
   * Parallel execution with retries
   */
  async mapWithRetry<T, R>(
    inputs: T[],
    promptTemplate: (input: T) => string,
    maxRetries: number = 3,
    options: MapOptions = {}
  ): Promise<Array<{ input: T; output: R; error?: string; retries: number }>> {
    const tasks: MapTask[] = inputs.map((input, index) => ({
      id: `task-${index}`,
      input,
      prompt: promptTemplate(input),
    }));

    const results: Array<{
      input: T;
      output: R;
      error?: string;
      retries: number;
    }> = [];

    for (const task of tasks) {
      let lastError: string | undefined;
      let retries = 0;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const result = await this.executeTask(
            task,
            options.timeout || 60000,
            false
          );

          if (!result.error) {
            results.push({
              input: task.input as T,
              output: result.output as R,
              retries: attempt,
            });
            break;
          }

          lastError = result.error;
          retries = attempt;

          if (attempt < maxRetries) {
            // Exponential backoff
            await new Promise((resolve) =>
              setTimeout(resolve, Math.pow(2, attempt) * 1000)
            );
          }
        } catch (error) {
          lastError =
            error instanceof Error ? error.message : "Unknown error";
          retries = attempt;

          if (attempt < maxRetries) {
            await new Promise((resolve) =>
              setTimeout(resolve, Math.pow(2, attempt) * 1000)
            );
          }
        }
      }

      // If all retries failed
      if (lastError) {
        results.push({
          input: task.input as T,
          output: null as R,
          error: lastError,
          retries,
        });
      }
    }

    return results;
  }
}
