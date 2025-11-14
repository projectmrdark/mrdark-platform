/**
 * Workflow Visualizer
 * 
 * Provides detailed visualization and debugging for AI workflows:
 * - Step-by-step execution tracking
 * - Real-time progress visualization
 * - Dependency graph visualization
 * - Performance metrics
 * - Error tracking and debugging
 * - Execution replay
 */

// Workflow types for visualization
export interface WorkflowDefinition {
  id: string;
  name: string;
  steps: Array<{
    id: string;
    name: string;
    dependencies?: string[];
  }>;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  steps: Array<{
    stepId: string;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    startTime: Date;
    endTime?: Date;
    duration?: number;
    input?: any;
    output?: any;
    error?: string;
  }>;
}

export interface WorkflowVisualization {
  workflowId: string;
  executionId: string;
  graph: WorkflowGraph;
  timeline: WorkflowTimeline;
  metrics: WorkflowMetrics;
  errors: WorkflowError[];
}

export interface WorkflowGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  layout: 'horizontal' | 'vertical' | 'tree' | 'force';
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'step' | 'start' | 'end' | 'decision' | 'parallel';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  data: {
    stepId: string;
    duration?: number;
    startTime?: Date;
    endTime?: Date;
    input?: any;
    output?: any;
    error?: string;
  };
  position: { x: number; y: number };
  style: {
    color: string;
    borderColor: string;
    backgroundColor: string;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type: 'dependency' | 'data-flow' | 'conditional';
  animated: boolean;
  style: {
    strokeWidth: number;
    stroke: string;
    strokeDasharray?: string;
  };
}

export interface WorkflowTimeline {
  totalDuration: number;
  steps: TimelineStep[];
  parallelGroups: ParallelGroup[];
}

export interface TimelineStep {
  stepId: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  status: 'running' | 'completed' | 'failed';
  progress: number; // 0-100
  children?: TimelineStep[];
}

export interface ParallelGroup {
  id: string;
  steps: string[];
  startTime: Date;
  endTime?: Date;
}

export interface WorkflowMetrics {
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  skippedSteps: number;
  totalDuration: number;
  averageStepDuration: number;
  longestStep: { stepId: string; duration: number };
  shortestStep: { stepId: string; duration: number };
  resourceUsage: {
    cpu: number; // %
    memory: number; // MB
    network: number; // MB
    storage: number; // MB
  };
}

export interface WorkflowError {
  stepId: string;
  timestamp: Date;
  error: string;
  stack?: string;
  context: Record<string, any>;
  recoverable: boolean;
  retryCount: number;
}

export class WorkflowVisualizer {
  /**
   * Generate workflow visualization
   */
  async visualize(
    workflow: WorkflowDefinition,
    execution?: WorkflowExecution
  ): Promise<WorkflowVisualization> {
    const graph = this.generateGraph(workflow, execution);
    const timeline = execution ? this.generateTimeline(execution) : this.generateEmptyTimeline();
    const metrics = execution ? this.calculateMetrics(execution) : this.getEmptyMetrics();
    const errors = execution ? this.extractErrors(execution) : [];

    return {
      workflowId: workflow.id,
      executionId: execution?.id || 'preview',
      graph,
      timeline,
      metrics,
      errors,
    };
  }

  /**
   * Generate workflow graph
   */
  private generateGraph(
    workflow: WorkflowDefinition,
    execution?: WorkflowExecution
  ): WorkflowGraph {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // Add start node
    nodes.push({
      id: 'start',
      label: 'Start',
      type: 'start',
      status: execution ? 'completed' : 'pending',
      data: { stepId: 'start' },
      position: { x: 0, y: 0 },
      style: {
        color: '#ffffff',
        borderColor: '#22c55e',
        backgroundColor: '#16a34a',
      },
    });

    // Add step nodes
    let yOffset = 100;
    for (const step of workflow.steps) {
      const stepExecution = execution?.steps.find(s => s.stepId === step.id);
      const status = stepExecution?.status || 'pending';

      nodes.push({
        id: step.id,
        label: step.name,
        type: 'step',
        status,
        data: {
          stepId: step.id,
          duration: stepExecution?.duration,
          startTime: stepExecution?.startTime,
          endTime: stepExecution?.endTime,
          input: stepExecution?.input,
          output: stepExecution?.output,
          error: stepExecution?.error,
        },
        position: { x: 200, y: yOffset },
        style: this.getNodeStyle(status),
      });

      // Add dependencies as edges
      if (step.dependencies) {
        for (const dep of step.dependencies) {
          edges.push({
            id: `${dep}-${step.id}`,
            source: dep,
            target: step.id,
            type: 'dependency',
            animated: status === 'running',
            style: {
              strokeWidth: 2,
              stroke: '#64748b',
            },
          });
        }
      } else {
        // Connect to start if no dependencies
        edges.push({
          id: `start-${step.id}`,
          source: 'start',
          target: step.id,
          type: 'dependency',
          animated: status === 'running',
          style: {
            strokeWidth: 2,
            stroke: '#64748b',
          },
        });
      }

      yOffset += 100;
    }

    // Add end node
    nodes.push({
      id: 'end',
      label: 'End',
      type: 'end',
      status: execution?.status === 'completed' ? 'completed' : 'pending',
      data: { stepId: 'end' },
      position: { x: 400, y: yOffset },
      style: {
        color: '#ffffff',
        borderColor: '#3b82f6',
        backgroundColor: '#2563eb',
      },
    });

    // Connect last steps to end
    const lastSteps = workflow.steps.filter(step => {
      return !workflow.steps.some(s => s.dependencies?.includes(step.id));
    });

    for (const step of lastSteps) {
      edges.push({
        id: `${step.id}-end`,
        source: step.id,
        target: 'end',
        type: 'dependency',
        animated: false,
        style: {
          strokeWidth: 2,
          stroke: '#64748b',
        },
      });
    }

    return {
      nodes,
      edges,
      layout: 'vertical',
    };
  }

