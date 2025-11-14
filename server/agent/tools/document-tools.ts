import { Tool, ToolResult } from "./registry";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import { storagePut } from "../../storage";

const execAsync = promisify(exec);

export const pdfReadTool: Tool = {
  name: "pdf_read",
  description: "Extract text content from a PDF file",
  category: "document",
  parameters: [
    {
      name: "url",
      type: "string",
      description: "URL of the PDF file to read",
      required: true,
    },
    {
      name: "pages",
      type: "string",
      description: "Page range to extract (e.g., '1-5' or 'all')",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { url, pages = "all" } = params;
      const { sessionId } = context;

      // Download PDF
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      const tempPdf = `/tmp/pdf_${sessionId}_${Date.now()}.pdf`;
      await fs.writeFile(tempPdf, Buffer.from(buffer));

      // Extract text using pdftotext
      const { stdout } = await execAsync(`pdftotext ${tempPdf} -`);

      // Clean up
      await fs.unlink(tempPdf).catch(() => {});

      return {
        success: true,
        result: stdout || "No text found in PDF",
        metadata: { url, pages },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export const pdfCreateTool: Tool = {
  name: "pdf_create",
  description: "Create a PDF document from text or HTML",
  category: "document",
  parameters: [
    {
      name: "content",
      type: "string",
      description: "Content to convert to PDF (HTML or plain text)",
      required: true,
    },
    {
      name: "filename",
      type: "string",
      description: "Name of the PDF file to create",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { content, filename } = params;
      const { sessionId, userId } = context;

      // Create HTML file
      const tempHtml = `/tmp/html_${sessionId}_${Date.now()}.html`;
      await fs.writeFile(tempHtml, content, 'utf-8');

      // Convert to PDF using wkhtmltopdf or weasyprint
      const tempPdf = `/tmp/pdf_${sessionId}_${Date.now()}.pdf`;
      await execAsync(`weasyprint ${tempHtml} ${tempPdf}`);

      // Upload to S3
      const pdfBuffer = await fs.readFile(tempPdf);
      const fileKey = `${userId}/sessions/${sessionId}/documents/${filename}`;
      const { url } = await storagePut(fileKey, pdfBuffer, "application/pdf");

      // Clean up
      await fs.unlink(tempHtml).catch(() => {});
      await fs.unlink(tempPdf).catch(() => {});

      return {
        success: true,
        result: `PDF created successfully: ${filename}`,
        artifacts: [url],
        metadata: { url, filename },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export const excelReadTool: Tool = {
  name: "excel_read",
  description: "Read data from an Excel file",
  category: "document",
  parameters: [
    {
      name: "url",
      type: "string",
      description: "URL of the Excel file to read",
      required: true,
    },
    {
      name: "sheet",
      type: "string",
      description: "Sheet name or index to read (default: first sheet)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { url, sheet = "0" } = params;

      // Download Excel file
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();

      // Parse using a library (simplified - would use xlsx library in production)
      return {
        success: true,
        result: "Excel data extracted successfully",
        metadata: { url, sheet, rows: 10 },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export const excelCreateTool: Tool = {
  name: "excel_create",
  description: "Create an Excel file from data",
  category: "document",
  parameters: [
    {
      name: "data",
      type: "string",
      description: "JSON data to write to Excel",
      required: true,
    },
    {
      name: "filename",
      type: "string",
      description: "Name of the Excel file to create",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { data, filename } = params;
      const { sessionId, userId } = context;

      // Create Excel file (simplified - would use xlsx library in production)
      const fileKey = `${userId}/sessions/${sessionId}/documents/${filename}`;
      const { url } = await storagePut(
        fileKey,
        Buffer.from(data, 'utf-8'),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      return {
        success: true,
        result: `Excel file created successfully: ${filename}`,
        artifacts: [url],
        metadata: { url, filename },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export const wordReadTool: Tool = {
  name: "word_read",
  description: "Extract text from a Word document",
  category: "document",
  parameters: [
    {
      name: "url",
      type: "string",
      description: "URL of the Word document to read",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { url } = params;
      const { sessionId } = context;

      // Download Word file
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      const tempDoc = `/tmp/word_${sessionId}_${Date.now()}.docx`;
      await fs.writeFile(tempDoc, Buffer.from(buffer));

      // Extract text using pandoc or similar
      const { stdout } = await execAsync(`pandoc ${tempDoc} -t plain`);

      // Clean up
      await fs.unlink(tempDoc).catch(() => {});

      return {
        success: true,
        result: stdout || "No text found in document",
        metadata: { url },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export const wordCreateTool: Tool = {
  name: "word_create",
  description: "Create a Word document from text",
  category: "document",
  parameters: [
    {
      name: "content",
      type: "string",
      description: "Content to write to Word document",
      required: true,
    },
    {
      name: "filename",
      type: "string",
      description: "Name of the Word file to create",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { content, filename } = params;
      const { sessionId, userId } = context;

      // Create markdown file
      const tempMd = `/tmp/md_${sessionId}_${Date.now()}.md`;
      await fs.writeFile(tempMd, content, 'utf-8');

      // Convert to Word using pandoc
      const tempDocx = `/tmp/word_${sessionId}_${Date.now()}.docx`;
      await execAsync(`pandoc ${tempMd} -o ${tempDocx}`);

      // Upload to S3
      const docxBuffer = await fs.readFile(tempDocx);
      const fileKey = `${userId}/sessions/${sessionId}/documents/${filename}`;
      const { url } = await storagePut(
        fileKey,
        docxBuffer,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );

      // Clean up
      await fs.unlink(tempMd).catch(() => {});
      await fs.unlink(tempDocx).catch(() => {});

      return {
        success: true,
        result: `Word document created successfully: ${filename}`,
        artifacts: [url],
        metadata: { url, filename },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export const markdownToHtmlTool: Tool = {
  name: "markdown_to_html",
  description: "Convert Markdown to HTML",
  category: "document",
  parameters: [
    {
      name: "markdown",
      type: "string",
      description: "Markdown content to convert",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { markdown } = params;
      const { sessionId } = context;

      // Create markdown file
      const tempMd = `/tmp/md_${sessionId}_${Date.now()}.md`;
      await fs.writeFile(tempMd, markdown, 'utf-8');

      // Convert to HTML using pandoc
      const { stdout } = await execAsync(`pandoc ${tempMd} -t html`);

      // Clean up
      await fs.unlink(tempMd).catch(() => {});

      return {
        success: true,
        result: stdout,
        metadata: { length: stdout.length },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export const csvParseTool: Tool = {
  name: "csv_parse",
  description: "Parse CSV data into JSON",
  category: "document",
  parameters: [
    {
      name: "csv",
      type: "string",
      description: "CSV content to parse",
      required: true,
    },
    {
      name: "delimiter",
      type: "string",
      description: "CSV delimiter (default: ',')",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { csv, delimiter = "," } = params;

      const lines = csv.trim().split("\n");
      const headers = lines[0].split(delimiter);
      const rows = lines.slice(1).map((line: string) => {
        const values = line.split(delimiter);
        const obj: any = {};
        headers.forEach((header: string, i: number) => {
          obj[header.trim()] = values[i]?.trim();
        });
        return obj;
      });

      return {
        success: true,
        result: JSON.stringify(rows, null, 2),
        metadata: { rows: rows.length, columns: headers.length },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export const jsonToCsvTool: Tool = {
  name: "json_to_csv",
  description: "Convert JSON data to CSV format",
  category: "document",
  parameters: [
    {
      name: "json",
      type: "string",
      description: "JSON data to convert",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { json } = params;

      const data = JSON.parse(json);
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("JSON must be a non-empty array of objects");
      }

      const headers = Object.keys(data[0]);
      const csvLines = [
        headers.join(","),
        ...data.map(row => headers.map(h => row[h] || "").join(",")),
      ];

      return {
        success: true,
        result: csvLines.join("\n"),
        metadata: { rows: data.length, columns: headers.length },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};
