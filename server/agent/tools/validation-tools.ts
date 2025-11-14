import { Tool, ToolResult } from "./registry";

export const validateEmailTool: Tool = {
  name: "validate_email",
  description: "Validate email address format",
  category: "validation",
  parameters: [
    {
      name: "email",
      type: "string",
      description: "Email address to validate",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { email } = params;

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(email);

      return {
        success: true,
        result: isValid ? "Valid" : "Invalid",
        metadata: {
          valid: isValid,
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

export const validateUrlTool: Tool = {
  name: "validate_url",
  description: "Validate URL format",
  category: "validation",
  parameters: [
    {
      name: "url",
      type: "string",
      description: "URL to validate",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { url } = params;

      try {
        new URL(url);
        return {
          success: true,
          result: "Valid",
          metadata: {
            valid: true,
          },
        };
      } catch {
        return {
          success: true,
          result: "Invalid",
          metadata: {
            valid: false,
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

export const validateIpTool: Tool = {
  name: "validate_ip",
  description: "Validate IP address (IPv4 or IPv6)",
  category: "validation",
  parameters: [
    {
      name: "ip",
      type: "string",
      description: "IP address to validate",
      required: true,
    },
    {
      name: "version",
      type: "string",
      description: "IP version: 4, 6, or both (default: both)",
      required: false,
      enum: ["4", "6", "both"],
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { ip, version = "both" } = params;

      const ipv4Regex =
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      const ipv6Regex =
        /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

      let isValid = false;
      let detectedVersion = "";

      if (version === "4" || version === "both") {
        if (ipv4Regex.test(ip)) {
          isValid = true;
          detectedVersion = "IPv4";
        }
      }

      if ((version === "6" || version === "both") && !isValid) {
        if (ipv6Regex.test(ip)) {
          isValid = true;
          detectedVersion = "IPv6";
        }
      }

      return {
        success: true,
        result: isValid ? `Valid ${detectedVersion}` : "Invalid",
        metadata: {
          valid: isValid,
          version: detectedVersion,
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

export const validateJsonTool: Tool = {
  name: "validate_json",
  description: "Validate JSON format",
  category: "validation",
  parameters: [
    {
      name: "json",
      type: "string",
      description: "JSON string to validate",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { json } = params;

      try {
        JSON.parse(json);
        return {
          success: true,
          result: "Valid JSON",
          metadata: {
            valid: true,
          },
        };
      } catch (e: any) {
        return {
          success: true,
          result: `Invalid JSON: ${e.message}`,
          metadata: {
            valid: false,
            error: e.message,
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

export const validatePhoneTool: Tool = {
  name: "validate_phone",
  description: "Validate phone number format (basic)",
  category: "validation",
  parameters: [
    {
      name: "phone",
      type: "string",
      description: "Phone number to validate",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { phone } = params;

      // Basic phone validation: 10-15 digits, may contain +, -, (), spaces
      const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
      const isValid = phoneRegex.test(phone);

      return {
        success: true,
        result: isValid ? "Valid" : "Invalid",
        metadata: {
          valid: isValid,
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

export const validateCreditCardTool: Tool = {
  name: "validate_credit_card",
  description: "Validate credit card number using Luhn algorithm",
  category: "validation",
  parameters: [
    {
      name: "number",
      type: "string",
      description: "Credit card number",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { number } = params;

      const digits = number.replace(/\D/g, "");

      if (digits.length < 13 || digits.length > 19) {
        return {
          success: true,
          result: "Invalid length",
          metadata: {
            valid: false,
          },
        };
      }

      let sum = 0;
      let isEven = false;

      for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i]);

        if (isEven) {
          digit *= 2;
          if (digit > 9) {
            digit -= 9;
          }
        }

        sum += digit;
        isEven = !isEven;
      }

      const isValid = sum % 10 === 0;

      return {
        success: true,
        result: isValid ? "Valid" : "Invalid",
        metadata: {
          valid: isValid,
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

export const mathAbsTool: Tool = {
  name: "math_abs",
  description: "Calculate absolute value",
  category: "math",
  parameters: [
    {
      name: "number",
      type: "number",
      description: "Number",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { number } = params;
      const result = Math.abs(number);

      return {
        success: true,
        result: result.toString(),
        metadata: {
          value: result,
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

export const mathPowerTool: Tool = {
  name: "math_power",
  description: "Calculate power (base^exponent)",
  category: "math",
  parameters: [
    {
      name: "base",
      type: "number",
      description: "Base number",
      required: true,
    },
    {
      name: "exponent",
      type: "number",
      description: "Exponent",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { base, exponent } = params;
      const result = Math.pow(base, exponent);

      return {
        success: true,
        result: result.toString(),
        metadata: {
          value: result,
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

export const mathSqrtTool: Tool = {
  name: "math_sqrt",
  description: "Calculate square root",
  category: "math",
  parameters: [
    {
      name: "number",
      type: "number",
      description: "Number",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { number } = params;
      const result = Math.sqrt(number);

      return {
        success: true,
        result: result.toString(),
        metadata: {
          value: result,
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

export const mathRoundTool: Tool = {
  name: "math_round",
  description: "Round number to specified decimals",
  category: "math",
  parameters: [
    {
      name: "number",
      type: "number",
      description: "Number to round",
      required: true,
    },
    {
      name: "decimals",
      type: "number",
      description: "Number of decimal places (default: 0)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { number, decimals = 0 } = params;
      const multiplier = Math.pow(10, decimals);
      const result = Math.round(number * multiplier) / multiplier;

      return {
        success: true,
        result: result.toString(),
        metadata: {
          value: result,
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

export const mathMinMaxTool: Tool = {
  name: "math_min_max",
  description: "Find minimum and maximum from array of numbers",
  category: "math",
  parameters: [
    {
      name: "numbers",
      type: "string",
      description: "Comma-separated numbers",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { numbers } = params;
      const arr = numbers.split(",").map((n: string) => parseFloat(n.trim()));

      const min = Math.min(...arr);
      const max = Math.max(...arr);

      return {
        success: true,
        result: `Min: ${min}, Max: ${max}`,
        metadata: {
          min,
          max,
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

export const mathAverageTool: Tool = {
  name: "math_average",
  description: "Calculate average of numbers",
  category: "math",
  parameters: [
    {
      name: "numbers",
      type: "string",
      description: "Comma-separated numbers",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { numbers } = params;
      const arr = numbers.split(",").map((n: string) => parseFloat(n.trim()));

      const sum = arr.reduce((a: number, b: number) => a + b, 0);
      const average = sum / arr.length;

      return {
        success: true,
        result: average.toString(),
        metadata: {
          average,
          count: arr.length,
          sum,
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

export const mathPercentageTool: Tool = {
  name: "math_percentage",
  description: "Calculate percentage",
  category: "math",
  parameters: [
    {
      name: "value",
      type: "number",
      description: "Value",
      required: true,
    },
    {
      name: "total",
      type: "number",
      description: "Total",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { value, total } = params;
      const percentage = (value / total) * 100;

      return {
        success: true,
        result: `${percentage.toFixed(2)}%`,
        metadata: {
          percentage: parseFloat(percentage.toFixed(2)),
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
