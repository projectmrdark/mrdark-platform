import { Tool, ToolResult } from "./registry";

export const textToUpperTool: Tool = {
  name: "text_to_upper",
  description: "Convert text to uppercase",
  category: "text",
  parameters: [
    {
      name: "text",
      type: "string",
      description: "Text to convert",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { text } = params;
      const result = text.toUpperCase();

      return {
        success: true,
        result,
        metadata: { original_length: text.length },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export const textToLowerTool: Tool = {
  name: "text_to_lower",
  description: "Convert text to lowercase",
  category: "text",
  parameters: [
    {
      name: "text",
      type: "string",
      description: "Text to convert",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { text } = params;
      const result = text.toLowerCase();

      return {
        success: true,
        result,
        metadata: { original_length: text.length },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export const textTrimTool: Tool = {
  name: "text_trim",
  description: "Trim whitespace from text",
  category: "text",
  parameters: [
    {
      name: "text",
      type: "string",
      description: "Text to trim",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { text } = params;
      const result = text.trim();

      return {
        success: true,
        result,
        metadata: {
          original_length: text.length,
          trimmed_length: result.length,
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

export const textReplaceTool: Tool = {
  name: "text_replace",
  description: "Replace text",
  category: "text",
  parameters: [
    {
      name: "text",
      type: "string",
      description: "Text to process",
      required: true,
    },
    {
      name: "search",
      type: "string",
      description: "Text to search for",
      required: true,
    },
    {
      name: "replace",
      type: "string",
      description: "Replacement text",
      required: true,
    },
    {
      name: "all",
      type: "boolean",
      description: "Replace all occurrences (default: true)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { text, search, replace, all = true } = params;

      const result = all
        ? text.split(search).join(replace)
        : text.replace(search, replace);

      return {
        success: true,
        result,
        metadata: {
          search,
          replace,
          all,
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

export const textSplitTool: Tool = {
  name: "text_split",
  description: "Split text by delimiter",
  category: "text",
  parameters: [
    {
      name: "text",
      type: "string",
      description: "Text to split",
      required: true,
    },
    {
      name: "delimiter",
      type: "string",
      description: "Delimiter (default: newline)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { text, delimiter = "\n" } = params;
      const parts = text.split(delimiter);

      return {
        success: true,
        result: parts.join("\n"),
        metadata: {
          count: parts.length,
          delimiter,
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

export const textJoinTool: Tool = {
  name: "text_join",
  description: "Join text array with delimiter",
  category: "text",
  parameters: [
    {
      name: "texts",
      type: "string",
      description: "JSON array of texts",
      required: true,
    },
    {
      name: "delimiter",
      type: "string",
      description: "Delimiter (default: newline)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { texts, delimiter = "\n" } = params;
      const parsed = JSON.parse(texts);

      if (!Array.isArray(parsed)) {
        throw new Error("texts must be a JSON array");
      }

      const result = parsed.join(delimiter);

      return {
        success: true,
        result,
        metadata: {
          count: parsed.length,
          delimiter,
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

export const textCountWordsTool: Tool = {
  name: "text_count_words",
  description: "Count words in text",
  category: "text",
  parameters: [
    {
      name: "text",
      type: "string",
      description: "Text to analyze",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { text } = params;
      const words = text.trim().split(/\s+/);
      const wordCount = words.filter((w: string) => w.length > 0).length;
      const charCount = text.length;
      const lines = text.split("\n").length;

      return {
        success: true,
        result: `Words: ${wordCount}, Characters: ${charCount}, Lines: ${lines}`,
        metadata: {
          words: wordCount,
          characters: charCount,
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

export const textExtractEmailsTool: Tool = {
  name: "text_extract_emails",
  description: "Extract email addresses from text",
  category: "text",
  parameters: [
    {
      name: "text",
      type: "string",
      description: "Text to extract from",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { text } = params;
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = text.match(emailRegex) || [];

      return {
        success: true,
        result: emails.join("\n") || "No emails found",
        metadata: {
          count: emails.length,
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

export const textExtractUrlsTool: Tool = {
  name: "text_extract_urls",
  description: "Extract URLs from text",
  category: "text",
  parameters: [
    {
      name: "text",
      type: "string",
      description: "Text to extract from",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { text } = params;
      const urlRegex = /https?:\/\/[^\s]+/g;
      const urls = text.match(urlRegex) || [];

      return {
        success: true,
        result: urls.join("\n") || "No URLs found",
        metadata: {
          count: urls.length,
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

export const textSlugifyTool: Tool = {
  name: "text_slugify",
  description: "Convert text to URL-friendly slug",
  category: "text",
  parameters: [
    {
      name: "text",
      type: "string",
      description: "Text to slugify",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { text } = params;
      const slug = text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

      return {
        success: true,
        result: slug,
        metadata: {
          original: text,
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

export const textTruncateTool: Tool = {
  name: "text_truncate",
  description: "Truncate text to specified length",
  category: "text",
  parameters: [
    {
      name: "text",
      type: "string",
      description: "Text to truncate",
      required: true,
    },
    {
      name: "length",
      type: "number",
      description: "Maximum length",
      required: true,
    },
    {
      name: "suffix",
      type: "string",
      description: "Suffix to add (default: ...)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { text, length, suffix = "..." } = params;

      const result =
        text.length > length
          ? text.substring(0, length - suffix.length) + suffix
          : text;

      return {
        success: true,
        result,
        metadata: {
          original_length: text.length,
          truncated_length: result.length,
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

export const textReverseTool: Tool = {
  name: "text_reverse",
  description: "Reverse text",
  category: "text",
  parameters: [
    {
      name: "text",
      type: "string",
      description: "Text to reverse",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { text } = params;
      const result = text.split("").reverse().join("");

      return {
        success: true,
        result,
        metadata: {
          length: text.length,
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

export const textCapitalizeTool: Tool = {
  name: "text_capitalize",
  description: "Capitalize first letter of each word",
  category: "text",
  parameters: [
    {
      name: "text",
      type: "string",
      description: "Text to capitalize",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { text } = params;
      const result = text.replace(/\b\w/g, (char: string) => char.toUpperCase());

      return {
        success: true,
        result,
        metadata: {
          original: text,
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

export const textRemoveDuplicatesTool: Tool = {
  name: "text_remove_duplicates",
  description: "Remove duplicate lines from text",
  category: "text",
  parameters: [
    {
      name: "text",
      type: "string",
      description: "Text to process",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { text } = params;
      const lines = text.split("\n");
      const unique = Array.from(new Set(lines));

      return {
        success: true,
        result: unique.join("\n"),
        metadata: {
          original_lines: lines.length,
          unique_lines: unique.length,
          removed: lines.length - unique.length,
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

export const textSortLinesTool: Tool = {
  name: "text_sort_lines",
  description: "Sort lines alphabetically",
  category: "text",
  parameters: [
    {
      name: "text",
      type: "string",
      description: "Text to sort",
      required: true,
    },
    {
      name: "reverse",
      type: "boolean",
      description: "Sort in reverse order",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { text, reverse = false } = params;
      const lines = text.split("\n");
      const sorted = reverse ? lines.sort().reverse() : lines.sort();

      return {
        success: true,
        result: sorted.join("\n"),
        metadata: {
          lines: lines.length,
          reverse,
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
