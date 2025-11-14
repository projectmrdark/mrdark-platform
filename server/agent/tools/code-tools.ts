import { Tool, ToolResult } from "./registry";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import * as path from "path";

const execAsync = promisify(exec);

export const executePythonTool: Tool = {
  name: "execute_python",
  description: "Execute Python code in a sandboxed environment",
  category: "code",
  parameters: [
    {
      name: "code",
      type: "string",
      description: "The Python code to execute",
      required: true,
    },
    {
      name: "timeout",
      type: "number",
      description: "Execution timeout in seconds (default: 30)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { code, timeout = 30 } = params;
      const { sessionId } = context;

      // Create temp file
      const tempFile = `/tmp/python_${sessionId}_${Date.now()}.py`;
      await fs.writeFile(tempFile, code, 'utf-8');

      const startTime = Date.now();
      
      // Execute Python code
      const { stdout, stderr } = await execAsync(
        `python3 ${tempFile}`,
        { timeout: timeout * 1000 }
      );

      const executionTime = (Date.now() - startTime) / 1000;

      // Clean up
      await fs.unlink(tempFile).catch(() => {});

      return {
        success: true,
        result: stdout || stderr || "Code executed successfully (no output)",
        metadata: {
          execution_time: executionTime,
          exit_code: 0,
          stderr: stderr || undefined,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export const executeJavaScriptTool: Tool = {
  name: "execute_javascript",
  description: "Execute JavaScript code in a sandboxed environment",
  category: "code",
  parameters: [
    {
      name: "code",
      type: "string",
      description: "The JavaScript code to execute",
      required: true,
    },
    {
      name: "timeout",
      type: "number",
      description: "Execution timeout in seconds (default: 30)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { code, timeout = 30 } = params;
      const { sessionId } = context;

      // Create temp file
      const tempFile = `/tmp/javascript_${sessionId}_${Date.now()}.js`;
      await fs.writeFile(tempFile, code, 'utf-8');

      const startTime = Date.now();
      
      // Execute JavaScript code
      const { stdout, stderr } = await execAsync(
        `node ${tempFile}`,
        { timeout: timeout * 1000 }
      );

      const executionTime = (Date.now() - startTime) / 1000;

      // Clean up
      await fs.unlink(tempFile).catch(() => {});

      return {
        success: true,
        result: stdout || stderr || "Code executed successfully (no output)",
        metadata: {
          execution_time: executionTime,
          exit_code: 0,
          stderr: stderr || undefined,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export const executeShellTool: Tool = {
  name: "execute_shell",
  description: "Execute shell commands in a sandboxed environment",
  category: "code",
  parameters: [
    {
      name: "command",
      type: "string",
      description: "The shell command to execute",
      required: true,
    },
    {
      name: "timeout",
      type: "number",
      description: "Execution timeout in seconds (default: 30)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { command, timeout = 30 } = params;

      const startTime = Date.now();
      
      // Execute shell command
      const { stdout, stderr } = await execAsync(
        command,
        { timeout: timeout * 1000 }
      );

      const executionTime = (Date.now() - startTime) / 1000;

      return {
        success: true,
        result: stdout || stderr || "Command executed successfully (no output)",
        metadata: {
          execution_time: executionTime,
          exit_code: 0,
          stderr: stderr || undefined,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};
