import { Tool, ToolResult } from "./registry";
import { getDb } from "../../db";

export const sqlQueryTool: Tool = {
  name: "sql_query",
  description: "Execute a SQL SELECT query",
  category: "database",
  parameters: [
    {
      name: "query",
      type: "string",
      description: "SQL SELECT query",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { query } = params;

      // Validate it's a SELECT query
      if (!query.trim().toLowerCase().startsWith("select")) {
        throw new Error("Only SELECT queries are allowed");
      }

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const results = await db.execute(query);

      return {
        success: true,
        result: JSON.stringify(results, null, 2),
        metadata: {
          rowCount: Array.isArray(results) ? results.length : 0,
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

export const sqlInsertTool: Tool = {
  name: "sql_insert",
  description: "Execute a SQL INSERT statement",
  category: "database",
  parameters: [
    {
      name: "table",
      type: "string",
      description: "Table name",
      required: true,
    },
    {
      name: "data",
      type: "string",
      description: "JSON object of column-value pairs",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { table, data } = params;
      const parsedData = JSON.parse(data);

      const columns = Object.keys(parsedData).join(", ");
      const values = Object.values(parsedData)
        .map((v) => (typeof v === "string" ? `'${v}'` : v))
        .join(", ");

      const query = `INSERT INTO ${table} (${columns}) VALUES (${values})`;

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const result = await db.execute(query);

      return {
        success: true,
        result: "Insert successful",
        metadata: {
          table,
          query,
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

export const sqlUpdateTool: Tool = {
  name: "sql_update",
  description: "Execute a SQL UPDATE statement",
  category: "database",
  parameters: [
    {
      name: "table",
      type: "string",
      description: "Table name",
      required: true,
    },
    {
      name: "data",
      type: "string",
      description: "JSON object of column-value pairs to update",
      required: true,
    },
    {
      name: "where",
      type: "string",
      description: "WHERE clause (without 'WHERE' keyword)",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { table, data, where } = params;
      const parsedData = JSON.parse(data);

      const setClause = Object.entries(parsedData)
        .map(([key, value]) => `${key} = ${typeof value === "string" ? `'${value}'` : value}`)
        .join(", ");

      const query = `UPDATE ${table} SET ${setClause} WHERE ${where}`;

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const result = await db.execute(query);

      return {
        success: true,
        result: "Update successful",
        metadata: {
          table,
          query,
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

export const sqlDeleteTool: Tool = {
  name: "sql_delete",
  description: "Execute a SQL DELETE statement",
  category: "database",
  parameters: [
    {
      name: "table",
      type: "string",
      description: "Table name",
      required: true,
    },
    {
      name: "where",
      type: "string",
      description: "WHERE clause (without 'WHERE' keyword)",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { table, where } = params;

      const query = `DELETE FROM ${table} WHERE ${where}`;

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const result = await db.execute(query);

      return {
        success: true,
        result: "Delete successful",
        metadata: {
          table,
          query,
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

export const sqlTableInfoTool: Tool = {
  name: "sql_table_info",
  description: "Get information about a database table",
  category: "database",
  parameters: [
    {
      name: "table",
      type: "string",
      description: "Table name",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { table } = params;

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const query = `DESCRIBE ${table}`;
      const results = await db.execute(query);

      return {
        success: true,
        result: JSON.stringify(results, null, 2),
        metadata: {
          table,
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

export const sqlListTablesTool: Tool = {
  name: "sql_list_tables",
  description: "List all tables in the database",
  category: "database",
  parameters: [],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const query = "SHOW TABLES";
      const results = await db.execute(query);

      return {
        success: true,
        result: JSON.stringify(results, null, 2),
        metadata: {
          count: Array.isArray(results) ? results.length : 0,
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
