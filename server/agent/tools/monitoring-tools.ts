import { Tool, ToolResult } from "./registry";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const pingTool: Tool = {
  name: "ping",
  description: "Ping a host to check connectivity",
  category: "monitoring",
  parameters: [
    {
      name: "host",
      type: "string",
      description: "Hostname or IP address",
      required: true,
    },
    {
      name: "count",
      type: "number",
      description: "Number of pings (default: 4)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { host, count = 4 } = params;
      const { stdout } = await execAsync(`ping -c ${count} ${host}`);

      return {
        success: true,
        result: stdout,
        metadata: {
          host,
          count,
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

export const curlTool: Tool = {
  name: "curl",
  description: "Make HTTP request using curl",
  category: "monitoring",
  parameters: [
    {
      name: "url",
      type: "string",
      description: "URL to request",
      required: true,
    },
    {
      name: "method",
      type: "string",
      description: "HTTP method (default: GET)",
      required: false,
      enum: ["GET", "POST", "PUT", "DELETE"],
    },
    {
      name: "headers",
      type: "string",
      description: "Headers (comma-separated key:value pairs)",
      required: false,
    },
    {
      name: "data",
      type: "string",
      description: "Request body",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { url, method = "GET", headers, data } = params;

      let command = `curl -X ${method}`;
      
      if (headers) {
        const headerPairs = headers.split(",");
        headerPairs.forEach((header: string) => {
          command += ` -H "${header.trim()}"`;
        });
      }

      if (data) {
        command += ` -d '${data}'`;
      }

      command += ` "${url}"`;

      const { stdout } = await execAsync(command);

      return {
        success: true,
        result: stdout,
        metadata: {
          url,
          method,
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

export const checkPortTool: Tool = {
  name: "check_port",
  description: "Check if a port is open on a host",
  category: "monitoring",
  parameters: [
    {
      name: "host",
      type: "string",
      description: "Hostname or IP address",
      required: true,
    },
    {
      name: "port",
      type: "number",
      description: "Port number",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { host, port } = params;
      const { stdout } = await execAsync(`nc -zv ${host} ${port} 2>&1`);

      return {
        success: true,
        result: stdout.includes("succeeded") ? `Port ${port} is open` : `Port ${port} is closed`,
        metadata: {
          host,
          port,
          open: stdout.includes("succeeded"),
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

export const systemInfoTool: Tool = {
  name: "system_info",
  description: "Get system information",
  category: "monitoring",
  parameters: [],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { stdout: uname } = await execAsync("uname -a");
      const { stdout: uptime } = await execAsync("uptime");
      const { stdout: memory } = await execAsync("free -h");
      const { stdout: disk } = await execAsync("df -h");

      const result = `System: ${uname}\nUptime: ${uptime}\n\nMemory:\n${memory}\n\nDisk:\n${disk}`;

      return {
        success: true,
        result,
        metadata: {},
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export const processListTool: Tool = {
  name: "process_list",
  description: "List running processes",
  category: "monitoring",
  parameters: [
    {
      name: "filter",
      type: "string",
      description: "Filter processes by name",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { filter } = params;

      let command = "ps aux";
      if (filter) {
        command += ` | grep ${filter}`;
      }

      const { stdout } = await execAsync(command);

      return {
        success: true,
        result: stdout,
        metadata: {
          filter,
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

export const diskUsageTool: Tool = {
  name: "disk_usage",
  description: "Check disk usage",
  category: "monitoring",
  parameters: [
    {
      name: "path",
      type: "string",
      description: "Path to check (default: /)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { path = "/" } = params;
      const { stdout } = await execAsync(`du -sh ${path}`);

      return {
        success: true,
        result: stdout,
        metadata: {
          path,
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

export const networkStatsTool: Tool = {
  name: "network_stats",
  description: "Get network statistics",
  category: "monitoring",
  parameters: [],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { stdout } = await execAsync("netstat -i");

      return {
        success: true,
        result: stdout,
        metadata: {},
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export const logTailTool: Tool = {
  name: "log_tail",
  description: "Tail a log file",
  category: "monitoring",
  parameters: [
    {
      name: "file",
      type: "string",
      description: "Log file path",
      required: true,
    },
    {
      name: "lines",
      type: "number",
      description: "Number of lines (default: 50)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { file, lines = 50 } = params;
      const { stdout } = await execAsync(`tail -n ${lines} ${file}`);

      return {
        success: true,
        result: stdout,
        metadata: {
          file,
          lines,
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

export const logGrepTool: Tool = {
  name: "log_grep",
  description: "Search in log files",
  category: "monitoring",
  parameters: [
    {
      name: "file",
      type: "string",
      description: "Log file path",
      required: true,
    },
    {
      name: "pattern",
      type: "string",
      description: "Search pattern",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { file, pattern } = params;
      const { stdout } = await execAsync(`grep "${pattern}" ${file}`);

      return {
        success: true,
        result: stdout || "No matches found",
        metadata: {
          file,
          pattern,
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

export const healthCheckTool: Tool = {
  name: "health_check",
  description: "Perform health check on a URL",
  category: "monitoring",
  parameters: [
    {
      name: "url",
      type: "string",
      description: "URL to check",
      required: true,
    },
    {
      name: "expected_status",
      type: "number",
      description: "Expected HTTP status code (default: 200)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { url, expected_status = 200 } = params;

      const response = await fetch(url);
      const isHealthy = response.status === expected_status;

      return {
        success: true,
        result: isHealthy ? "Healthy" : `Unhealthy (status: ${response.status})`,
        metadata: {
          url,
          status: response.status,
          expected: expected_status,
          healthy: isHealthy,
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
