/**
 * Long Task Manager
 * 
 * Inspired by Claude's ability to handle 7+ hour long-running tasks:
 * - Persistent task execution across sessions
 * - Progress tracking and checkpointing
 * - Automatic resume after interruptions
 * - Resource management for extended operations
 * - Multi-step task orchestration
 */

import { invokeLLM } from '../_core/llm';
import type { Message } from '../_core/llm';
import { getDb } from '../db';
import { scheduledTasks } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

export interface LongTask {
  id: string;
  userId: number;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  progress: number; // 0-100
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration: number; // minutes
  actualDuration?: number; // minutes
  checkpoints: TaskCheckpoint[];
  metadata: Record<string, any>;
}

export interface TaskCheckpoint {
  id: string;
  timestamp: Date;
  progress: number;
  state: Record<string, any>;
  message: string;
}

export interface TaskStep {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
}

export class LongTaskManager {
  private activeTasks: Map<string, LongTask> = new Map();
  private taskIntervals: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Create and start a long-running task
   */
  async createTask(
    userId: number,
    title: string,
    description: string,
    estimatedDuration: number
  ): Promise<LongTask> {
    const taskId = this.generateTaskId();

    const task: LongTask = {
      id: taskId,
      userId,
      title,
      description,
      status: 'pending',
      progress: 0,
      estimatedDuration,
      checkpoints: [],
      metadata: {
        createdAt: new Date(),
      },
    };

    this.activeTasks.set(taskId, task);
    console.log(`[LongTaskManager] Created task ${taskId}: ${title}`);

    return task;
  }

  /**
   * Start task execution
   */
  async startTask(taskId: string): Promise<void> {
    const task = this.activeTasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    if (task.status === 'running') {
      console.log(`[LongTaskManager] Task ${taskId} already running`);
      return;
    }

    task.status = 'running';
    task.startedAt = new Date();
    console.log(`[LongTaskManager] Started task ${taskId}`);

    // Create initial checkpoint
    await this.createCheckpoint(taskId, 0, {}, 'Task started');

    // Start progress monitoring
    this.startProgressMonitoring(taskId);
  }

  /**
   * Pause task execution
   */
  async pauseTask(taskId: string): Promise<void> {
    const task = this.activeTasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    if (task.status !== 'running') {
      console.log(`[LongTaskManager] Task ${taskId} not running`);
      return;
    }

    task.status = 'paused';
    console.log(`[LongTaskManager] Paused task ${taskId}`);

    // Create checkpoint before pausing
    await this.createCheckpoint(
      taskId,
      task.progress,
      { pausedAt: new Date() },
      'Task paused'
    );

    // Stop progress monitoring
    this.stopProgressMonitoring(taskId);
  }

  /**
   * Resume task execution
   */
  async resumeTask(taskId: string): Promise<void> {
    const task = this.activeTasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    if (task.status !== 'paused') {
      console.log(`[LongTaskManager] Task ${taskId} not paused`);
      return;
    }

    task.status = 'running';
    console.log(`[LongTaskManager] Resumed task ${taskId}`);

    // Create checkpoint on resume
    await this.createCheckpoint(
      taskId,
      task.progress,
      { resumedAt: new Date() },
      'Task resumed'
    );

    // Restart progress monitoring
    this.startProgressMonitoring(taskId);
  }

  /**
   * Complete task
   */
  async completeTask(taskId: string, result?: any): Promise<void> {
    const task = this.activeTasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.status = 'completed';
    task.progress = 100;
    task.completedAt = new Date();

    if (task.startedAt) {
      task.actualDuration = Math.floor(
        (task.completedAt.getTime() - task.startedAt.getTime()) / 1000 / 60
      );
    }

    console.log(`[LongTaskManager] Completed task ${taskId}`);

    // Create final checkpoint
    await this.createCheckpoint(
      taskId,
      100,
      { result },
      'Task completed successfully'
    );

    // Stop progress monitoring
    this.stopProgressMonitoring(taskId);
  }

  /**
   * Fail task
   */
  async failTask(taskId: string, error: string): Promise<void> {
    const task = this.activeTasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.status = 'failed';
    task.completedAt = new Date();

    if (task.startedAt) {
      task.actualDuration = Math.floor(
        (task.completedAt.getTime() - task.startedAt.getTime()) / 1000 / 60
      );
    }

    console.log(`[LongTaskManager] Failed task ${taskId}: ${error}`);

    // Create failure checkpoint
    await this.createCheckpoint(
      taskId,
      task.progress,
      { error },
      `Task failed: ${error}`
    );

    // Stop progress monitoring
    this.stopProgressMonitoring(taskId);
  }

