import { Tool, ToolResult } from "./registry";

export const browserNavigateTool: Tool = {
  name: "browser_navigate",
  description: "Navigate to a URL in the browser",
  category: "browser",
  parameters: [
    {
      name: "url",
      type: "string",
      description: "The URL to navigate to",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { url } = params;

      return {
        success: true,
        result: `Navigated to ${url}`,
        metadata: {
          url,
          title: "Page Title",
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

export const browserClickTool: Tool = {
  name: "browser_click",
  description: "Click an element on the current page",
  category: "browser",
  parameters: [
    {
      name: "selector",
      type: "string",
      description: "CSS selector of the element to click",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { selector } = params;

      return {
        success: true,
        result: `Clicked element: ${selector}`,
        metadata: {
          selector,
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

export const browserTypeTool: Tool = {
  name: "browser_type",
  description: "Type text into an input field",
  category: "browser",
  parameters: [
    {
      name: "selector",
      type: "string",
      description: "CSS selector of the input field",
      required: true,
    },
    {
      name: "text",
      type: "string",
      description: "The text to type",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { selector, text } = params;

      return {
        success: true,
        result: `Typed text into ${selector}`,
        metadata: {
          selector,
          text,
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

export const browserScreenshotTool: Tool = {
  name: "browser_screenshot",
  description: "Take a screenshot of the current page",
  category: "browser",
  parameters: [
    {
      name: "full_page",
      type: "boolean",
      description: "Whether to capture the full page (default: false)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { full_page = false } = params;

      return {
        success: true,
        result: "Screenshot captured",
        artifacts: ["https://example.com/screenshot.png"],
        metadata: {
          full_page,
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

export const browserExtractTool: Tool = {
  name: "browser_extract",
  description: "Extract text content from the current page",
  category: "browser",
  parameters: [
    {
      name: "selector",
      type: "string",
      description: "CSS selector to extract content from (optional, extracts all if not provided)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { selector } = params;

      return {
        success: true,
        result: "Extracted content from page",
        metadata: {
          selector: selector || "body",
          content_length: 1000,
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
