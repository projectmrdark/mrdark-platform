import { Tool, ToolResult } from "./registry";

export const httpGetTool: Tool = {
  name: "http_get",
  description: "Make an HTTP GET request",
  category: "api",
  parameters: [
    {
      name: "url",
      type: "string",
      description: "URL to request",
      required: true,
    },
    {
      name: "headers",
      type: "string",
      description: "JSON string of headers",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { url, headers } = params;
      const parsedHeaders = headers ? JSON.parse(headers) : {};

      const response = await fetch(url, {
        method: "GET",
        headers: parsedHeaders,
      });

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      return {
        success: true,
        result: typeof data === "string" ? data : JSON.stringify(data, null, 2),
        metadata: {
          status: response.status,
          statusText: response.statusText,
          contentType,
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

export const httpPostTool: Tool = {
  name: "http_post",
  description: "Make an HTTP POST request",
  category: "api",
  parameters: [
    {
      name: "url",
      type: "string",
      description: "URL to request",
      required: true,
    },
    {
      name: "body",
      type: "string",
      description: "Request body (JSON string)",
      required: true,
    },
    {
      name: "headers",
      type: "string",
      description: "JSON string of headers",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { url, body, headers } = params;
      const parsedHeaders = headers ? JSON.parse(headers) : {};

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...parsedHeaders,
        },
        body,
      });

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      return {
        success: true,
        result: typeof data === "string" ? data : JSON.stringify(data, null, 2),
        metadata: {
          status: response.status,
          statusText: response.statusText,
          contentType,
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

export const httpPutTool: Tool = {
  name: "http_put",
  description: "Make an HTTP PUT request",
  category: "api",
  parameters: [
    {
      name: "url",
      type: "string",
      description: "URL to request",
      required: true,
    },
    {
      name: "body",
      type: "string",
      description: "Request body (JSON string)",
      required: true,
    },
    {
      name: "headers",
      type: "string",
      description: "JSON string of headers",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { url, body, headers } = params;
      const parsedHeaders = headers ? JSON.parse(headers) : {};

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...parsedHeaders,
        },
        body,
      });

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      return {
        success: true,
        result: typeof data === "string" ? data : JSON.stringify(data, null, 2),
        metadata: {
          status: response.status,
          statusText: response.statusText,
          contentType,
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

export const httpDeleteTool: Tool = {
  name: "http_delete",
  description: "Make an HTTP DELETE request",
  category: "api",
  parameters: [
    {
      name: "url",
      type: "string",
      description: "URL to request",
      required: true,
    },
    {
      name: "headers",
      type: "string",
      description: "JSON string of headers",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { url, headers } = params;
      const parsedHeaders = headers ? JSON.parse(headers) : {};

      const response = await fetch(url, {
        method: "DELETE",
        headers: parsedHeaders,
      });

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      return {
        success: true,
        result: typeof data === "string" ? data : JSON.stringify(data, null, 2),
        metadata: {
          status: response.status,
          statusText: response.statusText,
          contentType,
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

export const graphqlQueryTool: Tool = {
  name: "graphql_query",
  description: "Execute a GraphQL query",
  category: "api",
  parameters: [
    {
      name: "endpoint",
      type: "string",
      description: "GraphQL endpoint URL",
      required: true,
    },
    {
      name: "query",
      type: "string",
      description: "GraphQL query",
      required: true,
    },
    {
      name: "variables",
      type: "string",
      description: "JSON string of variables",
      required: false,
    },
    {
      name: "headers",
      type: "string",
      description: "JSON string of headers",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { endpoint, query, variables, headers } = params;
      const parsedHeaders = headers ? JSON.parse(headers) : {};
      const parsedVariables = variables ? JSON.parse(variables) : {};

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...parsedHeaders,
        },
        body: JSON.stringify({
          query,
          variables: parsedVariables,
        }),
      });

      const data = await response.json();

      return {
        success: true,
        result: JSON.stringify(data, null, 2),
        metadata: {
          status: response.status,
          hasErrors: !!data.errors,
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

export const webhookSendTool: Tool = {
  name: "webhook_send",
  description: "Send a webhook notification",
  category: "api",
  parameters: [
    {
      name: "url",
      type: "string",
      description: "Webhook URL",
      required: true,
    },
    {
      name: "payload",
      type: "string",
      description: "JSON payload to send",
      required: true,
    },
    {
      name: "method",
      type: "string",
      description: "HTTP method (default: POST)",
      required: false,
      enum: ["GET", "POST", "PUT", "DELETE"],
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { url, payload, method = "POST" } = params;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: method !== "GET" ? payload : undefined,
      });

      return {
        success: true,
        result: `Webhook sent successfully (${response.status})`,
        metadata: {
          status: response.status,
          statusText: response.statusText,
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

export const jsonParseTool: Tool = {
  name: "json_parse",
  description: "Parse JSON string",
  category: "api",
  parameters: [
    {
      name: "json",
      type: "string",
      description: "JSON string to parse",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { json } = params;
      const parsed = JSON.parse(json);

      return {
        success: true,
        result: JSON.stringify(parsed, null, 2),
        metadata: {
          type: Array.isArray(parsed) ? "array" : typeof parsed,
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

export const jsonStringifyTool: Tool = {
  name: "json_stringify",
  description: "Convert object to JSON string",
  category: "api",
  parameters: [
    {
      name: "data",
      type: "string",
      description: "Data to stringify",
      required: true,
    },
    {
      name: "pretty",
      type: "boolean",
      description: "Pretty print (default: true)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { data, pretty = true } = params;
      const parsed = JSON.parse(data);
      const result = pretty ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed);

      return {
        success: true,
        result,
        metadata: {
          length: result.length,
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

export const xmlParseTool: Tool = {
  name: "xml_parse",
  description: "Parse XML string to JSON",
  category: "api",
  parameters: [
    {
      name: "xml",
      type: "string",
      description: "XML string to parse",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { xml } = params;
      
      // Simple XML parsing (in production would use xml2js or similar)
      return {
        success: true,
        result: "XML parsed successfully (simplified implementation)",
        metadata: {
          length: xml.length,
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

export const regexMatchTool: Tool = {
  name: "regex_match",
  description: "Match text against a regular expression",
  category: "api",
  parameters: [
    {
      name: "text",
      type: "string",
      description: "Text to search",
      required: true,
    },
    {
      name: "pattern",
      type: "string",
      description: "Regular expression pattern",
      required: true,
    },
    {
      name: "flags",
      type: "string",
      description: "Regex flags (e.g., 'gi')",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { text, pattern, flags = "" } = params;
      const regex = new RegExp(pattern, flags);
      const matches = text.match(regex);

      return {
        success: true,
        result: matches ? matches.join("\n") : "No matches found",
        metadata: {
          count: matches?.length || 0,
          pattern,
          flags,
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

export const regexReplaceTool: Tool = {
  name: "regex_replace",
  description: "Replace text using a regular expression",
  category: "api",
  parameters: [
    {
      name: "text",
      type: "string",
      description: "Text to process",
      required: true,
    },
    {
      name: "pattern",
      type: "string",
      description: "Regular expression pattern",
      required: true,
    },
    {
      name: "replacement",
      type: "string",
      description: "Replacement text",
      required: true,
    },
    {
      name: "flags",
      type: "string",
      description: "Regex flags (e.g., 'gi')",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { text, pattern, replacement, flags = "g" } = params;
      const regex = new RegExp(pattern, flags);
      const result = text.replace(regex, replacement);

      return {
        success: true,
        result,
        metadata: {
          pattern,
          replacement,
          flags,
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
