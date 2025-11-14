/**
 * Memory and Context Persistence System
 * Manages long-term memory, user preferences, and conversation context
 */

import { getDb } from "../db";
import { sql } from "drizzle-orm";

export interface MemoryEntry {
  id?: number;
  userId: number;
  sessionId?: number;
  type: "fact" | "preference" | "skill" | "context" | "summary";
  key: string;
  value: string;
  metadata?: Record<string, any>;
  importance?: number; // 1-10, higher = more important
  createdAt?: Date;
  lastAccessedAt?: Date;
  accessCount?: number;
}

export interface ConversationSummary {
  sessionId: number;
  summary: string;
  keyPoints: string[];
  topics: string[];
  createdAt: Date;
}

export class MemoryManager {
  /**
   * Store a memory entry
   */
  async store(entry: MemoryEntry): Promise<number> {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const result = await db.execute(sql`
      INSERT INTO memory_entries (
        user_id, session_id, type, \`key\`, value, metadata, importance, created_at, last_accessed_at, access_count
      ) VALUES (
        ${entry.userId},
        ${entry.sessionId || null},
        ${entry.type},
        ${entry.key},
        ${entry.value},
        ${JSON.stringify(entry.metadata || {})},
        ${entry.importance || 5},
        NOW(),
        NOW(),
        0
      )
    `);

    return Number((result as any).insertId);
  }

