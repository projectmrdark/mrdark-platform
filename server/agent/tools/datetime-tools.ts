import { Tool, ToolResult } from "./registry";

export const dateFormatTool: Tool = {
  name: "date_format",
  description: "Format date to specific format",
  category: "datetime",
  parameters: [
    {
      name: "date",
      type: "string",
      description: "Date string or timestamp",
      required: true,
    },
    {
      name: "format",
      type: "string",
      description: "Format: iso, unix, readable (default: iso)",
      required: false,
      enum: ["iso", "unix", "readable"],
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { date, format = "iso" } = params;

      const d = new Date(date);

      let result: string;
      switch (format) {
        case "unix":
          result = Math.floor(d.getTime() / 1000).toString();
          break;
        case "readable":
          result = d.toLocaleString();
          break;
        case "iso":
        default:
          result = d.toISOString();
          break;
      }

      return {
        success: true,
        result,
        metadata: {
          format,
          timestamp: d.getTime(),
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

export const dateAddTool: Tool = {
  name: "date_add",
  description: "Add time to a date",
  category: "datetime",
  parameters: [
    {
      name: "date",
      type: "string",
      description: "Date string or timestamp",
      required: true,
    },
    {
      name: "amount",
      type: "number",
      description: "Amount to add",
      required: true,
    },
    {
      name: "unit",
      type: "string",
      description: "Unit: seconds, minutes, hours, days, months, years",
      required: true,
      enum: ["seconds", "minutes", "hours", "days", "months", "years"],
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { date, amount, unit } = params;

      const d = new Date(date);

      switch (unit) {
        case "seconds":
          d.setSeconds(d.getSeconds() + amount);
          break;
        case "minutes":
          d.setMinutes(d.getMinutes() + amount);
          break;
        case "hours":
          d.setHours(d.getHours() + amount);
          break;
        case "days":
          d.setDate(d.getDate() + amount);
          break;
        case "months":
          d.setMonth(d.getMonth() + amount);
          break;
        case "years":
          d.setFullYear(d.getFullYear() + amount);
          break;
      }

      return {
        success: true,
        result: d.toISOString(),
        metadata: {
          amount,
          unit,
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

export const dateDiffTool: Tool = {
  name: "date_diff",
  description: "Calculate difference between two dates",
  category: "datetime",
  parameters: [
    {
      name: "date1",
      type: "string",
      description: "First date",
      required: true,
    },
    {
      name: "date2",
      type: "string",
      description: "Second date",
      required: true,
    },
    {
      name: "unit",
      type: "string",
      description: "Unit: seconds, minutes, hours, days (default: days)",
      required: false,
      enum: ["seconds", "minutes", "hours", "days"],
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { date1, date2, unit = "days" } = params;

      const d1 = new Date(date1);
      const d2 = new Date(date2);

      const diffMs = Math.abs(d2.getTime() - d1.getTime());

      let result: number;
      switch (unit) {
        case "seconds":
          result = Math.floor(diffMs / 1000);
          break;
        case "minutes":
          result = Math.floor(diffMs / (1000 * 60));
          break;
        case "hours":
          result = Math.floor(diffMs / (1000 * 60 * 60));
          break;
        case "days":
        default:
          result = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          break;
      }

      return {
        success: true,
        result: `${result} ${unit}`,
        metadata: {
          difference: result,
          unit,
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

export const dateCompareTool: Tool = {
  name: "date_compare",
  description: "Compare two dates",
  category: "datetime",
  parameters: [
    {
      name: "date1",
      type: "string",
      description: "First date",
      required: true,
    },
    {
      name: "date2",
      type: "string",
      description: "Second date",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { date1, date2 } = params;

      const d1 = new Date(date1);
      const d2 = new Date(date2);

      let result: string;
      if (d1.getTime() === d2.getTime()) {
        result = "equal";
      } else if (d1.getTime() < d2.getTime()) {
        result = "date1 is earlier";
      } else {
        result = "date1 is later";
      }

      return {
        success: true,
        result,
        metadata: {
          date1: d1.toISOString(),
          date2: d2.toISOString(),
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

export const dateIsWeekendTool: Tool = {
  name: "date_is_weekend",
  description: "Check if date is weekend",
  category: "datetime",
  parameters: [
    {
      name: "date",
      type: "string",
      description: "Date string",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { date } = params;

      const d = new Date(date);
      const day = d.getDay();
      const isWeekend = day === 0 || day === 6;

      return {
        success: true,
        result: isWeekend ? "Yes" : "No",
        metadata: {
          is_weekend: isWeekend,
          day_of_week: day,
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

export const dateGetDayOfWeekTool: Tool = {
  name: "date_get_day_of_week",
  description: "Get day of week from date",
  category: "datetime",
  parameters: [
    {
      name: "date",
      type: "string",
      description: "Date string",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { date } = params;

      const d = new Date(date);
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      const dayName = days[d.getDay()];

      return {
        success: true,
        result: dayName,
        metadata: {
          day_index: d.getDay(),
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

export const dateGetMonthTool: Tool = {
  name: "date_get_month",
  description: "Get month name from date",
  category: "datetime",
  parameters: [
    {
      name: "date",
      type: "string",
      description: "Date string",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { date } = params;

      const d = new Date(date);
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const monthName = months[d.getMonth()];

      return {
        success: true,
        result: monthName,
        metadata: {
          month_index: d.getMonth() + 1,
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

export const timestampToDateTool: Tool = {
  name: "timestamp_to_date",
  description: "Convert Unix timestamp to date",
  category: "datetime",
  parameters: [
    {
      name: "timestamp",
      type: "number",
      description: "Unix timestamp (seconds)",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { timestamp } = params;

      const d = new Date(timestamp * 1000);

      return {
        success: true,
        result: d.toISOString(),
        metadata: {
          timestamp,
          readable: d.toLocaleString(),
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

export const dateToTimestampTool: Tool = {
  name: "date_to_timestamp",
  description: "Convert date to Unix timestamp",
  category: "datetime",
  parameters: [
    {
      name: "date",
      type: "string",
      description: "Date string",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { date } = params;

      const d = new Date(date);
      const timestamp = Math.floor(d.getTime() / 1000);

      return {
        success: true,
        result: timestamp.toString(),
        metadata: {
          timestamp,
          iso: d.toISOString(),
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

export const dateStartOfDayTool: Tool = {
  name: "date_start_of_day",
  description: "Get start of day (00:00:00)",
  category: "datetime",
  parameters: [
    {
      name: "date",
      type: "string",
      description: "Date string",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { date } = params;

      const d = new Date(date);
      d.setHours(0, 0, 0, 0);

      return {
        success: true,
        result: d.toISOString(),
        metadata: {
          timestamp: d.getTime(),
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

export const dateEndOfDayTool: Tool = {
  name: "date_end_of_day",
  description: "Get end of day (23:59:59)",
  category: "datetime",
  parameters: [
    {
      name: "date",
      type: "string",
      description: "Date string",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { date } = params;

      const d = new Date(date);
      d.setHours(23, 59, 59, 999);

      return {
        success: true,
        result: d.toISOString(),
        metadata: {
          timestamp: d.getTime(),
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
