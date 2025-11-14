import { Tool, ToolResult } from "./registry";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const gitCloneTool: Tool = {
  name: "git_clone",
  description: "Clone a Git repository",
  category: "git",
  parameters: [
    {
      name: "url",
      type: "string",
      description: "Repository URL",
      required: true,
    },
    {
      name: "directory",
      type: "string",
      description: "Target directory",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { url, directory } = params;
      const { sessionId } = context;

      const targetDir = directory || `/tmp/repo_${sessionId}_${Date.now()}`;
      const { stdout, stderr } = await execAsync(`git clone ${url} ${targetDir}`);

      return {
        success: true,
        result: `Repository cloned to ${targetDir}`,
        metadata: {
          directory: targetDir,
          url,
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

export const gitStatusTool: Tool = {
  name: "git_status",
  description: "Get Git repository status",
  category: "git",
  parameters: [
    {
      name: "directory",
      type: "string",
      description: "Repository directory",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { directory } = params;
      const { stdout } = await execAsync(`cd ${directory} && git status`);

      return {
        success: true,
        result: stdout,
        metadata: {
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

export const gitCommitTool: Tool = {
  name: "git_commit",
  description: "Commit changes to Git repository",
  category: "git",
  parameters: [
    {
      name: "directory",
      type: "string",
      description: "Repository directory",
      required: true,
    },
    {
      name: "message",
      type: "string",
      description: "Commit message",
      required: true,
    },
    {
      name: "add_all",
      type: "boolean",
      description: "Add all changes (default: true)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { directory, message, add_all = true } = params;

      let command = `cd ${directory}`;
      if (add_all) {
        command += ` && git add .`;
      }
      command += ` && git commit -m "${message}"`;

      const { stdout } = await execAsync(command);

      return {
        success: true,
        result: stdout,
        metadata: {
          directory,
          message,
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

export const gitPushTool: Tool = {
  name: "git_push",
  description: "Push commits to remote repository",
  category: "git",
  parameters: [
    {
      name: "directory",
      type: "string",
      description: "Repository directory",
      required: true,
    },
    {
      name: "remote",
      type: "string",
      description: "Remote name (default: origin)",
      required: false,
    },
    {
      name: "branch",
      type: "string",
      description: "Branch name (default: current branch)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { directory, remote = "origin", branch = "" } = params;
      const { stdout } = await execAsync(
        `cd ${directory} && git push ${remote} ${branch}`
      );

      return {
        success: true,
        result: stdout || "Pushed successfully",
        metadata: {
          directory,
          remote,
          branch,
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

export const gitPullTool: Tool = {
  name: "git_pull",
  description: "Pull changes from remote repository",
  category: "git",
  parameters: [
    {
      name: "directory",
      type: "string",
      description: "Repository directory",
      required: true,
    },
    {
      name: "remote",
      type: "string",
      description: "Remote name (default: origin)",
      required: false,
    },
    {
      name: "branch",
      type: "string",
      description: "Branch name (default: current branch)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { directory, remote = "origin", branch = "" } = params;
      const { stdout } = await execAsync(
        `cd ${directory} && git pull ${remote} ${branch}`
      );

      return {
        success: true,
        result: stdout,
        metadata: {
          directory,
          remote,
          branch,
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

export const gitBranchTool: Tool = {
  name: "git_branch",
  description: "List or create Git branches",
  category: "git",
  parameters: [
    {
      name: "directory",
      type: "string",
      description: "Repository directory",
      required: true,
    },
    {
      name: "branch_name",
      type: "string",
      description: "Branch name to create (optional)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { directory, branch_name } = params;

      const command = branch_name
        ? `cd ${directory} && git branch ${branch_name}`
        : `cd ${directory} && git branch`;

      const { stdout } = await execAsync(command);

      return {
        success: true,
        result: stdout,
        metadata: {
          directory,
          branch_name,
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

export const gitCheckoutTool: Tool = {
  name: "git_checkout",
  description: "Checkout a Git branch",
  category: "git",
  parameters: [
    {
      name: "directory",
      type: "string",
      description: "Repository directory",
      required: true,
    },
    {
      name: "branch",
      type: "string",
      description: "Branch name",
      required: true,
    },
    {
      name: "create",
      type: "boolean",
      description: "Create new branch (default: false)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { directory, branch, create = false } = params;

      const command = create
        ? `cd ${directory} && git checkout -b ${branch}`
        : `cd ${directory} && git checkout ${branch}`;

      const { stdout } = await execAsync(command);

      return {
        success: true,
        result: stdout,
        metadata: {
          directory,
          branch,
          created: create,
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

export const gitLogTool: Tool = {
  name: "git_log",
  description: "View Git commit history",
  category: "git",
  parameters: [
    {
      name: "directory",
      type: "string",
      description: "Repository directory",
      required: true,
    },
    {
      name: "limit",
      type: "number",
      description: "Number of commits to show (default: 10)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { directory, limit = 10 } = params;
      const { stdout } = await execAsync(
        `cd ${directory} && git log --oneline -n ${limit}`
      );

      return {
        success: true,
        result: stdout,
        metadata: {
          directory,
          limit,
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

export const gitDiffTool: Tool = {
  name: "git_diff",
  description: "Show Git diff",
  category: "git",
  parameters: [
    {
      name: "directory",
      type: "string",
      description: "Repository directory",
      required: true,
    },
    {
      name: "file",
      type: "string",
      description: "Specific file to diff (optional)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { directory, file } = params;

      const command = file
        ? `cd ${directory} && git diff ${file}`
        : `cd ${directory} && git diff`;

      const { stdout } = await execAsync(command);

      return {
        success: true,
        result: stdout || "No changes",
        metadata: {
          directory,
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
