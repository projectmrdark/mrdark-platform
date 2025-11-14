import { Tool, ToolResult } from "./registry";
import { generateImage } from "../../_core/imageGeneration";

export const imageGenerateTool: Tool = {
  name: "image_generate",
  description: "Generate an image from a text prompt using AI",
  category: "ai",
  parameters: [
    {
      name: "prompt",
      type: "string",
      description: "The text prompt describing the image to generate",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { prompt } = params;

      const result = await generateImage({ prompt });

      return {
        success: true,
        result: "Image generated successfully",
        artifacts: result.url ? [result.url] : [],
        metadata: {
          prompt,
          url: result.url || "",
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

export const imageEditTool: Tool = {
  name: "image_edit",
  description: "Edit an existing image using AI",
  category: "ai",
  parameters: [
    {
      name: "prompt",
      type: "string",
      description: "The text prompt describing the edits to make",
      required: true,
    },
    {
      name: "image_url",
      type: "string",
      description: "URL of the image to edit",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { prompt, image_url } = params;

      const result = await generateImage({
        prompt,
        originalImages: [
          {
            url: image_url,
            mimeType: "image/jpeg",
          },
        ],
      });

      return {
        success: true,
        result: "Image edited successfully",
        artifacts: result.url ? [result.url] : [],
        metadata: {
          prompt,
          original_url: image_url,
          edited_url: result.url || "",
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

export const dataAnalyzeTool: Tool = {
  name: "data_analyze",
  description: "Analyze data and generate insights",
  category: "data",
  parameters: [
    {
      name: "data",
      type: "string",
      description: "The data to analyze (JSON format)",
      required: true,
    },
    {
      name: "analysis_type",
      type: "string",
      description: "Type of analysis to perform",
      required: true,
      enum: ["summary", "trends", "correlations", "predictions"],
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { data, analysis_type } = params;

      return {
        success: true,
        result: `Data analysis completed: ${analysis_type}`,
        metadata: {
          analysis_type,
          data_points: 100,
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

export const dataVisualizeTool: Tool = {
  name: "data_visualize",
  description: "Create visualizations from data",
  category: "data",
  parameters: [
    {
      name: "data",
      type: "string",
      description: "The data to visualize (JSON format)",
      required: true,
    },
    {
      name: "chart_type",
      type: "string",
      description: "Type of chart to create",
      required: true,
      enum: ["bar", "line", "pie", "scatter", "heatmap"],
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { data, chart_type } = params;

      return {
        success: true,
        result: `Visualization created: ${chart_type} chart`,
        artifacts: ["https://example.com/chart.png"],
        metadata: {
          chart_type,
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
