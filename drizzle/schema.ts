import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * AI Agent sessions - represents a conversation/task session
 */
export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }),
  model: varchar("model", { length: 64 }).notNull().default("gpt-4"),
  mode: mysqlEnum("mode", ["sandbox", "local"]).default("sandbox").notNull(),
  status: mysqlEnum("status", ["active", "completed", "failed"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastMessageAt: timestamp("lastMessageAt").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

/**
 * Messages in a session - stores conversation history
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system", "tool"]).notNull(),
  content: text("content").notNull(),
  toolName: varchar("toolName", { length: 128 }),
  toolCallId: varchar("toolCallId", { length: 128 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Tool executions - tracks all tool calls and their results
 */
export const toolExecutions = mysqlTable("tool_executions", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  messageId: int("messageId"),
  toolName: varchar("toolName", { length: 128 }).notNull(),
  toolCallId: varchar("toolCallId", { length: 128 }).notNull(),
  parameters: json("parameters").notNull(),
  result: json("result"),
  success: boolean("success").notNull(),
  error: text("error"),
  executionTime: int("executionTime"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ToolExecution = typeof toolExecutions.$inferSelect;
export type InsertToolExecution = typeof toolExecutions.$inferInsert;

/**
 * Files uploaded or generated during sessions
 */
export const files = mysqlTable("files", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId"),
  userId: int("userId").notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  url: varchar("url", { length: 1024 }).notNull(),
  mimeType: varchar("mimeType", { length: 128 }),
  size: int("size"),
  type: mysqlEnum("type", ["upload", "generated", "artifact"]).default("upload").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type File = typeof files.$inferSelect;
export type InsertFile = typeof files.$inferInsert;

/**
 * API keys - user-provided API keys for AI models
 */
export const apiKeys = mysqlTable("api_keys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  provider: mysqlEnum("provider", ["openai", "anthropic", "google"]).notNull(),
  keyHash: varchar("keyHash", { length: 128 }).notNull(),
  keyPreview: varchar("keyPreview", { length: 16 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

/**
 * Usage logs - tracks token usage and costs
 */
export const usageLogs = mysqlTable("usage_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sessionId: int("sessionId"),
  model: varchar("model", { length: 64 }).notNull(),
  promptTokens: int("promptTokens").notNull(),
  completionTokens: int("completionTokens").notNull(),
  totalTokens: int("totalTokens").notNull(),
  cost: int("cost"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UsageLog = typeof usageLogs.$inferSelect;
export type InsertUsageLog = typeof usageLogs.$inferInsert;

/**
 * User quotas - tracks monthly token quotas
 */
export const userQuotas = mysqlTable("user_quotas", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  monthlyLimit: int("monthlyLimit").notNull().default(1000000),
  currentUsage: int("currentUsage").notNull().default(0),
  resetAt: timestamp("resetAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserQuota = typeof userQuotas.$inferSelect;
export type InsertUserQuota = typeof userQuotas.$inferInsert;

/**
 * Sandbox instances - tracks active sandbox containers
 */
export const sandboxInstances = mysqlTable("sandbox_instances", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull().unique(),
  containerId: varchar("containerId", { length: 128 }),
  status: mysqlEnum("status", ["creating", "running", "hibernated", "stopped"]).default("creating").notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  port: int("port"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastActiveAt: timestamp("lastActiveAt").defaultNow().notNull(),
  stoppedAt: timestamp("stoppedAt"),
});

export type SandboxInstance = typeof sandboxInstances.$inferSelect;
export type InsertSandboxInstance = typeof sandboxInstances.$inferInsert;