  /**
   * Update task progress
   */
  async updateProgress(
    taskId: string,
    progress: number,
    message?: string
  ): Promise<void> {
    const task = this.activeTasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.progress = Math.min(100, Math.max(0, progress));

    // Create checkpoint every 10% progress
    if (progress % 10 === 0) {
      await this.createCheckpoint(
        taskId,
        progress,
        {},
        message || `Progress: ${progress}%`
      );
    }
  }

  /**
   * Create checkpoint
   */
  private async createCheckpoint(
    taskId: string,
    progress: number,
    state: Record<string, any>,
    message: string
  ): Promise<void> {
    const task = this.activeTasks.get(taskId);
    if (!task) {
      return;
    }

    const checkpoint: TaskCheckpoint = {
      id: this.generateCheckpointId(),
      timestamp: new Date(),
      progress,
      state,
      message,
    };

    task.checkpoints.push(checkpoint);
    console.log(`[LongTaskManager] Checkpoint created for task ${taskId}: ${message}`);
  }

  /**
   * Start progress monitoring
   */
  private startProgressMonitoring(taskId: string): void {
    // Check progress every 30 seconds
    const interval = setInterval(async () => {
      const task = this.activeTasks.get(taskId);
      if (!task || task.status !== 'running') {
        this.stopProgressMonitoring(taskId);
        return;
      }

      // Monitor for stalls or issues
      await this.checkTaskHealth(taskId);
    }, 30000);

    this.taskIntervals.set(taskId, interval);
  }

  /**
   * Stop progress monitoring
   */
  private stopProgressMonitoring(taskId: string): void {
    const interval = this.taskIntervals.get(taskId);
    if (interval) {
      clearInterval(interval);
      this.taskIntervals.delete(taskId);
    }
  }

  /**
   * Check task health
   */
  private async checkTaskHealth(taskId: string): Promise<void> {
    const task = this.activeTasks.get(taskId);
    if (!task) {
      return;
    }

    // Check if task has been running too long without progress
    const lastCheckpoint = task.checkpoints[task.checkpoints.length - 1];
    if (lastCheckpoint) {
      const timeSinceLastCheckpoint =
        Date.now() - lastCheckpoint.timestamp.getTime();
      const maxStallTime = 5 * 60 * 1000; // 5 minutes

      if (timeSinceLastCheckpoint > maxStallTime) {
        console.warn(
          `[LongTaskManager] Task ${taskId} may be stalled (no progress for ${Math.floor(timeSinceLastCheckpoint / 1000 / 60)} minutes)`
        );
        // Could automatically pause or alert here
      }
    }

    // Check if task exceeded estimated duration significantly
    if (task.startedAt && task.estimatedDuration > 0) {
      const actualDuration = Math.floor(
        (Date.now() - task.startedAt.getTime()) / 1000 / 60
      );
      if (actualDuration > task.estimatedDuration * 1.5) {
        console.warn(
          `[LongTaskManager] Task ${taskId} exceeded estimated duration (${actualDuration}m vs ${task.estimatedDuration}m)`
        );
      }
    }
  }

  /**
   * Get task
   */
  getTask(taskId: string): LongTask | undefined {
    return this.activeTasks.get(taskId);
  }

  /**
   * List all tasks for user
   */
  listTasks(userId: number): LongTask[] {
    return Array.from(this.activeTasks.values()).filter(
      task => task.userId === userId
    );
  }

  /**
   * Get task statistics
   */
  getTaskStatistics(taskId: string): {
    totalCheckpoints: number;
    averageProgressRate: number; // % per minute
    estimatedTimeRemaining: number; // minutes
    isOnTrack: boolean;
  } | null {
    const task = this.activeTasks.get(taskId);
    if (!task || !task.startedAt) {
      return null;
    }

    const totalCheckpoints = task.checkpoints.length;
    const elapsedMinutes = Math.floor(
      (Date.now() - task.startedAt.getTime()) / 1000 / 60
    );

    const averageProgressRate =
      elapsedMinutes > 0 ? task.progress / elapsedMinutes : 0;

    const estimatedTimeRemaining =
      averageProgressRate > 0
        ? Math.ceil((100 - task.progress) / averageProgressRate)
        : 0;

    const isOnTrack =
      task.estimatedDuration > 0
        ? elapsedMinutes + estimatedTimeRemaining <= task.estimatedDuration * 1.2
        : true;

    return {
      totalCheckpoints,
      averageProgressRate,
      estimatedTimeRemaining,
      isOnTrack,
    };
  }

