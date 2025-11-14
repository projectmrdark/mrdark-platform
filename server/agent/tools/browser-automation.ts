import { Tool, ToolResult } from "./registry";

interface ToolContext {
  sessionId: number;
  userId: number;
  mode: string;
}
import puppeteer, { Browser, Page } from "puppeteer";
import { storagePut } from "../../storage";

// Browser instance pool
const browserPool: Map<number, Browser> = new Map();
const pagePool: Map<number, Page> = new Map();

async function getBrowser(sessionId: number): Promise<Browser> {
  if (!browserPool.has(sessionId)) {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });
    browserPool.set(sessionId, browser);
  }
  return browserPool.get(sessionId)!;
}

async function getPage(sessionId: number): Promise<Page> {
  if (!pagePool.has(sessionId)) {
    const browser = await getBrowser(sessionId);
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    pagePool.set(sessionId, page);
  }
  return pagePool.get(sessionId)!;
}

export async function closeBrowser(sessionId: number): Promise<void> {
  const browser = browserPool.get(sessionId);
  if (browser) {
    await browser.close();
    browserPool.delete(sessionId);
    pagePool.delete(sessionId);
  }
}

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
    {
      name: "wait_for",
      type: "string",
      description: "Wait for condition: load, domcontentloaded, networkidle0, networkidle2",
      required: false,
      enum: ["load", "domcontentloaded", "networkidle0", "networkidle2"],
    },
  ],
  execute: async (params, context: ToolContext): Promise<ToolResult> => {
    try {
      const { url, wait_for = "load" } = params;
      const { sessionId } = context;

      const page = await getPage(sessionId);
      await page.goto(url, { waitUntil: wait_for as any });

      const title = await page.title();

      return {
        success: true,
        result: `Navigated to ${url}. Page title: ${title}`,
        metadata: { url, title },
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
      description: "Capture full page (default: false)",
      required: false,
    },
  ],
  execute: async (params, context: ToolContext): Promise<ToolResult> => {
    try {
      const { full_page = false } = params;
      const { sessionId, userId } = context;

      const page = await getPage(sessionId);
      const screenshot = await page.screenshot({
        fullPage: full_page,
        type: "png",
      });

      // Upload to S3
      const fileKey = `${userId}/sessions/${sessionId}/screenshots/${Date.now()}.png`;
      const { url } = await storagePut(fileKey, screenshot, "image/png");

      return {
        success: true,
        result: "Screenshot captured successfully",
        artifacts: [url],
        metadata: { url, full_page },
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
  description: "Click on an element in the browser",
  category: "browser",
  parameters: [
    {
      name: "selector",
      type: "string",
      description: "CSS selector of the element to click",
      required: true,
    },
    {
      name: "wait_for_navigation",
      type: "boolean",
      description: "Wait for navigation after click (default: false)",
      required: false,
    },
  ],
  execute: async (params, context: ToolContext): Promise<ToolResult> => {
    try {
      const { selector, wait_for_navigation = false } = params;
      const { sessionId } = context;

      const page = await getPage(sessionId);

      if (wait_for_navigation) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: "load" }),
          page.click(selector),
        ]);
      } else {
        await page.click(selector);
      }

      return {
        success: true,
        result: `Clicked on element: ${selector}`,
        metadata: { selector },
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
      description: "Text to type",
      required: true,
    },
    {
      name: "delay",
      type: "number",
      description: "Delay between keystrokes in ms (default: 0)",
      required: false,
    },
  ],
  execute: async (params, context: ToolContext): Promise<ToolResult> => {
    try {
      const { selector, text, delay = 0 } = params;
      const { sessionId } = context;

      const page = await getPage(sessionId);
      await page.type(selector, text, { delay });

      return {
        success: true,
        result: `Typed text into: ${selector}`,
        metadata: { selector, text_length: text.length },
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
  description: "Extract text content or HTML from elements",
  category: "browser",
  parameters: [
    {
      name: "selector",
      type: "string",
      description: "CSS selector of elements to extract",
      required: true,
    },
    {
      name: "attribute",
      type: "string",
      description: "Attribute to extract (default: textContent)",
      required: false,
    },
  ],
  execute: async (params, context: ToolContext): Promise<ToolResult> => {
    try {
      const { selector, attribute = "textContent" } = params;
      const { sessionId } = context;

      const page = await getPage(sessionId);

      const elements = await page.$$(selector);
      const results = [];

      for (const element of elements) {
        if (attribute === "textContent") {
          const text = await element.evaluate((el) => el.textContent);
          results.push(text);
        } else if (attribute === "innerHTML") {
          const html = await element.evaluate((el) => el.innerHTML);
          results.push(html);
        } else {
          const attr = await element.evaluate(
            (el, attr) => el.getAttribute(attr),
            attribute
          );
          results.push(attr);
        }
      }

      return {
        success: true,
        result: results.join("\n\n"),
        metadata: {
          selector,
          attribute,
          count: results.length,
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

export const browserWaitTool: Tool = {
  name: "browser_wait",
  description: "Wait for an element to appear or a condition to be met",
  category: "browser",
  parameters: [
    {
      name: "selector",
      type: "string",
      description: "CSS selector to wait for",
      required: false,
    },
    {
      name: "timeout",
      type: "number",
      description: "Timeout in milliseconds (default: 30000)",
      required: false,
    },
  ],
  execute: async (params, context: ToolContext): Promise<ToolResult> => {
    try {
      const { selector, timeout = 30000 } = params;
      const { sessionId } = context;

      const page = await getPage(sessionId);

      if (selector) {
        await page.waitForSelector(selector, { timeout });
        return {
          success: true,
          result: `Element found: ${selector}`,
          metadata: { selector },
        };
      } else {
        await new Promise(resolve => setTimeout(resolve, timeout));
        return {
          success: true,
          result: `Waited for ${timeout}ms`,
          metadata: { timeout },
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

export const browserEvaluateTool: Tool = {
  name: "browser_evaluate",
  description: "Execute JavaScript code in the browser context",
  category: "browser",
  parameters: [
    {
      name: "code",
      type: "string",
      description: "JavaScript code to execute",
      required: true,
    },
  ],
  execute: async (params, context: ToolContext): Promise<ToolResult> => {
    try {
      const { code } = params;
      const { sessionId } = context;

      const page = await getPage(sessionId);
      const result = await page.evaluate((code) => {
        return eval(code);
      }, code);

      return {
        success: true,
        result: JSON.stringify(result, null, 2),
        metadata: { code },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};
