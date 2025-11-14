import { Tool, ToolResult } from "./registry";
import { exec } from "child_process";
import { promisify } from "util";
import * as zlib from "zlib";

const execAsync = promisify(exec);

export const gzipCompressTool: Tool = {
  name: "gzip_compress",
  description: "Compress text using gzip",
  category: "compression",
  parameters: [
    {
      name: "text",
      type: "string",
      description: "Text to compress",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { text } = params;

      const compressed = zlib.gzipSync(text);
      const result = compressed.toString("base64");

      return {
        success: true,
        result,
        metadata: {
          original_size: text.length,
          compressed_size: compressed.length,
          ratio: (compressed.length / text.length).toFixed(2),
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

export const gzipDecompressTool: Tool = {
  name: "gzip_decompress",
  description: "Decompress gzip compressed text",
  category: "compression",
  parameters: [
    {
      name: "compressed",
      type: "string",
      description: "Base64 encoded compressed text",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { compressed } = params;

      const buffer = Buffer.from(compressed, "base64");
      const decompressed = zlib.gunzipSync(buffer);
      const result = decompressed.toString();

      return {
        success: true,
        result,
        metadata: {
          compressed_size: buffer.length,
          decompressed_size: result.length,
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

export const zipCreateTool: Tool = {
  name: "zip_create",
  description: "Create a zip archive",
  category: "compression",
  parameters: [
    {
      name: "files",
      type: "string",
      description: "Comma-separated file paths",
      required: true,
    },
    {
      name: "output",
      type: "string",
      description: "Output zip file path",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { files, output } = params;

      const { stdout } = await execAsync(`zip ${output} ${files.split(",").join(" ")}`);

      return {
        success: true,
        result: `Created ${output}`,
        metadata: {
          output,
          files: files.split(","),
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

export const zipExtractTool: Tool = {
  name: "zip_extract",
  description: "Extract a zip archive",
  category: "compression",
  parameters: [
    {
      name: "file",
      type: "string",
      description: "Zip file path",
      required: true,
    },
    {
      name: "destination",
      type: "string",
      description: "Destination directory",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { file, destination = "." } = params;

      const { stdout } = await execAsync(`unzip ${file} -d ${destination}`);

      return {
        success: true,
        result: `Extracted to ${destination}`,
        metadata: {
          file,
          destination,
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

export const zipListTool: Tool = {
  name: "zip_list",
  description: "List contents of a zip archive",
  category: "compression",
  parameters: [
    {
      name: "file",
      type: "string",
      description: "Zip file path",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { file } = params;

      const { stdout } = await execAsync(`unzip -l ${file}`);

      return {
        success: true,
        result: stdout,
        metadata: {
          file,
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

export const tarCreateTool: Tool = {
  name: "tar_create",
  description: "Create a tar archive",
  category: "compression",
  parameters: [
    {
      name: "files",
      type: "string",
      description: "Comma-separated file paths",
      required: true,
    },
    {
      name: "output",
      type: "string",
      description: "Output tar file path",
      required: true,
    },
    {
      name: "compress",
      type: "boolean",
      description: "Compress with gzip",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { files, output, compress = false } = params;

      const flag = compress ? "czf" : "cf";
      const { stdout } = await execAsync(
        `tar ${flag} ${output} ${files.split(",").join(" ")}`
      );

      return {
        success: true,
        result: `Created ${output}`,
        metadata: {
          output,
          files: files.split(","),
          compressed: compress,
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

export const tarExtractTool: Tool = {
  name: "tar_extract",
  description: "Extract a tar archive",
  category: "compression",
  parameters: [
    {
      name: "file",
      type: "string",
      description: "Tar file path",
      required: true,
    },
    {
      name: "destination",
      type: "string",
      description: "Destination directory",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { file, destination = "." } = params;

      const flag = file.endsWith(".gz") ? "xzf" : "xf";
      const { stdout } = await execAsync(`tar ${flag} ${file} -C ${destination}`);

      return {
        success: true,
        result: `Extracted to ${destination}`,
        metadata: {
          file,
          destination,
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

export const tarListTool: Tool = {
  name: "tar_list",
  description: "List contents of a tar archive",
  category: "compression",
  parameters: [
    {
      name: "file",
      type: "string",
      description: "Tar file path",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { file } = params;

      const flag = file.endsWith(".gz") ? "tzf" : "tf";
      const { stdout } = await execAsync(`tar ${flag} ${file}`);

      return {
        success: true,
        result: stdout,
        metadata: {
          file,
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