  /**
   * Retrieve memories by user
   */
  async getByUser(
    userId: number,
    type?: MemoryEntry["type"],
    limit: number = 100
  ): Promise<MemoryEntry[]> {
    const db = await getDb();
    if (!db) {
      return [];
    }

    let query;
    if (type) {
      query = sql`
        SELECT * FROM memory_entries
        WHERE user_id = ${userId} AND type = ${type}
        ORDER BY importance DESC, last_accessed_at DESC
        LIMIT ${limit}
      `;
    } else {
      query = sql`
        SELECT * FROM memory_entries
        WHERE user_id = ${userId}
        ORDER BY importance DESC, last_accessed_at DESC
        LIMIT ${limit}
      `;
    }

    const results = await db.execute(query);

    if (!Array.isArray(results)) {
      return [];
    }

    return results.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      sessionId: row.session_id,
      type: row.type,
      key: row.key,
      value: row.value,
      metadata: JSON.parse(row.metadata || "{}"),
      importance: row.importance,
      createdAt: row.created_at,
      lastAccessedAt: row.last_accessed_at,
      accessCount: row.access_count,
    }));
  }

  /**
   * Retrieve memories by session
   */
  async getBySession(sessionId: number): Promise<MemoryEntry[]> {
    const db = await getDb();
    if (!db) {
      return [];
    }

    const results = await db.execute(sql`
      SELECT * FROM memory_entries
      WHERE session_id = ${sessionId}
      ORDER BY created_at ASC
    `);

    if (!Array.isArray(results)) {
      return [];
    }

    return results.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      sessionId: row.session_id,
      type: row.type,
      key: row.key,
      value: row.value,
      metadata: JSON.parse(row.metadata || "{}"),
      importance: row.importance,
      createdAt: row.created_at,
      lastAccessedAt: row.last_accessed_at,
      accessCount: row.access_count,
    }));
  }

  /**
   * Search memories by keyword
   */
  async search(
    userId: number,
    keyword: string,
    limit: number = 50
  ): Promise<MemoryEntry[]> {
    const db = await getDb();
    if (!db) {
      return [];
    }

    const results = await db.execute(sql`
      SELECT * FROM memory_entries
      WHERE user_id = ${userId}
        AND (
          \`key\` LIKE ${`%${keyword}%`}
          OR value LIKE ${`%${keyword}%`}
        )
      ORDER BY importance DESC, last_accessed_at DESC
      LIMIT ${limit}
    `);

    if (!Array.isArray(results)) {
      return [];
    }

    // Update access count
    const ids = results.map((row: any) => row.id);
    if (ids.length > 0) {
      await db.execute(sql`
        UPDATE memory_entries
        SET access_count = access_count + 1, last_accessed_at = NOW()
        WHERE id IN (${sql.join(ids, sql`, `)})
      `);
    }

    return results.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      sessionId: row.session_id,
      type: row.type,
      key: row.key,
      value: row.value,
      metadata: JSON.parse(row.metadata || "{}"),
      importance: row.importance,
      createdAt: row.created_at,
      lastAccessedAt: row.last_accessed_at,
      accessCount: row.access_count,
    }));
  }

  /**
   * Update memory importance
   */
  async updateImportance(id: number, importance: number): Promise<void> {
    const db = await getDb();
    if (!db) {
      return;
    }

    await db.execute(sql`
      UPDATE memory_entries
      SET importance = ${importance}
      WHERE id = ${id}
    `);
  }

  /**
   * Delete a memory
   */
  async delete(id: number): Promise<void> {
    const db = await getDb();
    if (!db) {
      return;
    }

    await db.execute(sql`
      DELETE FROM memory_entries
      WHERE id = ${id}
    `);
  }

  /**
   * Store conversation summary
   */
  async storeSummary(summary: ConversationSummary): Promise<void> {
    const db = await getDb();
    if (!db) {
      return;
    }

    await db.execute(sql`
      INSERT INTO conversation_summaries (
        session_id, summary, key_points, topics, created_at
      ) VALUES (
        ${summary.sessionId},
        ${summary.summary},
        ${JSON.stringify(summary.keyPoints)},
        ${JSON.stringify(summary.topics)},
        NOW()
      )
      ON DUPLICATE KEY UPDATE
        summary = VALUES(summary),
        key_points = VALUES(key_points),
        topics = VALUES(topics)
    `);
  }

  /**
   * Get conversation summary
   */
  async getSummary(sessionId: number): Promise<ConversationSummary | null> {
    const db = await getDb();
    if (!db) {
      return null;
    }

    const results = await db.execute(sql`
      SELECT * FROM conversation_summaries
      WHERE session_id = ${sessionId}
    `);

    if (!Array.isArray(results) || results.length < 1) {
      return null;
    }

    const row = results[0] as any;
    return {
      sessionId: row.session_id,
      summary: row.summary,
      keyPoints: JSON.parse(row.key_points || "[]"),
      topics: JSON.parse(row.topics || "[]"),
      createdAt: row.created_at,
    };
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId: number): Promise<Record<string, string>> {
    const memories = await this.getByUser(userId, "preference");
    const preferences: Record<string, string> = {};

    for (const memory of memories) {
      preferences[memory.key] = memory.value;
    }

    return preferences;
  }

  /**
   * Set user preference
   */
  async setPreference(
    userId: number,
    key: string,
    value: string
  ): Promise<void> {
    await this.store({
      userId,
      type: "preference",
      key,
      value,
      importance: 8,
    });
  }

  /**
   * Get relevant context for a conversation
   */
  async getRelevantContext(
    userId: number,
    sessionId: number,
    keywords: string[],
    limit: number = 10
  ): Promise<MemoryEntry[]> {
    const db = await getDb();
    if (!db) {
      return [];
    }

    // Build search query with keywords
    const keywordConditions = keywords.map(
      (keyword) => sql`(\`key\` LIKE ${`%${keyword}%`} OR value LIKE ${`%${keyword}%`})`
    );

    const results = await db.execute(sql`
      SELECT * FROM memory_entries
      WHERE user_id = ${userId}
        AND session_id != ${sessionId}
        AND (${sql.join(keywordConditions, sql` OR `)})
      ORDER BY importance DESC, last_accessed_at DESC
      LIMIT ${limit}
    `);

    if (!Array.isArray(results)) {
      return [];
    }

    // Update access count
    const ids = results.map((row: any) => row.id);
    if (ids.length > 0) {
      await db.execute(sql`
        UPDATE memory_entries
        SET access_count = access_count + 1, last_accessed_at = NOW()
        WHERE id IN (${sql.join(ids, sql`, `)})
      `);
    }

    return results.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      sessionId: row.session_id,
      type: row.type,
      key: row.key,
      value: row.value,
      metadata: JSON.parse(row.metadata || "{}"),
      importance: row.importance,
      createdAt: row.created_at,
      lastAccessedAt: row.last_accessed_at,
      accessCount: row.access_count,
    }));
  }

  /**
   * Cleanup old, low-importance memories
   */
  async cleanup(userId: number, daysOld: number = 30): Promise<number> {
    const db = await getDb();
    if (!db) {
      return 0;
    }

    const result = await db.execute(sql`
      DELETE FROM memory_entries
      WHERE user_id = ${userId}
        AND importance < 5
        AND access_count < 3
        AND created_at < DATE_SUB(NOW(), INTERVAL ${daysOld} DAY)
    `);

    return Number((result as any).affectedRows || 0);
  }
}
