import { Tool, ToolResult } from "./registry";
import { exec } from "child_process";
import { promisify } from "util";
import * as dns from "dns";
import * as net from "net";

const execAsync = promisify(exec);
const dnsLookup = promisify(dns.lookup);
const dnsResolve = promisify(dns.resolve);

export const dnsLookupTool: Tool = {
  name: "dns_lookup",
  description: "Lookup DNS records for a domain",
  category: "network",
  parameters: [
    {
      name: "domain",
      type: "string",
      description: "Domain name",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { domain } = params;

      const result = await dnsLookup(domain);

      return {
        success: true,
        result: `IP: ${result.address}, Family: IPv${result.family}`,
        metadata: {
          address: result.address,
          family: result.family,
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

export const dnsResolveTool: Tool = {
  name: "dns_resolve",
  description: "Resolve DNS records by type",
  category: "network",
  parameters: [
    {
      name: "domain",
      type: "string",
      description: "Domain name",
      required: true,
    },
    {
      name: "type",
      type: "string",
      description: "Record type: A, AAAA, MX, TXT, NS, CNAME",
      required: false,
      enum: ["A", "AAAA", "MX", "TXT", "NS", "CNAME"],
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { domain, type = "A" } = params;

      const records = await dnsResolve(domain, type as any);

      return {
        success: true,
        result: JSON.stringify(records, null, 2),
        metadata: {
          type,
          count: Array.isArray(records) ? records.length : 1,
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

export const whoisTool: Tool = {
  name: "whois",
  description: "Get WHOIS information for a domain",
  category: "network",
  parameters: [
    {
      name: "domain",
      type: "string",
      description: "Domain name",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { domain } = params;

      const { stdout } = await execAsync(`whois ${domain}`);

      return {
        success: true,
        result: stdout,
        metadata: {
          domain,
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

export const tracerouteTool: Tool = {
  name: "traceroute",
  description: "Trace route to a host",
  category: "network",
  parameters: [
    {
      name: "host",
      type: "string",
      description: "Hostname or IP address",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { host } = params;

      const { stdout } = await execAsync(`traceroute ${host}`);

      return {
        success: true,
        result: stdout,
        metadata: {
          host,
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

export const nslookupTool: Tool = {
  name: "nslookup",
  description: "Query DNS name server",
  category: "network",
  parameters: [
    {
      name: "domain",
      type: "string",
      description: "Domain name",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { domain } = params;

      const { stdout } = await execAsync(`nslookup ${domain}`);

      return {
        success: true,
        result: stdout,
        metadata: {
          domain,
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

export const netstatTool: Tool = {
  name: "netstat",
  description: "Display network connections",
  category: "network",
  parameters: [
    {
      name: "options",
      type: "string",
      description: "Netstat options (e.g., -tuln)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { options = "-tuln" } = params;

      const { stdout } = await execAsync(`netstat ${options}`);

      return {
        success: true,
        result: stdout,
        metadata: {
          options,
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

export const portScanTool: Tool = {
  name: "port_scan",
  description: "Scan if a port is open",
  category: "network",
  parameters: [
    {
      name: "host",
      type: "string",
      description: "Hostname or IP",
      required: true,
    },
    {
      name: "port",
      type: "number",
      description: "Port number",
      required: true,
    },
    {
      name: "timeout",
      type: "number",
      description: "Timeout in ms (default: 3000)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { host, port, timeout = 3000 } = params;

      const isOpen = await new Promise<boolean>((resolve) => {
        const socket = new net.Socket();

        socket.setTimeout(timeout);

        socket.on("connect", () => {
          socket.destroy();
          resolve(true);
        });

        socket.on("timeout", () => {
          socket.destroy();
          resolve(false);
        });

        socket.on("error", () => {
          resolve(false);
        });

        socket.connect(port, host);
      });

      return {
        success: true,
        result: isOpen ? "Open" : "Closed",
        metadata: {
          host,
          port,
          is_open: isOpen,
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

export const getPublicIpTool: Tool = {
  name: "get_public_ip",
  description: "Get public IP address",
  category: "network",
  parameters: [],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { stdout } = await execAsync("curl -s ifconfig.me");

      return {
        success: true,
        result: stdout.trim(),
        metadata: {
          ip: stdout.trim(),
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

export const getLocalIpTool: Tool = {
  name: "get_local_ip",
  description: "Get local IP address",
  category: "network",
  parameters: [],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { stdout } = await execAsync(
        "hostname -I | awk '{print $1}'"
      );

      return {
        success: true,
        result: stdout.trim(),
        metadata: {
          ip: stdout.trim(),
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

export const downloadFileTool: Tool = {
  name: "download_file",
  description: "Download file from URL",
  category: "network",
  parameters: [
    {
      name: "url",
      type: "string",
      description: "File URL",
      required: true,
    },
    {
      name: "output",
      type: "string",
      description: "Output file path",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { url, output } = params;

      const { stdout } = await execAsync(`curl -o ${output} ${url}`);

      return {
        success: true,
        result: `Downloaded to ${output}`,
        metadata: {
          url,
          output,
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
