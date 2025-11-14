import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  sessions,
  messages,
  toolExecutions,
  files,
  apiKeys,
  usageLogs,
  userQuotas,
  sandboxInstances,
  InsertSession,
  InsertMessage,
  InsertToolExecution,
  InsertFile,
  InsertApiKey,
  InsertUsageLog,
  InsertUserQuota,
  InsertSandboxInstance
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ========== USER OPERATIONS ==========

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ========== SESSION OPERATIONS ==========

export async function createSession(session: InsertSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(sessions).values(session);
  return result[0].insertId;
}

export async function getUserSessions(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .orderBy(desc(sessions.lastMessageAt));
}

export async function getSessionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateSession(id: number, updates: Partial<InsertSession>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(sessions).set(updates).where(eq(sessions.id, id));
}

export async function deleteSession(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(sessions).where(eq(sessions.id, id));
}

// ========== MESSAGE OPERATIONS ==========

export async function createMessage(message: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(messages).values(message);
  return result[0].insertId;
}

export async function getSessionMessages(sessionId: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(messages)
    .where(eq(messages.sessionId, sessionId))
    .orderBy(desc(messages.createdAt))
    .limit(limit);
}

// ========== TOOL EXECUTION OPERATIONS ==========

export async function createToolExecution(execution: InsertToolExecution) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(toolExecutions).values(execution);
  return result[0].insertId;
}

export async function getSessionToolExecutions(sessionId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(toolExecutions)
    .where(eq(toolExecutions.sessionId, sessionId))
    .orderBy(desc(toolExecutions.createdAt));
}

// ========== FILE OPERATIONS ==========

export async function createFile(file: InsertFile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(files).values(file);
  return result[0].insertId;
}

export async function getUserFiles(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(files)
    .where(eq(files.userId, userId))
    .orderBy(desc(files.createdAt));
}

export async function getSessionFiles(sessionId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(files)
    .where(eq(files.sessionId, sessionId))
    .orderBy(desc(files.createdAt));
}

export async function getFileById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(files).where(eq(files.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteFile(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(files).where(eq(files.id, id));
}

// ========== API KEY OPERATIONS ==========

export async function createApiKey(apiKey: InsertApiKey) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(apiKeys).values(apiKey);
  return result[0].insertId;
}

export async function getUserApiKeys(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.userId, userId), eq(apiKeys.isActive, true)))
    .orderBy(desc(apiKeys.createdAt));
}

export async function getApiKeyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(apiKeys).where(eq(apiKeys.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deactivateApiKey(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(apiKeys).set({ isActive: false }).where(eq(apiKeys.id, id));
}

export async function deleteApiKey(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(apiKeys).where(eq(apiKeys.id, id));
}

// ========== USAGE LOG OPERATIONS ==========

export async function createUsageLog(log: InsertUsageLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(usageLogs).values(log);
  return result[0].insertId;
}

export async function getUserUsageLogs(userId: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(usageLogs)
    .where(eq(usageLogs.userId, userId))
    .orderBy(desc(usageLogs.createdAt))
    .limit(limit);
}

// ========== USER QUOTA OPERATIONS ==========

export async function getUserQuota(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(userQuotas).where(eq(userQuotas.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUserQuota(quota: InsertUserQuota) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(userQuotas).values(quota);
  return result[0].insertId;
}

export async function updateUserQuota(userId: number, currentUsage: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(userQuotas).set({ currentUsage }).where(eq(userQuotas.userId, userId));
}

export async function incrementUserQuota(userId: number, tokens: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get current quota
  const quota = await getUserQuota(userId);
  if (!quota) {
    // Create new quota if doesn't exist
    const resetAt = new Date();
    resetAt.setMonth(resetAt.getMonth() + 1);
    await createUserQuota({
      userId,
      monthlyLimit: 1000000,
      currentUsage: tokens,
      resetAt,
    });
  } else {
    // Update existing quota
    await updateUserQuota(userId, quota.currentUsage + tokens);
  }
}

// ========== SANDBOX INSTANCE OPERATIONS ==========

export async function createSandboxInstance(instance: InsertSandboxInstance) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(sandboxInstances).values(instance);
  return result[0].insertId;
}

export async function getSandboxBySessionId(sessionId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(sandboxInstances).where(eq(sandboxInstances.sessionId, sessionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateSandboxInstance(sessionId: number, updates: Partial<InsertSandboxInstance>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(sandboxInstances).set(updates).where(eq(sandboxInstances.sessionId, sessionId));
}

export async function deleteSandboxInstance(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(sandboxInstances).where(eq(sandboxInstances.sessionId, sessionId));
}