  /**
   * Get node style based on status
   */
  private getNodeStyle(status: string): GraphNode['style'] {
    const styles: Record<string, GraphNode['style']> = {
      pending: {
        color: '#94a3b8',
        borderColor: '#64748b',
        backgroundColor: '#1e293b',
      },
      running: {
        color: '#ffffff',
        borderColor: '#3b82f6',
        backgroundColor: '#2563eb',
      },
      completed: {
        color: '#ffffff',
        borderColor: '#22c55e',
        backgroundColor: '#16a34a',
      },
      failed: {
        color: '#ffffff',
        borderColor: '#ef4444',
        backgroundColor: '#dc2626',
      },
      skipped: {
        color: '#94a3b8',
        borderColor: '#64748b',
        backgroundColor: '#334155',
      },
    };

    return styles[status] || styles.pending;
  }

  /**
   * Generate timeline
   */
  private generateTimeline(execution: WorkflowExecution): WorkflowTimeline {
    const steps: TimelineStep[] = [];
    const parallelGroups: ParallelGroup[] = [];

    for (const step of execution.steps) {
      steps.push({
        stepId: step.stepId,
        name: step.name,
        startTime: step.startTime,
        endTime: step.endTime,
        duration: step.duration || 0,
        status: step.status === 'completed' || step.status === 'running' || step.status === 'failed' ? step.status : 'running',
        progress: step.status === 'completed' ? 100 : step.status === 'running' ? 50 : 0,
      });
    }

    // Detect parallel groups
    const timeRanges = new Map<string, { start: number; end: number }>();
    for (const step of execution.steps) {
      if (step.startTime && step.endTime) {
        timeRanges.set(step.stepId, {
          start: step.startTime.getTime(),
          end: step.endTime.getTime(),
        });
      }
    }

    // Find overlapping steps
    const overlapping: string[][] = [];
    const stepIds = Array.from(timeRanges.keys());

    for (let i = 0; i < stepIds.length; i++) {
      for (let j = i + 1; j < stepIds.length; j++) {
        const range1 = timeRanges.get(stepIds[i])!;
        const range2 = timeRanges.get(stepIds[j])!;

        if (range1.start < range2.end && range2.start < range1.end) {
          // Overlapping
          let found = false;
          for (const group of overlapping) {
            if (group.includes(stepIds[i]) || group.includes(stepIds[j])) {
              if (!group.includes(stepIds[i])) group.push(stepIds[i]);
              if (!group.includes(stepIds[j])) group.push(stepIds[j]);
              found = true;
              break;
            }
          }
          if (!found) {
            overlapping.push([stepIds[i], stepIds[j]]);
          }
        }
      }
    }

    // Create parallel groups
    for (const group of overlapping) {
      const groupSteps = execution.steps.filter(s => group.includes(s.stepId));
      const startTimes = groupSteps.map(s => s.startTime.getTime());
      const endTimes = groupSteps.filter(s => s.endTime).map(s => s.endTime!.getTime());

      parallelGroups.push({
        id: `parallel-${group.join('-')}`,
        steps: group,
        startTime: new Date(Math.min(...startTimes)),
        endTime: endTimes.length > 0 ? new Date(Math.max(...endTimes)) : undefined,
      });
    }

    const totalDuration = execution.endTime
      ? execution.endTime.getTime() - execution.startTime.getTime()
      : Date.now() - execution.startTime.getTime();

    return {
      totalDuration,
      steps,
      parallelGroups,
    };
  }

