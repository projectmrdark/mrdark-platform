import { Tool, ToolResult } from "./registry";

export const arrayFilterTool: Tool = {
  name: "array_filter",
  description: "Filter array elements",
  category: "data",
  parameters: [
    {
      name: "array",
      type: "string",
      description: "JSON array",
      required: true,
    },
    {
      name: "condition",
      type: "string",
      description: "Filter condition (e.g., 'value > 10')",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { array, condition } = params;
      const parsed = JSON.parse(array);

      if (!Array.isArray(parsed)) {
        throw new Error("Input must be a JSON array");
      }

      // Simple condition evaluation (for demo - in production use safer eval)
      const filtered = parsed.filter((value: any) => {
        try {
          return eval(condition.replace(/value/g, JSON.stringify(value)));
        } catch {
          return false;
        }
      });

      return {
        success: true,
        result: JSON.stringify(filtered, null, 2),
        metadata: {
          original_count: parsed.length,
          filtered_count: filtered.length,
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

export const arrayMapTool: Tool = {
  name: "array_map",
  description: "Transform array elements",
  category: "data",
  parameters: [
    {
      name: "array",
      type: "string",
      description: "JSON array",
      required: true,
    },
    {
      name: "property",
      type: "string",
      description: "Property to extract (for objects)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { array, property } = params;
      const parsed = JSON.parse(array);

      if (!Array.isArray(parsed)) {
        throw new Error("Input must be a JSON array");
      }

      const mapped = property
        ? parsed.map((item: any) => item[property])
        : parsed;

      return {
        success: true,
        result: JSON.stringify(mapped, null, 2),
        metadata: {
          count: mapped.length,
          property,
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

export const arrayReduceTool: Tool = {
  name: "array_reduce",
  description: "Reduce array to single value",
  category: "data",
  parameters: [
    {
      name: "array",
      type: "string",
      description: "JSON array of numbers",
      required: true,
    },
    {
      name: "operation",
      type: "string",
      description: "Operation: sum, avg, min, max, count",
      required: true,
      enum: ["sum", "avg", "min", "max", "count"],
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { array, operation } = params;
      const parsed = JSON.parse(array);

      if (!Array.isArray(parsed)) {
        throw new Error("Input must be a JSON array");
      }

      let result: number;

      switch (operation) {
        case "sum":
          result = parsed.reduce((a: number, b: number) => a + b, 0);
          break;
        case "avg":
          result =
            parsed.reduce((a: number, b: number) => a + b, 0) / parsed.length;
          break;
        case "min":
          result = Math.min(...parsed);
          break;
        case "max":
          result = Math.max(...parsed);
          break;
        case "count":
          result = parsed.length;
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      return {
        success: true,
        result: result.toString(),
        metadata: {
          operation,
          count: parsed.length,
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

export const arraySortTool: Tool = {
  name: "array_sort",
  description: "Sort array",
  category: "data",
  parameters: [
    {
      name: "array",
      type: "string",
      description: "JSON array",
      required: true,
    },
    {
      name: "order",
      type: "string",
      description: "Sort order: asc or desc",
      required: false,
      enum: ["asc", "desc"],
    },
    {
      name: "property",
      type: "string",
      description: "Property to sort by (for objects)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { array, order = "asc", property } = params;
      const parsed = JSON.parse(array);

      if (!Array.isArray(parsed)) {
        throw new Error("Input must be a JSON array");
      }

      const sorted = [...parsed].sort((a: any, b: any) => {
        const aVal = property ? a[property] : a;
        const bVal = property ? b[property] : b;

        if (order === "desc") {
          return bVal > aVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
      });

      return {
        success: true,
        result: JSON.stringify(sorted, null, 2),
        metadata: {
          count: sorted.length,
          order,
          property,
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

export const arrayUniqueTool: Tool = {
  name: "array_unique",
  description: "Remove duplicate values from array",
  category: "data",
  parameters: [
    {
      name: "array",
      type: "string",
      description: "JSON array",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { array } = params;
      const parsed = JSON.parse(array);

      if (!Array.isArray(parsed)) {
        throw new Error("Input must be a JSON array");
      }

      const unique = Array.from(new Set(parsed));

      return {
        success: true,
        result: JSON.stringify(unique, null, 2),
        metadata: {
          original_count: parsed.length,
          unique_count: unique.length,
          removed: parsed.length - unique.length,
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

export const arrayGroupByTool: Tool = {
  name: "array_group_by",
  description: "Group array elements by property",
  category: "data",
  parameters: [
    {
      name: "array",
      type: "string",
      description: "JSON array of objects",
      required: true,
    },
    {
      name: "property",
      type: "string",
      description: "Property to group by",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { array, property } = params;
      const parsed = JSON.parse(array);

      if (!Array.isArray(parsed)) {
        throw new Error("Input must be a JSON array");
      }

      const grouped = parsed.reduce((acc: any, item: any) => {
        const key = item[property];
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      }, {});

      return {
        success: true,
        result: JSON.stringify(grouped, null, 2),
        metadata: {
          groups: Object.keys(grouped).length,
          property,
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

export const objectMergeTool: Tool = {
  name: "object_merge",
  description: "Merge multiple JSON objects",
  category: "data",
  parameters: [
    {
      name: "objects",
      type: "string",
      description: "JSON array of objects to merge",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { objects } = params;
      const parsed = JSON.parse(objects);

      if (!Array.isArray(parsed)) {
        throw new Error("Input must be a JSON array of objects");
      }

      const merged = Object.assign({}, ...parsed);

      return {
        success: true,
        result: JSON.stringify(merged, null, 2),
        metadata: {
          source_count: parsed.length,
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

export const objectPickTool: Tool = {
  name: "object_pick",
  description: "Pick specific properties from object",
  category: "data",
  parameters: [
    {
      name: "object",
      type: "string",
      description: "JSON object",
      required: true,
    },
    {
      name: "properties",
      type: "string",
      description: "Comma-separated property names",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { object, properties } = params;
      const parsed = JSON.parse(object);
      const props = properties.split(",").map((p: string) => p.trim());

      const picked = props.reduce((acc: any, prop: string) => {
        if (prop in parsed) {
          acc[prop] = parsed[prop];
        }
        return acc;
      }, {});

      return {
        success: true,
        result: JSON.stringify(picked, null, 2),
        metadata: {
          properties: props,
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

export const objectOmitTool: Tool = {
  name: "object_omit",
  description: "Omit specific properties from object",
  category: "data",
  parameters: [
    {
      name: "object",
      type: "string",
      description: "JSON object",
      required: true,
    },
    {
      name: "properties",
      type: "string",
      description: "Comma-separated property names to omit",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { object, properties } = params;
      const parsed = JSON.parse(object);
      const propsToOmit = properties.split(",").map((p: string) => p.trim());

      const omitted = Object.keys(parsed).reduce((acc: any, key: string) => {
        if (!propsToOmit.includes(key)) {
          acc[key] = parsed[key];
        }
        return acc;
      }, {});

      return {
        success: true,
        result: JSON.stringify(omitted, null, 2),
        metadata: {
          omitted: propsToOmit,
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

export const dataValidateTool: Tool = {
  name: "data_validate",
  description: "Validate data against schema",
  category: "data",
  parameters: [
    {
      name: "data",
      type: "string",
      description: "JSON data to validate",
      required: true,
    },
    {
      name: "schema",
      type: "string",
      description: "JSON schema",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { data, schema } = params;
      const parsedData = JSON.parse(data);
      const parsedSchema = JSON.parse(schema);

      // Simple validation (in production, use a library like Ajv)
      const errors: string[] = [];

      if (parsedSchema.required) {
        parsedSchema.required.forEach((field: string) => {
          if (!(field in parsedData)) {
            errors.push(`Missing required field: ${field}`);
          }
        });
      }

      const isValid = errors.length === 0;

      return {
        success: true,
        result: isValid ? "Valid" : `Invalid: ${errors.join(", ")}`,
        metadata: {
          valid: isValid,
          errors,
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
