import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../db";
import { protectedProcedure, router } from "../_core/trpc";
import { users, sessions, messages } from "../../drizzle/schema";
import { eq, desc, count, sql } from "drizzle-orm";

/**
 * Admin-only middleware
 */
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }
  return next({ ctx });
});

export const adminRouter = router({
  /**
   * Get platform statistics
   */
  getStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

    const [totalUsersResult] = await db.select({ count: count() }).from(users);
    const totalUsers = totalUsersResult?.count || 0;

    const [activeUsersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.lastSignedIn} > DATE_SUB(NOW(), INTERVAL 24 HOUR)`);
    const activeUsers = activeUsersResult?.count || 0;

    const [totalSessionsResult] = await db.select({ count: count() }).from(sessions);
    const totalSessions = totalSessionsResult?.count || 0;

    const [activeSessionsResult] = await db
      .select({ count: count() })
      .from(sessions)
      .where(sql`${sessions.updatedAt} > DATE_SUB(NOW(), INTERVAL 1 HOUR)`);
    const activeSessions = activeSessionsResult?.count || 0;

    return {
      totalUsers,
      activeUsers,
      totalSessions,
      activeSessions,
      totalWorkflows: 0, // Placeholder
      runningWorkflows: 0, // Placeholder
    };
  }),

  /**
   * Get all users
   */
  getUsers: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt)).limit(100);
    return allUsers;
  }),

  /**
   * Get active sessions
   */
  getSessions: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

    const activeSessions = await db
      .select({
        id: sessions.id,
        userId: sessions.userId,
        createdAt: sessions.createdAt,
        updatedAt: sessions.updatedAt,
      })
      .from(sessions)
      .orderBy(desc(sessions.updatedAt))
      .limit(50);

    // Get message counts and user names
    const sessionsWithDetails = await Promise.all(
      activeSessions.map(async (session) => {
        const [messageCountResult] = await db
          .select({ count: count() })
          .from(messages)
          .where(eq(messages.sessionId, session.id));

        let userName = 'Anonymous';
        if (session.userId) {
          const [user] = await db
            .select({ name: users.name })
            .from(users)
            .where(eq(users.id, session.userId))
            .limit(1);
          userName = user?.name || 'Anonymous';
        }

        return {
          ...session,
          messageCount: messageCountResult?.count || 0,
          userName,
        };
      })
    );

    return sessionsWithDetails;
  }),

  /**
   * Get workflows
   */
  getWorkflows: adminProcedure.query(async () => {
    // Placeholder - implement when workflow table is ready
    return [];
  }),

  /**
   * Get scheduled tasks
   */
  getScheduledTasks: adminProcedure.query(async () => {
    // Placeholder - implement when scheduled tasks table is ready
    return [];
  }),

  /**
   * Get system health
   */
  getSystemHealth: adminProcedure.query(async () => {
    return {
      status: 'healthy' as const,
      uptime: 99.99,
      metrics: {
        cpu: 45,
        memory: 60,
        requests: 1000000,
        errors: 50,
        connections: 100,
      },
      alerts: [],
    };
  }),

  /**
   * Update user role
   */
  updateUserRole: adminProcedure
    .input(z.object({
      userId: z.number(),
      role: z.enum(['admin', 'user']),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));

      return { success: true };
    }),

  /**
   * Delete user
   */
  deleteUser: adminProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Delete user's sessions and messages first
      const userSessions = await db.select({ id: sessions.id }).from(sessions).where(eq(sessions.userId, input.userId));
      
      for (const session of userSessions) {
        await db.delete(messages).where(eq(messages.sessionId, session.id));
      }
      
      await db.delete(sessions).where(eq(sessions.userId, input.userId));
      await db.delete(users).where(eq(users.id, input.userId));

      return { success: true };
    }),
});