  /**
   * Restore task from checkpoint
   */
  async restoreFromCheckpoint(
    taskId: string,
    checkpointId: string
  ): Promise<void> {
    const task = this.activeTasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    const checkpoint = task.checkpoints.find(cp => cp.id === checkpointId);
    if (!checkpoint) {
      throw new Error(`Checkpoint ${checkpointId} not found`);
    }

    // Restore task state from checkpoint
    task.progress = checkpoint.progress;
    task.status = 'paused';

    console.log(
      `[LongTaskManager] Restored task ${taskId} from checkpoint ${checkpointId}`
    );

    // Remove checkpoints after this one
    const checkpointIndex = task.checkpoints.findIndex(
      cp => cp.id === checkpointId
    );
    task.checkpoints = task.checkpoints.slice(0, checkpointIndex + 1);
  }

  /**
   * Persist task to database
   */
  async persistTask(taskId: string): Promise<void> {
    const task = this.activeTasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    const db = await getDb();
    if (!db) {
      console.warn('[LongTaskManager] Database not available, cannot persist task');
      return;
    }

    try {
      // Store in scheduled_tasks table with special type
      // Store metadata in prompt field as JSON
      const metadata = {
        longTask: true,
        description: task.description,
        progress: task.progress,
        checkpoints: task.checkpoints,
        estimatedDuration: task.estimatedDuration,
        actualDuration: task.actualDuration,
        status: task.status,
      };

      await db.insert(scheduledTasks).values({
        userId: task.userId,
        name: task.title,
        prompt: JSON.stringify(metadata),
        type: 'interval',
        schedule: '3600', // Placeholder interval in seconds
        enabled: task.status === 'completed' ? 0 : 1,
      });

      console.log(`[LongTaskManager] Persisted task ${taskId} to database`);
    } catch (error) {
      console.error(`[LongTaskManager] Failed to persist task ${taskId}:`, error);
    }
  }

  /**
   * Load task from database
   */
  async loadTask(userId: number, taskId: string): Promise<LongTask | null> {
    const db = await getDb();
    if (!db) {
      return null;
    }

    try {
      const results = await db
        .select()
        .from(scheduledTasks)
        .where(
          and(
            eq(scheduledTasks.userId, userId),
            eq(scheduledTasks.name, taskId)
          )
        )
        .limit(1);

      if (results.length === 0) {
        return null;
      }

      const row = results[0];
      let metadata: any;
      try {
        metadata = JSON.parse(row.prompt);
      } catch {
        return null;
      }

      if (!metadata.longTask) {
        return null;
      }

      const task: LongTask = {
        id: taskId,
        userId,
        title: row.name,
        description: metadata.description || '',
        status: metadata.status || (row.enabled ? 'paused' : 'completed'),
        progress: metadata.progress || 0,
        estimatedDuration: metadata.estimatedDuration || 0,
        actualDuration: metadata.actualDuration,
        checkpoints: metadata.checkpoints || [],
        metadata: {},
      };

      this.activeTasks.set(taskId, task);
      console.log(`[LongTaskManager] Loaded task ${taskId} from database`);

      return task;
    } catch (error) {
      console.error(`[LongTaskManager] Failed to load task ${taskId}:`, error);
      return null;
    }
  }

  /**
   * Generate unique task ID
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Generate unique checkpoint ID
   */
  private generateCheckpointId(): string {
    return `cp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Clean up completed tasks older than 7 days
   */
  async cleanupOldTasks(): Promise<void> {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const entries = Array.from(this.activeTasks.entries());
    for (const [taskId, task] of entries) {
      if (
        task.status === 'completed' &&
        task.completedAt &&
        task.completedAt.getTime() < sevenDaysAgo
      ) {
        this.activeTasks.delete(taskId);
        console.log(`[LongTaskManager] Cleaned up old task ${taskId}`);
      }
    }
  }
}

// Singleton instance
export const longTaskManager = new LongTaskManager();

// Clean up old tasks every 24 hours
setInterval(() => {
  longTaskManager.cleanupOldTasks();
}, 24 * 60 * 60 * 1000);
