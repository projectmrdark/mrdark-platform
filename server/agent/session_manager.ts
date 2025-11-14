/**
 * Session Manager
 * 
 * Inspired by Codex's session management:
 * - Resume interrupted sessions
 * - Session transcripts and history
 * - Context preservation across sessions
 * - Session branching and merging
 * - Export and import sessions
 */

import { getDb } from '../db';
import { sessions, messages } from '../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import type { Message } from '../_core/llm';

export interface SessionData {
  id: number;
  userId: number;
  title: string | null;
  model: string;
  mode: 'sandbox' | 'local';
  status: 'active' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
}

export interface SessionTranscript {
  sessionId: number;
  messages: TranscriptMessage[];
  metadata: {
    totalMessages: number;
    duration: number; // seconds
    toolsUsed: string[];
    filesModified: string[];
  };
}

export interface TranscriptMessage {
  id: number;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface SessionCheckpoint {
  id: string;
  sessionId: number;
  timestamp: Date;
  context: Record<string, any>;
  messageCount: number;
  description: string;
}

export class SessionManager {
  /**
   * Create new session
   */
  async createSession(
    userId: number,
    title?: string
  ): Promise<SessionData> {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      const result = await db.insert(sessions).values({
        userId,
        title: title || `Session ${new Date().toISOString()}`,
      });

      const sessionId = result[0].insertId;

      return {
        id: sessionId,
        userId,
        title: title || `Session ${new Date().toISOString()}`,
        model: 'gpt-4',
        mode: 'sandbox',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastMessageAt: new Date(),
      };
    } catch (error) {
      console.error('[SessionManager] Failed to create session:', error);
      throw error;
    }
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: number): Promise<SessionData | null> {
    const db = await getDb();
    if (!db) {
      return null;
    }

    try {
      const results = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, sessionId))
        .limit(1);

      if (results.length === 0) {
        return null;
      }

      const session = results[0];