  /**
   * Generate empty timeline
   */
  private generateEmptyTimeline(): WorkflowTimeline {
    return {
      totalDuration: 0,
      steps: [],
      parallelGroups: [],
    };
  }

  /**
   * Calculate metrics
   */
  private calculateMetrics(execution: WorkflowExecution): WorkflowMetrics {
    const completedSteps = execution.steps.filter(s => s.status === 'completed').length;
    const failedSteps = execution.steps.filter(s => s.status === 'failed').length;
    const skippedSteps = execution.steps.filter(s => s.status === 'skipped').length;

    const durations = execution.steps
      .filter(s => s.duration !== undefined)
      .map(s => s.duration!);

    const averageStepDuration =
      durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

    const longestStep = execution.steps.reduce((longest: { stepId: string; duration: number } | null, step) => {
      if (!step.duration) return longest;
      if (!longest || step.duration > longest.duration) {
        return { stepId: step.stepId, duration: step.duration };
      }
      return longest;
    }, null as { stepId: string; duration: number } | null);

    const shortestStep = execution.steps.reduce((shortest: { stepId: string; duration: number } | null, step) => {
      if (!step.duration) return shortest;
      if (!shortest || step.duration < shortest.duration) {
        return { stepId: step.stepId, duration: step.duration };
      }
      return shortest;
    }, null as { stepId: string; duration: number } | null);

    const totalDuration = execution.endTime
      ? execution.endTime.getTime() - execution.startTime.getTime()
      : Date.now() - execution.startTime.getTime();

    return {
      totalSteps: execution.steps.length,
      completedSteps,
      failedSteps,
      skippedSteps,
      totalDuration,
      averageStepDuration,
      longestStep: longestStep || { stepId: '', duration: 0 },
      shortestStep: shortestStep || { stepId: '', duration: 0 },
      resourceUsage: {
        cpu: 0,
        memory: 0,
        network: 0,
        storage: 0,
      },
    };
  }

  /**
   * Get empty metrics
   */
  private getEmptyMetrics(): WorkflowMetrics {
    return {
      totalSteps: 0,
      completedSteps: 0,
      failedSteps: 0,
      skippedSteps: 0,
      totalDuration: 0,
      averageStepDuration: 0,
      longestStep: { stepId: '', duration: 0 },
      shortestStep: { stepId: '', duration: 0 },
      resourceUsage: {
        cpu: 0,
        memory: 0,
        network: 0,
        storage: 0,
      },
    };
  }

  /**
   * Extract errors
   */
  private extractErrors(execution: WorkflowExecution): WorkflowError[] {
    const errors: WorkflowError[] = [];

    for (const step of execution.steps) {
      if (step.status === 'failed' && step.error) {
        errors.push({
          stepId: step.stepId,
          timestamp: step.endTime || new Date(),
          error: step.error,
          context: step.input || {},
          recoverable: true,
          retryCount: 0,
        });
      }
    }

    return errors;
  }

  /**
   * Generate execution replay
   */
  async generateReplay(execution: WorkflowExecution): Promise<{
    frames: ReplayFrame[];
    duration: number;
  }> {
    const frames: ReplayFrame[] = [];

    // Sort steps by start time
    const sortedSteps = [...execution.steps].sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime()
    );

    for (const step of sortedSteps) {
      // Start frame
      frames.push({
        timestamp: step.startTime,
        type: 'step-start',
        stepId: step.stepId,
        data: {
          name: step.name,
          input: step.input,
        },
      });

      // End frame
      if (step.endTime) {
        frames.push({
          timestamp: step.endTime,
          type: step.status === 'completed' ? 'step-complete' : 'step-failed',
          stepId: step.stepId,
          data: {
            output: step.output,
            error: step.error,
            duration: step.duration,
          },
        });
      }
    }

    const duration = execution.endTime
      ? execution.endTime.getTime() - execution.startTime.getTime()
      : Date.now() - execution.startTime.getTime();

    return { frames, duration };
  }

  /**
   * Export visualization as JSON
   */
  async exportJSON(visualization: WorkflowVisualization): Promise<string> {
    return JSON.stringify(visualization, null, 2);
  }

  /**
   * Export visualization as SVG
   */
  async exportSVG(visualization: WorkflowVisualization): Promise<string> {
    // In production, would generate actual SVG
    return `<svg><!-- Workflow visualization --></svg>`;
  }
}

export interface ReplayFrame {
  timestamp: Date;
  type: 'step-start' | 'step-complete' | 'step-failed' | 'workflow-start' | 'workflow-complete';
  stepId: string;
  data: Record<string, any>;
}

// Singleton instance
export const workflowVisualizer = new WorkflowVisualizer();
