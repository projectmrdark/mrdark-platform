export interface ToolParameter {
  name: string;
  type: string;
  description: string;
  required?: boolean;
  enum?: string[];
}

export interface ToolResult {
  success: boolean;
  result?: any;
  error?: string;
  artifacts?: string[];
  metadata?: Record<string, any>;
}

export interface Tool {
  name: string;
  description: string;
  category: string;
  parameters: ToolParameter[];
  execute: (params: any, context: any) => Promise<ToolResult>;
}

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();
  private categories: Map<string, string[]> = new Map();

  register(tool: Tool): void {
    this.tools.set(tool.name, tool);

    if (!this.categories.has(tool.category)) {
      this.categories.set(tool.category, []);
    }
    this.categories.get(tool.category)!.push(tool.name);
  }

  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  getToolsByCategory(category: string): Tool[] {
    const toolNames = this.categories.get(category) || [];
    return toolNames.map(name => this.tools.get(name)!).filter(Boolean);
  }

  getFunctionSchemas(): any[] {
    return this.getAllTools().map(tool => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: "object",
          properties: tool.parameters.reduce((acc, param) => {
            acc[param.name] = {
              type: param.type,
              description: param.description,
              ...(param.enum ? { enum: param.enum } : {}),
            };
            return acc;
          }, {} as Record<string, any>),
          required: tool.parameters.filter(p => p.required).map(p => p.name),
        },
      },
    }));
  }

  async executeTool(
    name: string,
    params: any,
    context: any
  ): Promise<ToolResult> {
    const tool = this.getTool(name);
    if (!tool) {
      return {
        success: false,
        error: `Tool not found: ${name}`,
      };
    }

    try {
      // Validate parameters
      for (const param of tool.parameters) {
        if (param.required && !(param.name in params)) {
          return {
            success: false,
            error: `Missing required parameter: ${param.name}`,
          };
        }
      }

      // Execute tool
      const result = await tool.execute(params, context);
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || String(error),
      };
    }
  }
}
