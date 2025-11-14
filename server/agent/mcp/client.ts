/**
 * MCP (Model Context Protocol) Client
 * Connects to external MCP servers and exposes their tools
 */

export interface MCPServer {
  name: string;
  url: string;
  apiKey?: string;
  enabled: boolean;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  server: string;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export class MCPClient {
  private servers: Map<string, MCPServer> = new Map();
  private tools: Map<string, MCPTool> = new Map();
  private resources: Map<string, MCPResource> = new Map();

  constructor() {
    // Initialize with default MCP servers if configured
    this.loadDefaultServers();
  }

  private loadDefaultServers() {
    // Load from environment or configuration
    // For now, we'll support dynamic server registration
  }

  /**
   * Register an MCP server
   */
  async registerServer(server: MCPServer): Promise<void> {
    this.servers.set(server.name, server);

    if (server.enabled) {
      await this.discoverTools(server.name);
      await this.discoverResources(server.name);
    }
  }

  /**
   * Discover tools from an MCP server
   */
  private async discoverTools(serverName: string): Promise<void> {
    const server = this.servers.get(serverName);
    if (!server) {
      throw new Error(`Server ${serverName} not found`);
    }

    try {
      const response = await fetch(`${server.url}/tools/list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(server.apiKey && { Authorization: `Bearer ${server.apiKey}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to discover tools from ${serverName}`);
      }

      const data = await response.json();
      const tools = data.tools || [];

      for (const tool of tools) {
        this.tools.set(`${serverName}:${tool.name}`, {
          ...tool,
          server: serverName,
        });
      }
    } catch (error) {
      console.error(`Error discovering tools from ${serverName}:`, error);
    }
  }

  /**
   * Discover resources from an MCP server
   */
  private async discoverResources(serverName: string): Promise<void> {
    const server = this.servers.get(serverName);
    if (!server) {
      throw new Error(`Server ${serverName} not found`);
    }

    try {
      const response = await fetch(`${server.url}/resources/list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(server.apiKey && { Authorization: `Bearer ${server.apiKey}` }),
        },
      });

      if (!response.ok) {
        console.warn(`Failed to discover resources from ${serverName}`);
        return;
      }

      const data = await response.json();
      const resources = data.resources || [];

      for (const resource of resources) {
        this.resources.set(resource.uri, resource);
      }
    } catch (error) {
      console.error(`Error discovering resources from ${serverName}:`, error);
    }
  }

  /**
   * Call a tool on an MCP server
   */
  async callTool(
    toolName: string,
    args: Record<string, any>
  ): Promise<any> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }

    const server = this.servers.get(tool.server);
    if (!server) {
      throw new Error(`Server ${tool.server} not found`);
    }

    try {
      const response = await fetch(`${server.url}/tools/call`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(server.apiKey && { Authorization: `Bearer ${server.apiKey}` }),
        },
        body: JSON.stringify({
          name: tool.name,
          arguments: args,
        }),
      });

      if (!response.ok) {
        throw new Error(`Tool call failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.content || data.result || data;
    } catch (error: any) {
      throw new Error(`Error calling tool ${toolName}: ${error.message}`);
    }
  }

  /**
   * Read a resource from an MCP server
   */
  async readResource(uri: string): Promise<any> {
    const resource = this.resources.get(uri);
    if (!resource) {
      throw new Error(`Resource ${uri} not found`);
    }

    // Extract server name from URI (format: mcp://server-name/path)
    const match = uri.match(/^mcp:\/\/([^\/]+)\//);
    if (!match) {
      throw new Error(`Invalid MCP URI: ${uri}`);
    }

    const serverName = match[1];
    const server = this.servers.get(serverName);
    if (!server) {
      throw new Error(`Server ${serverName} not found`);
    }

    try {
      const response = await fetch(`${server.url}/resources/read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(server.apiKey && { Authorization: `Bearer ${server.apiKey}` }),
        },
        body: JSON.stringify({
          uri,
        }),
      });

      if (!response.ok) {
        throw new Error(`Resource read failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.contents || data.content || data;
    } catch (error: any) {
      throw new Error(`Error reading resource ${uri}: ${error.message}`);
    }
  }

  /**
   * Get all available tools
   */
  getTools(): MCPTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get all available resources
   */
  getResources(): MCPResource[] {
    return Array.from(this.resources.values());
  }

  /**
   * Get all registered servers
   */
  getServers(): MCPServer[] {
    return Array.from(this.servers.values());
  }

  /**
   * Enable/disable a server
   */
  async toggleServer(serverName: string, enabled: boolean): Promise<void> {
    const server = this.servers.get(serverName);
    if (!server) {
      throw new Error(`Server ${serverName} not found`);
    }

    server.enabled = enabled;

    if (enabled) {
      await this.discoverTools(serverName);
      await this.discoverResources(serverName);
    } else {
      // Remove tools and resources from this server
      const toolsToRemove: string[] = [];
      this.tools.forEach((tool, key) => {
        if (tool.server === serverName) {
          toolsToRemove.push(key);
        }
      });
      toolsToRemove.forEach(key => this.tools.delete(key));
    }
  }

  /**
   * Refresh tools and resources from all enabled servers
   */
  async refresh(): Promise<void> {
    const servers = Array.from(this.servers.values());
    for (const server of servers) {
      if (server.enabled) {
        await this.discoverTools(server.name);
        await this.discoverResources(server.name);
      }
    }
  }
}

// Singleton instance
export const mcpClient = new MCPClient();
