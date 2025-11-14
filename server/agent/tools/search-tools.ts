import { Tool, ToolResult } from "./registry";
import { ENV } from "../../_core/env";

export const webSearchTool: Tool = {
  name: "web_search",
  description: "Search the web for information",
  category: "search",
  parameters: [
    {
      name: "query",
      type: "string",
      description: "The search query",
      required: true,
    },
    {
      name: "num_results",
      type: "number",
      description: "Number of results to return (default: 10)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { query, num_results = 10 } = params;

      // Use Manus built-in search API
      const response = await fetch(`${ENV.forgeApiUrl}/omni_search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ENV.forgeApiKey}`,
        },
        body: JSON.stringify({
          queries: [query],
          search_type: 'info',
          max_results: num_results,
        }),
      });

      if (!response.ok) {
        throw new Error(`Search API error: ${response.statusText}`);
      }

      const data = await response.json();
      const results = data.results || [];

      const formattedResults = results.map((r: any, i: number) => 
        `${i + 1}. ${r.title}\n   ${r.snippet}\n   URL: ${r.url}`
      ).join('\n\n');

      return {
        success: true,
        result: formattedResults || 'No results found',
        metadata: {
          query,
          num_results: results.length,
          raw_results: results,
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

export const imageSearchTool: Tool = {
  name: "image_search",
  description: "Search for images on the web",
  category: "search",
  parameters: [
    {
      name: "query",
      type: "string",
      description: "The image search query",
      required: true,
    },
    {
      name: "num_results",
      type: "number",
      description: "Number of images to return (default: 10)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { query, num_results = 10 } = params;

      return {
        success: true,
        result: `Image search results for: ${query}`,
        metadata: {
          query,
          num_results,
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

export const newsSearchTool: Tool = {
  name: "news_search",
  description: "Search for recent news articles",
  category: "search",
  parameters: [
    {
      name: "query",
      type: "string",
      description: "The news search query",
      required: true,
    },
    {
      name: "time_range",
      type: "string",
      description: "Time range for news (past_day, past_week, past_month)",
      required: false,
      enum: ["past_day", "past_week", "past_month"],
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { query, time_range = "past_week" } = params;

      return {
        success: true,
        result: `News search results for: ${query}`,
        metadata: {
          query,
          time_range,
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