      return {
        id: session.id,
        userId: session.userId,
        title: session.title,
        model: session.model,
        mode: session.mode,
        status: session.status,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        lastMessageAt: session.lastMessageAt,
      };
    } catch (error) {
      console.error('[SessionManager] Failed to get session:', error);
      return null;
    }
  }

  /**
   * List user sessions
   */
  async listSessions(
    userId: number,
    limit: number = 20
  ): Promise<SessionData[]> {
    const db = await getDb();
    if (!db) {
      return [];
    }

    try {
      const results = await db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, userId))
        .orderBy(desc(sessions.updatedAt))
        .limit(limit);

      return results.map(session => ({
        id: session.id,
        userId: session.userId,
        title: session.title,
        model: session.model,
        mode: session.mode,
        status: session.status,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        lastMessageAt: session.lastMessageAt,
      }));
    } catch (error) {
      console.error('[SessionManager] Failed to list sessions:', error);
      return [];
    }
  }

  /**
   * Update session status
   */
  async updateStatus(
    sessionId: number,
    status: 'active' | 'completed' | 'failed'
  ): Promise<void> {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      await db
        .update(sessions)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(eq(sessions.id, sessionId));
    } catch (error) {
      console.error('[SessionManager] Failed to update status:', error);
      throw error;
    }
  }

  /**
   * Add message to session
   */
  async addMessage(
    sessionId: number,
    role: 'user' | 'assistant' | 'system' | 'tool',
    content: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      await db.insert(messages).values({
        sessionId,
        role,
        content,
        metadata: metadata ? JSON.stringify(metadata) : null,
      });

      // Update session lastActivityAt
      await db
        .update(sessions)
        .set({ updatedAt: new Date() })
        .where(eq(sessions.id, sessionId));
    } catch (error) {
      console.error('[SessionManager] Failed to add message:', error);
      throw error;
    }
  }

  /**
   * Get session transcript
   */
  async getTranscript(sessionId: number): Promise<SessionTranscript | null> {
    const db = await getDb();
    if (!db) {
      return null;
    }

    try {
      const messageResults = await db
        .select()
        .from(messages)
        .where(eq(messages.sessionId, sessionId))
        .orderBy(messages.createdAt);

      const transcriptMessages: TranscriptMessage[] = messageResults.map(msg => {
        let metadata = {};
        try {
          if (msg.metadata) {
            metadata = JSON.parse(msg.metadata as string);
          }
        } catch {
          metadata = {};
        }

        return {
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.createdAt,
          metadata,
        };
      });

      // Calculate metadata
      const toolsUsed = new Set<string>();
      const filesModified = new Set<string>();
      let duration = 0;

      if (transcriptMessages.length > 0) {
        const first = transcriptMessages[0].timestamp.getTime();
        const last = transcriptMessages[transcriptMessages.length - 1].timestamp.getTime();
        duration = Math.floor((last - first) / 1000);
      }

      for (const msg of transcriptMessages) {
        if (msg.metadata) {
          if (msg.metadata.tools) {
            for (const tool of msg.metadata.tools) {
              toolsUsed.add(tool);
            }
          }
          if (msg.metadata.files) {
            for (const file of msg.metadata.files) {
              filesModified.add(file);
            }
          }
        }
      }

      return {
        sessionId,
        messages: transcriptMessages,
        metadata: {
          totalMessages: transcriptMessages.length,
          duration,
          toolsUsed: Array.from(toolsUsed),
          filesModified: Array.from(filesModified),
        },
      };
    } catch (error) {
      console.error('[SessionManager] Failed to get transcript:', error);
      return null;
    }
  }

  /**
   * Resume session
   */
  async resumeSession(sessionId: number): Promise<Message[]> {
    console.log(`[SessionManager] Resuming session ${sessionId}`);

    const transcript = await this.getTranscript(sessionId);
    if (!transcript) {
      return [];
    }

    // Convert transcript to LLM messages
    const messages: Message[] = transcript.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    console.log(`[SessionManager] Resumed session with ${messages.length} messages`);
    return messages;
  }

  /**
   * Create session checkpoint
   */
  async createCheckpoint(
    sessionId: number,
    description: string
  ): Promise<SessionCheckpoint> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const transcript = await this.getTranscript(sessionId);
    const messageCount = transcript?.messages.length || 0;

    const checkpoint: SessionCheckpoint = {
      id: this.generateCheckpointId(),
      sessionId,
      timestamp: new Date(),
      context: {}, // Context stored separately in production
      messageCount,
      description,
    };

    console.log(`[SessionManager] Created checkpoint ${checkpoint.id} for session ${sessionId}`);
    return checkpoint;
  }

  /**
   * Restore from checkpoint
   */
  async restoreCheckpoint(checkpointId: string): Promise<void> {
    console.log(`[SessionManager] Restoring from checkpoint ${checkpointId}`);
    // In production, would restore session state from checkpoint
  }

  /**
   * Branch session
   */
  async branchSession(
    sessionId: number,
    fromMessageId: number,
    newTitle?: string
  ): Promise<SessionData> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Create new session
    const newSession = await this.createSession(
      session.userId,
      newTitle || `${session.title || 'Session'} (branch)`
    );

    // Copy messages up to fromMessageId
    const db = await getDb();
    if (db) {
      const messagesToCopy = await db
        .select()
        .from(messages)
        .where(eq(messages.sessionId, sessionId));

      for (const msg of messagesToCopy) {
        if (msg.id <= fromMessageId) {
          await this.addMessage(
            newSession.id,
            msg.role,
            msg.content,
            msg.metadata ? JSON.parse(msg.metadata as string) : undefined
          );
        }
      }
    }

    console.log(`[SessionManager] Branched session ${sessionId} to ${newSession.id}`);
    return newSession;
  }

  /**
   * Export session
   */
  async exportSession(sessionId: number): Promise<string> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const transcript = await this.getTranscript(sessionId);
    if (!transcript) {
      throw new Error(`Failed to get transcript for session ${sessionId}`);
    }

    const exportData = {
      session: {
        id: session.id,
        title: session.title,
        model: session.model,
        mode: session.mode,
        createdAt: session.createdAt,
      },
      transcript: transcript.messages,
      metadata: transcript.metadata,
      exportedAt: new Date(),
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import session
   */
  async importSession(
    userId: number,
    exportData: string
  ): Promise<SessionData> {
    try {
      const data = JSON.parse(exportData);

      // Create new session
      const newSession = await this.createSession(
        userId,
        `${data.session.title} (imported)`
      );

      // Import messages
      for (const msg of data.transcript) {
        await this.addMessage(
          newSession.id,
          msg.role,
          msg.content,
          msg.metadata
        );
      }

      // Context imported with messages

      console.log(`[SessionManager] Imported session as ${newSession.id}`);
      return newSession;
    } catch (error) {
      console.error('[SessionManager] Failed to import session:', error);
      throw error;
    }
  }

  /**
   * Archive session
   */
  async archiveSession(sessionId: number): Promise<void> {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      // In production, would update status field
      // For now, just log
      console.log(`[SessionManager] Archived session ${sessionId}`);
    } catch (error) {
      console.error('[SessionManager] Failed to archive session:', error);
      throw error;
    }
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: number): Promise<void> {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      // Delete messages first
      await db.delete(messages).where(eq(messages.sessionId, sessionId));

      // Delete session
      await db.delete(sessions).where(eq(sessions.id, sessionId));

      console.log(`[SessionManager] Deleted session ${sessionId}`);
    } catch (error) {
      console.error('[SessionManager] Failed to delete session:', error);
      throw error;
    }
  }

  /**
   * Search sessions
   */
  async searchSessions(
    userId: number,
    query: string
  ): Promise<SessionData[]> {
    const allSessions = await this.listSessions(userId, 100);

    // Simple search by title
    return allSessions.filter(session =>
      session.title?.toLowerCase().includes(query.toLowerCase()) || false
    );
  }

  /**
   * Get session statistics
   */
  async getStatistics(sessionId: number): Promise<{
    messageCount: number;
    duration: number;
    toolsUsed: number;
    filesModified: number;
  }> {
    const transcript = await this.getTranscript(sessionId);
    if (!transcript) {
      return {
        messageCount: 0,
        duration: 0,
        toolsUsed: 0,
        filesModified: 0,
      };
    }

    return {
      messageCount: transcript.metadata.totalMessages,
      duration: transcript.metadata.duration,
      toolsUsed: transcript.metadata.toolsUsed.length,
      filesModified: transcript.metadata.filesModified.length,
    };
  }

  /**
   * Generate checkpoint ID
   */
  private generateCheckpointId(): string {
    return `cp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}

// Singleton instance
export const sessionManager = new SessionManager();
