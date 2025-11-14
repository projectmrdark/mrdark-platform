/**
 * Task Scheduling System
 * Allows scheduling AI agent tasks to run at specific times or intervals
 */

import { getDb } from "../db";
import { sql } from "drizzle-orm";
import { AgentOrchestrator } from "./orchestrator";

export interface ScheduledTask {
  id: number;
  userId: number;
  name: string;
  prompt: string;
  schedule: string; // cron expression or interval
  type: "cron" | "interval";
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  createdAt: Date;
}

export class TaskScheduler {
  private timers: Map<number, NodeJS.Timeout> = new Map();
  private orchestrator: AgentOrchestrator;

  constructor(orchestrator: AgentOrchestrator) {
    this.orchestrator = orchestrator;
  }

  /**
   * Schedule a new task
   */
  async scheduleTask(task: Omit<ScheduledTask, "id" | "createdAt">): Promise<number> {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Insert task into database
    const result = await db.execute(sql`
      INSERT INTO scheduled_tasks (user_id, name, prompt, schedule, type, enabled, next_run, created_at)
      VALUES (${task.userId}, ${task.name}, ${task.prompt}, ${task.schedule}, ${task.type}, ${task.enabled ? 1 : 0}, ${this.calculateNextRun(task.schedule, task.type)}, NOW())
    `);

    const taskId = Number((result as any).insertId);

    if (task.enabled) {
      this.startTask(taskId);
    }

    return taskId;
  }

  /**
   * Start a scheduled task
   */
  private async startTask(taskId: number): Promise<void> {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const tasks = await db.execute(sql`SELECT * FROM scheduled_tasks WHERE id = ${taskId}`);

    if (!Array.isArray(tasks) || tasks.length < 1) {
      return;
    }

    const task = tasks[0] as any;

    if (task.type === "interval") {
      // Parse interval in seconds
      const intervalMs = parseInt(task.schedule) * 1000;

      const timer = setInterval(async () => {
        await this.executeTask(task);
      }, intervalMs);

      this.timers.set(taskId, timer);
    } else if (task.type === "cron") {
      // For cron, we need to calculate next run time
      // This is a simplified implementation
      const nextRun = this.calculateNextRun(task.schedule, task.type);
      const delay = nextRun.getTime() - Date.now();

      if (delay > 0) {
        const timer = setTimeout(async () => {
          await this.executeTask(task);
          // Reschedule for next run
          this.startTask(taskId);
        }, delay);

        this.timers.set(taskId, timer);
      }
    }
  }

  /**
   * Execute a scheduled task
   */
  private async executeTask(task: any): Promise<void> {
    const db = await getDb();
    if (!db) {
      return;
    }

    try {
      // Create a new session for this task
      const sessionResult = await db.execute(sql`
        INSERT INTO sessions (user_id, title, created_at, updated_at)
        VALUES (${task.user_id}, ${`Scheduled: ${task.name}`}, NOW(), NOW())
      `);

      const sessionId = Number((sessionResult as any).insertId);

      // Execute the task
      await this.orchestrator.processMessage(
        task.prompt,
        {
          sessionId,
          userId: task.user_id,
          mode: "sandbox" as const,
        },
        {
          model: "gpt-4",
          maxIterations: 10,
        }
      );

      // Update last run time
      await db.execute(sql`
        UPDATE scheduled_tasks SET last_run = NOW(), next_run = ${this.calculateNextRun(task.schedule, task.type)} WHERE id = ${task.id}
      `);
    } catch (error) {
      console.error(`Error executing scheduled task ${task.id}:`, error);
    }
  }

  /**
   * Calculate next run time
   */
  private calculateNextRun(schedule: string, type: string): Date {
    if (type === "interval") {
      const intervalSeconds = parseInt(schedule);
      return new Date(Date.now() + intervalSeconds * 1000);
    } else {
      // For cron, this is a simplified implementation
      // In production, use a proper cron parser like node-cron
      return new Date(Date.now() + 60 * 60 * 1000); // Default to 1 hour
    }
  }

  /**
   * Stop a scheduled task
   */
  async stopTask(taskId: number): Promise<void> {
    const timer = this.timers.get(taskId);
    if (timer) {
      clearTimeout(timer);
      clearInterval(timer);
      this.timers.delete(taskId);
    }

    const db = await getDb();
    if (db) {
      await db.execute(sql`UPDATE scheduled_tasks SET enabled = 0 WHERE id = ${taskId}`);
    }
  }

  /**
   * Delete a scheduled task
   */
  async deleteTask(taskId: number): Promise<void> {
    await this.stopTask(taskId);

    const db = await getDb();
    if (db) {
      await db.execute(sql`DELETE FROM scheduled_tasks WHERE id = ${taskId}`);
    }
  }

  /**
   * Load and start all enabled tasks
   */
  async loadTasks(): Promise<void> {
    const db = await getDb();
    if (!db) {
      return;
    }

    const tasks = await db.execute(sql`SELECT * FROM scheduled_tasks WHERE enabled = 1`);

    if (Array.isArray(tasks)) {
      for (const task of tasks) {
        this.startTask((task as any).id);
      }
    }
  }
}
