import { ToolRegistry } from "./registry";
import { fileReadTool, fileWriteTool, fileListTool } from "./file-tools";
import { webSearchTool, imageSearchTool, newsSearchTool } from "./search-tools";
import { executePythonTool, executeJavaScriptTool, executeShellTool } from "./code-tools";
import {
  browserNavigateTool,
  browserClickTool,
  browserTypeTool,
  browserScreenshotTool,
  browserExtractTool,
} from "./browser-tools";
import {
  imageGenerateTool,
  imageEditTool,
  dataAnalyzeTool,
  dataVisualizeTool,
} from "./ai-tools";

export function initializeTools(registry: ToolRegistry): void {
  // File tools
  registry.register(fileReadTool);
  registry.register(fileWriteTool);
  registry.register(fileListTool);

  // Search tools
  registry.register(webSearchTool);
  registry.register(imageSearchTool);
  registry.register(newsSearchTool);

  // Code execution tools
  registry.register(executePythonTool);
  registry.register(executeJavaScriptTool);
  registry.register(executeShellTool);

  // Browser tools
  registry.register(browserNavigateTool);
  registry.register(browserClickTool);
  registry.register(browserTypeTool);
  registry.register(browserScreenshotTool);
  registry.register(browserExtractTool);

  // AI tools
  registry.register(imageGenerateTool);
  registry.register(imageEditTool);
  registry.register(dataAnalyzeTool);
  registry.register(dataVisualizeTool);
}

export * from "./registry";
