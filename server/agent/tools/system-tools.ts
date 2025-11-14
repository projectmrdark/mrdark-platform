import { Tool, ToolResult } from "./registry";

export const getCurrentTimeTool: Tool = {
  name: "get_current_time",
  description: "Get the current date and time",
  category: "system",
  parameters: [
    {
      name: "timezone",
      type: "string",
      description: "Timezone (e.g., 'America/New_York', 'Asia/Bangkok')",
      required: false,
    },
    {
      name: "format",
      type: "string",
      description: "Output format: 'iso', 'unix', 'readable' (default: 'iso')",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { timezone, format = "iso" } = params;

      const now = new Date();
      let result: string;

      if (format === "unix") {
        result = Math.floor(now.getTime() / 1000).toString();
      } else if (format === "readable") {
        result = now.toLocaleString("en-US", timezone ? { timeZone: timezone } : {});
      } else {
        result = now.toISOString();
      }

      return {
        success: true,
        result,
        metadata: {
          timestamp: now.getTime(),
          timezone: timezone || "UTC",
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

export const calculateTool: Tool = {
  name: "calculate",
  description: "Perform mathematical calculations",
  category: "system",
  parameters: [
    {
      name: "expression",
      type: "string",
      description: "Mathematical expression to evaluate",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { expression } = params;

      // Safe evaluation (limited to basic math operations)
      const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, "");
      const result = eval(sanitized);

      return {
        success: true,
        result: result.toString(),
        metadata: {
          expression,
          result,
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

export const convertUnitTool: Tool = {
  name: "convert_unit",
  description: "Convert between different units",
  category: "system",
  parameters: [
    {
      name: "value",
      type: "number",
      description: "Value to convert",
      required: true,
    },
    {
      name: "from_unit",
      type: "string",
      description: "Source unit (e.g., 'km', 'lb', 'celsius')",
      required: true,
    },
    {
      name: "to_unit",
      type: "string",
      description: "Target unit (e.g., 'miles', 'kg', 'fahrenheit')",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { value, from_unit, to_unit } = params;

      // Simple conversion factors
      const conversions: Record<string, Record<string, number>> = {
        km: { miles: 0.621371, meters: 1000, feet: 3280.84 },
        miles: { km: 1.60934, meters: 1609.34, feet: 5280 },
        meters: { km: 0.001, miles: 0.000621371, feet: 3.28084 },
        feet: { km: 0.0003048, miles: 0.000189394, meters: 0.3048 },
        kg: { lb: 2.20462, g: 1000, oz: 35.274 },
        lb: { kg: 0.453592, g: 453.592, oz: 16 },
      };

      const fromConversions = conversions[from_unit.toLowerCase()];
      if (!fromConversions) {
        throw new Error(`Unknown source unit: ${from_unit}`);
      }

      const conversion = fromConversions[to_unit.toLowerCase()];
      if (!conversion) {
        throw new Error(`Cannot convert from ${from_unit} to ${to_unit}`);
      }

      const result = value * conversion;

      return {
        success: true,
        result: `${value} ${from_unit} = ${result.toFixed(4)} ${to_unit}`,
        metadata: {
          input: { value, unit: from_unit },
          output: { value: result, unit: to_unit },
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

export const generateUuidTool: Tool = {
  name: "generate_uuid",
  description: "Generate a UUID (Universally Unique Identifier)",
  category: "system",
  parameters: [],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const uuid = crypto.randomUUID();

      return {
        success: true,
        result: uuid,
        metadata: { uuid },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export const generateRandomTool: Tool = {
  name: "generate_random",
  description: "Generate random numbers or strings",
  category: "system",
  parameters: [
    {
      name: "type",
      type: "string",
      description: "Type: 'number', 'string', 'hex'",
      required: true,
      enum: ["number", "string", "hex"],
    },
    {
      name: "length",
      type: "number",
      description: "Length of the output (for string/hex)",
      required: false,
    },
    {
      name: "min",
      type: "number",
      description: "Minimum value (for number)",
      required: false,
    },
    {
      name: "max",
      type: "number",
      description: "Maximum value (for number)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { type, length = 16, min = 0, max = 100 } = params;

      let result: string;

      if (type === "number") {
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        result = num.toString();
      } else if (type === "string") {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        result = Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
      } else if (type === "hex") {
        result = Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      } else {
        throw new Error(`Unknown type: ${type}`);
      }

      return {
        success: true,
        result,
        metadata: { type, length: result.length },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export const hashTool: Tool = {
  name: "hash",
  description: "Generate hash of a string",
  category: "system",
  parameters: [
    {
      name: "text",
      type: "string",
      description: "Text to hash",
      required: true,
    },
    {
      name: "algorithm",
      type: "string",
      description: "Hash algorithm: 'md5', 'sha1', 'sha256', 'sha512'",
      required: false,
      enum: ["md5", "sha1", "sha256", "sha512"],
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { text, algorithm = "sha256" } = params;

      const crypto = await import("crypto");
      const hash = crypto.createHash(algorithm).update(text).digest("hex");

      return {
        success: true,
        result: hash,
        metadata: { algorithm, length: hash.length },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export const base64EncodeTool: Tool = {
  name: "base64_encode",
  description: "Encode text to Base64",
  category: "system",
  parameters: [
    {
      name: "text",
      type: "string",
      description: "Text to encode",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { text } = params;
      const encoded = Buffer.from(text, 'utf-8').toString('base64');

      return {
        success: true,
        result: encoded,
        metadata: { original_length: text.length, encoded_length: encoded.length },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export const base64DecodeTool: Tool = {
  name: "base64_decode",
  description: "Decode Base64 to text",
  category: "system",
  parameters: [
    {
      name: "encoded",
      type: "string",
      description: "Base64 encoded text",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { encoded } = params;
      const decoded = Buffer.from(encoded, 'base64').toString('utf-8');

      return {
        success: true,
        result: decoded,
        metadata: { encoded_length: encoded.length, decoded_length: decoded.length },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export const urlEncodeTool: Tool = {
  name: "url_encode",
  description: "URL encode a string",
  category: "system",
  parameters: [
    {
      name: "text",
      type: "string",
      description: "Text to URL encode",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { text } = params;
      const encoded = encodeURIComponent(text);

      return {
        success: true,
        result: encoded,
        metadata: { original_length: text.length, encoded_length: encoded.length },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export const urlDecodeTool: Tool = {
  name: "url_decode",
  description: "URL decode a string",
  category: "system",
  parameters: [
    {
      name: "encoded",
      type: "string",
      description: "URL encoded text",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { encoded } = params;
      const decoded = decodeURIComponent(encoded);

      return {
        success: true,
        result: decoded,
        metadata: { encoded_length: encoded.length, decoded_length: decoded.length },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};
