/**
 * Memory File System
 * 
 * Inspired by Claude's memory files that automatically:
 * - Retain important information across conversations
 * - Build knowledge graphs
 * - Update memories based on new information
 * - Retrieve relevant memories for context
 * 
 * Memory files are separate from conversation summaries and provide
 * structured, long-term knowledge retention.
 */

import { invokeLLM } from '../_core/llm';
import type { Message } from '../_core/llm';
import { getDb } from '../db';
import { memoryEntries } from '../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface MemoryFile {
  id: string;
  userId: number;
  type: 'fact' | 'preference' | 'skill' | 'context' | 'summary';
  key: string;
  value: string;
  metadata: Record<string, any>;
  importance: number;
  createdAt: Date;
  lastAccessedAt: Date;
  accessCount: number;
}

export interface MemoryUpdate {
  action: 'create' | 'update' | 'merge';
  type: 'fact' | 'preference' | 'skill' | 'context' | 'summary';
  key: string;
  value: string;
  reasoning: string;
  importance?: number;
}

export class MemoryFileSystem {
  /**
   * Analyze conversation and extract memories
   */
  async analyzeConversation(
    userId: number,
    messages: Message[]
  ): Promise<MemoryUpdate[]> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: `You are a memory extraction assistant. Analyze the conversation and identify information worth remembering long-term. Respond with JSON:
{
  "memories": [
    {
      "action": "create" | "update" | "merge",
      "type": "fact" | "preference" | "skill" | "context" | "summary",
      "key": "Brief key/identifier",
      "value": "Detailed value to remember",
      "importance": 5,
      "reasoning": "Why this is worth remembering"
    }
  ]
}

Extract memories for:
- User preferences and settings
- Important facts and information
- Skills and expertise
- Project details and context
- Relationships and connections
- Goals and objectives

Only extract information that:
- Is likely to be useful in future conversations
- Is factual and verifiable
- Represents lasting knowledge, not temporary state`,
          },
          ...messages.slice(-10), // Last 10 messages for context
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'memory_extraction',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                memories: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      action: {
                        type: 'string',
                        enum: ['create', 'update', 'merge'],
                      },
                      type: {
                        type: 'string',
                        enum: ['fact', 'preference', 'skill', 'context', 'summary'],
                      },
                      key: { type: 'string' },
                      value: { type: 'string' },
                      importance: { type: 'number' },
                      reasoning: { type: 'string' },
                    },
                    required: ['action', 'type', 'key', 'value', 'reasoning'],
                    additionalProperties: false,
                  },
                },
              },
              required: ['memories'],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return [];
      }

      const textContent = typeof content === 'string' ? content : '';
      const result = JSON.parse(textContent);
      return result.memories;
    } catch (error) {
      console.error('[MemoryFiles] Failed to analyze conversation:', error);
      return [];
    }
  }

  /**
   * Create or update memory file
   */
  async saveMemory(
    userId: number,
    update: MemoryUpdate
  ): Promise<MemoryFile> {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      // Check if similar memory exists
      const existing = await db
        .select()
        .from(memoryEntries)
        .where(
          and(
            eq(memoryEntries.userId, userId),
            eq(memoryEntries.type, update.type),
            eq(memoryEntries.key, update.key)
          )
        )
        .limit(1);

      if (existing.length > 0 && update.action === 'update') {
        // Update existing memory
        await db
          .update(memoryEntries)
          .set({
            value: update.value,
            lastAccessedAt: new Date(),
            accessCount: existing[0].accessCount + 1,
          })
          .where(eq(memoryEntries.id, existing[0].id));

        return {
          id: existing[0].id.toString(),
          userId,
          type: update.type,
          key: update.key,
          value: update.value,
          metadata: existing[0].metadata as Record<string, any>,
          importance: existing[0].importance,
          createdAt: existing[0].createdAt,
          lastAccessedAt: new Date(),
          accessCount: existing[0].accessCount + 1,
        };
      } else if (existing.length > 0 && update.action === 'merge') {
        // Merge with existing memory
        const merged = await this.mergeMemories(
          existing[0].value,
          update.value
        );

        await db
          .update(memoryEntries)
          .set({
            value: merged,
            lastAccessedAt: new Date(),
            accessCount: existing[0].accessCount + 1,
          })
          .where(eq(memoryEntries.id, existing[0].id));

        return {
          id: existing[0].id.toString(),
          userId,
          type: update.type,
          key: update.key,
          value: merged,
          metadata: existing[0].metadata as Record<string, any>,
          importance: existing[0].importance,
          createdAt: existing[0].createdAt,
          lastAccessedAt: new Date(),
          accessCount: existing[0].accessCount + 1,
        };
      } else {
        // Create new memory
        const result = await db
          .insert(memoryEntries)
          .values({
            userId,
            type: update.type,
            key: update.key,
            value: update.value,
            metadata: {},
            importance: update.importance || 5,
          });

        return {
          id: result[0].insertId.toString(),
          userId,
          type: update.type,
          key: update.key,
          value: update.value,
          metadata: {},
          importance: update.importance || 5,
          createdAt: new Date(),
          lastAccessedAt: new Date(),
          accessCount: 0,
        };
      }
    } catch (error) {
      console.error('[MemoryFiles] Failed to save memory:', error);
      throw error;
    }
  }

  /**
   * Merge two memory contents
   */
  private async mergeMemories(
    existing: string,
    newContent: string
  ): Promise<string> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: `You are a memory merging assistant. Combine two pieces of information into a single, coherent memory. Preserve all important details from both.`,
          },
          {
            role: 'user',
            content: `Existing memory:\n${existing}\n\nNew information:\n${newContent}\n\nMerge these into a single, comprehensive memory.`,
          },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return existing + '\n\n' + newContent;
      }

      return typeof content === 'string' ? content : existing + '\n\n' + newContent;
    } catch (error) {
      console.error('[MemoryFiles] Failed to merge memories:', error);
      return existing + '\n\n' + newContent;
    }
  }

  /**
   * Retrieve relevant memories for context
   */
  async retrieveMemories(
    userId: number,
    query: string,
    limit: number = 5
  ): Promise<MemoryFile[]> {
    const db = await getDb();
    if (!db) {
      return [];
    }

    try {
      // Get all user memories
      const allMemories = await db
        .select()
        .from(memoryEntries)
        .where(eq(memoryEntries.userId, userId))
        .orderBy(desc(memoryEntries.lastAccessedAt));

      // Rank memories by relevance using LLM
      const ranked = await this.rankMemoriesByRelevance(
        allMemories.map(m => ({
          id: m.id.toString(),
          userId: m.userId,
          type: m.type,
          key: m.key,
          value: m.value,
          metadata: m.metadata as Record<string, any>,
          importance: m.importance,
          createdAt: m.createdAt,
          lastAccessedAt: m.lastAccessedAt,
          accessCount: m.accessCount,
        })),
        query
      );

      return ranked.slice(0, limit);
    } catch (error) {
      console.error('[MemoryFiles] Failed to retrieve memories:', error);
      return [];
    }
  }

  /**
   * Rank memories by relevance to query
   */
  private async rankMemoriesByRelevance(
    memories: MemoryFile[],
    query: string
  ): Promise<MemoryFile[]> {
    if (memories.length === 0) {
      return [];
    }

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: `You are a memory ranking assistant. Given a query and a list of memories, rank them by relevance. Respond with JSON:
{
  "rankedIds": ["id1", "id2", "id3", ...]
}

Rank memories by:
- Direct relevance to query
- Contextual importance
- Recency (prefer recent if equally relevant)`,
          },
          {
            role: 'user',
            content: `Query: ${query}\n\nMemories:\n${memories.map(m => `ID: ${m.id}\nKey: ${m.key}\nValue: ${m.value.slice(0, 200)}...\n`).join('\n')}`,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'memory_ranking',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                rankedIds: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              required: ['rankedIds'],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return memories;
      }

      const textContent = typeof content === 'string' ? content : '';
      const result = JSON.parse(textContent);

      // Reorder memories based on ranking
      const ranked: MemoryFile[] = [];
      for (const id of result.rankedIds) {
        const memory = memories.find(m => m.id === id);
        if (memory) {
          ranked.push(memory);
        }
      }

      // Add any memories not in ranking
      for (const memory of memories) {
        if (!ranked.find(m => m.id === memory.id)) {
          ranked.push(memory);
        }
      }

      return ranked;
    } catch (error) {
      console.error('[MemoryFiles] Failed to rank memories:', error);
      return memories;
    }
  }

  /**
   * Get memories by type
   */
  async getMemoriesByType(
    userId: number,
    type: 'fact' | 'preference' | 'skill' | 'context' | 'summary'
  ): Promise<MemoryFile[]> {
    const db = await getDb();
    if (!db) {
      return [];
    }

    try {
      const results = await db
        .select()
        .from(memoryEntries)
        .where(
          and(
            eq(memoryEntries.userId, userId),
            eq(memoryEntries.type, type)
          )
        )
        .orderBy(desc(memoryEntries.lastAccessedAt));

      return results.map(m => ({
        id: m.id.toString(),
        userId: m.userId,
        type: m.type,
        key: m.key,
        value: m.value,
        metadata: m.metadata as Record<string, any>,
        importance: m.importance,
        createdAt: m.createdAt,
        lastAccessedAt: m.lastAccessedAt,
        accessCount: m.accessCount,
      }));
    } catch (error) {
      console.error('[MemoryFiles] Failed to get memories by type:', error);
      return [];
    }
  }

  /**
   * Delete memory
   */
  async deleteMemory(userId: number, memoryId: string): Promise<void> {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      await db
        .delete(memoryEntries)
        .where(
          and(
            eq(memoryEntries.id, parseInt(memoryId)),
            eq(memoryEntries.userId, userId)
          )
        );
    } catch (error) {
      console.error('[MemoryFiles] Failed to delete memory:', error);
      throw error;
    }
  }

  /**
   * Get memory statistics
   */
  async getStatistics(userId: number): Promise<{
    total: number;
    byType: Record<string, number>;
    recentlyAccessed: number;
  }> {
    const db = await getDb();
    if (!db) {
      return { total: 0, byType: {}, recentlyAccessed: 0 };
    }

    try {
      const memories = await db
        .select()
        .from(memoryEntries)
        .where(eq(memoryEntries.userId, userId));

      const byType: Record<string, number> = {};
      let recentlyAccessed = 0;
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      for (const memory of memories) {
        byType[memory.type] = (byType[memory.type] || 0) + 1;
        if (memory.lastAccessedAt > oneDayAgo) {
          recentlyAccessed++;
        }
      }

      return {
        total: memories.length,
        byType,
        recentlyAccessed,
      };
    } catch (error) {
      console.error('[MemoryFiles] Failed to get statistics:', error);
      return { total: 0, byType: {}, recentlyAccessed: 0 };
    }
  }
}

// Singleton instance
export const memoryFileSystem = new MemoryFileSystem();
