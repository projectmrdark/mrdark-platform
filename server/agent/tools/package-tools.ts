import { Tool, ToolResult } from "./registry";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const npmInstallTool: Tool = {
  name: "npm_install",
  description: "Install npm packages",
  category: "package",
  parameters: [
    {
      name: "package",
      type: "string",
      description: "Package name (or empty for package.json install)",
      required: false,
    },
    {
      name: "directory",
      type: "string",
      description: "Project directory",
      required: true,
    },
    {
      name: "dev",
      type: "boolean",
      description: "Install as dev dependency",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { package: pkg, directory, dev = false } = params;

      let command = `cd ${directory} && npm install`;
      if (pkg) {
        command += ` ${pkg}`;
        if (dev) {
          command += ` --save-dev`;
        }
      }

      const { stdout, stderr } = await execAsync(command);

      return {
        success: true,
        result: stdout || stderr,
        metadata: {
          package: pkg,
          directory,
          dev,
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

export const npmUninstallTool: Tool = {
  name: "npm_uninstall",
  description: "Uninstall npm packages",
  category: "package",
  parameters: [
    {
      name: "package",
      type: "string",
      description: "Package name",
      required: true,
    },
    {
      name: "directory",
      type: "string",
      description: "Project directory",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { package: pkg, directory } = params;
      const { stdout, stderr } = await execAsync(
        `cd ${directory} && npm uninstall ${pkg}`
      );

      return {
        success: true,
        result: stdout || stderr,
        metadata: {
          package: pkg,
          directory,
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

export const npmRunTool: Tool = {
  name: "npm_run",
  description: "Run npm script",
  category: "package",
  parameters: [
    {
      name: "script",
      type: "string",
      description: "Script name from package.json",
      required: true,
    },
    {
      name: "directory",
      type: "string",
      description: "Project directory",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { script, directory } = params;
      const { stdout, stderr } = await execAsync(
        `cd ${directory} && npm run ${script}`
      );

      return {
        success: true,
        result: stdout || stderr,
        metadata: {
          script,
          directory,
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

export const pipInstallTool: Tool = {
  name: "pip_install",
  description: "Install Python packages with pip",
  category: "package",
  parameters: [
    {
      name: "package",
      type: "string",
      description: "Package name (or empty for requirements.txt)",
      required: false,
    },
    {
      name: "version",
      type: "string",
      description: "Package version",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { package: pkg, version } = params;

      let command = "pip install";
      if (pkg) {
        command += ` ${pkg}`;
        if (version) {
          command += `==${version}`;
        }
      } else {
        command += " -r requirements.txt";
      }

      const { stdout, stderr } = await execAsync(command);

      return {
        success: true,
        result: stdout || stderr,
        metadata: {
          package: pkg,
          version,
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

export const pipUninstallTool: Tool = {
  name: "pip_uninstall",
  description: "Uninstall Python packages with pip",
  category: "package",
  parameters: [
    {
      name: "package",
      type: "string",
      description: "Package name",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { package: pkg } = params;
      const { stdout, stderr } = await execAsync(`pip uninstall -y ${pkg}`);

      return {
        success: true,
        result: stdout || stderr,
        metadata: {
          package: pkg,
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

export const pipListTool: Tool = {
  name: "pip_list",
  description: "List installed Python packages",
  category: "package",
  parameters: [],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { stdout } = await execAsync("pip list");

      return {
        success: true,
        result: stdout,
        metadata: {},
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export const yarnInstallTool: Tool = {
  name: "yarn_install",
  description: "Install packages with Yarn",
  category: "package",
  parameters: [
    {
      name: "package",
      type: "string",
      description: "Package name (or empty for yarn.lock install)",
      required: false,
    },
    {
      name: "directory",
      type: "string",
      description: "Project directory",
      required: true,
    },
    {
      name: "dev",
      type: "boolean",
      description: "Install as dev dependency",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { package: pkg, directory, dev = false } = params;

      let command = `cd ${directory} && yarn`;
      if (pkg) {
        command += ` add ${pkg}`;
        if (dev) {
          command += ` --dev`;
        }
      }

      const { stdout, stderr } = await execAsync(command);

      return {
        success: true,
        result: stdout || stderr,
        metadata: {
          package: pkg,
          directory,
          dev,
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

export const pnpmInstallTool: Tool = {
  name: "pnpm_install",
  description: "Install packages with pnpm",
  category: "package",
  parameters: [
    {
      name: "package",
      type: "string",
      description: "Package name (or empty for pnpm-lock.yaml install)",
      required: false,
    },
    {
      name: "directory",
      type: "string",
      description: "Project directory",
      required: true,
    },
    {
      name: "dev",
      type: "boolean",
      description: "Install as dev dependency",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { package: pkg, directory, dev = false } = params;

      let command = `cd ${directory} && pnpm install`;
      if (pkg) {
        command = `cd ${directory} && pnpm add ${pkg}`;
        if (dev) {
          command += ` --save-dev`;
        }
      }

      const { stdout, stderr } = await execAsync(command);

      return {
        success: true,
        result: stdout || stderr,
        metadata: {
          package: pkg,
          directory,
          dev,
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
