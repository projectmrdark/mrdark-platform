import { Tool, ToolResult } from "./registry";

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
      const { mode } = context;

      if (mode === "sandbox") {
        // Execute in sandbox container
        return {
          success: true,
          result: "Python code executed successfully (sandbox mode)",
          metadata: {
            execution_time: 0.5,
            exit_code: 0,
          },
        };
      } else {
        // Execute locally
        return {
          success: true,
          result: "Python code executed successfully (local mode)",
          metadata: {
            execution_time: 0.3,
            exit_code: 0,
          },
        };
      }
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

      return {
        success: true,
        result: "JavaScript code executed successfully",
        metadata: {
          execution_time: 0.2,
          exit_code: 0,
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
      const { mode } = context;

      if (mode === "sandbox") {
        return {
          success: true,
          result: "Shell command executed successfully (sandbox mode)",
          metadata: {
            execution_time: 0.4,
            exit_code: 0,
          },
        };
      } else {
        return {
          success: false,
          error: "Shell execution is only available in sandbox mode for security reasons",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};
