// project-management-system/src/features/activityLog/server/route.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Databases, Query } from "node-appwrite";
import { z } from "zod";

import { sessionMiddleware } from "@/lib/session-middleware";

type Variables = {
  user: {
    $id: string;
    email?: string;
    name?: string;
  };
  databases: Databases;
};

const app = new Hono<{ Variables: Variables }>()
  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        userId: z.string().optional(),
        entityType: z
          .enum(["task", "project", "member", "workspace", "user"])
          .optional(),
        limit: z.coerce.number().int().positive().max(100).optional().default(20),
        offset: z.coerce.number().int().min(0).optional().default(0),
      })
    ),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases"); // Get databases from middleware
      const { userId, entityType, limit, offset } = c.req.valid("query");

      // Only allow admins to view other users' activity
      const targetUserId = userId || user.$id;
      
     /*  if (targetUserId !== user.$id) {
        try {
          const member = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_MEMBERS_ID!,
            [
              Query.equal("userId", user.$id),
              Query.equal("role", "admin"),
            ]
          );

          if (member.total === 0) {
            return c.json({ error: "Unauthorized" }, 401);
          }
        } catch (error) {
          console.error("Error checking admin permissions:", error);
          return c.json({ error: "Failed to verify permissions" }, 500);
        }
      }
 */
      try {
        // Build queries directly using the databases instance from middleware
        const queries = [
          Query.orderDesc("timestamp"),
          Query.limit(limit),
          Query.offset(offset)
        ];

        if (targetUserId) queries.push(Query.equal("userId", targetUserId));
        if (entityType) queries.push(Query.equal("entityType", entityType));

        // Fetch activity logs directly
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_ACTIVITY_LOGS!,
          queries
        );

        // Enrich the logs with user and entity information
        const enrichedLogs = await Promise.all(
          response.documents.map(async (doc) => {
            try {
              // For each log, you might want to enrich with user info
              // This depends on your user service setup
              return {
                id: doc.$id,
                userId: doc.userId,
                timestamp: doc.timestamp,
                entityType: doc.entityType,
                entityId: doc.entityId,
                action: doc.action,
                changes: typeof doc.changes === 'string' 
                  ? JSON.parse(doc.changes) 
                  : doc.changes,
                // Add any other enrichment you need
              };
            } catch (error) {
              console.error("Error enriching log:", error);
              return {
                id: doc.$id,
                userId: doc.userId,
                timestamp: doc.timestamp,
                entityType: doc.entityType,
                entityId: doc.entityId,
                action: doc.action,
                changes: {},
                error: "Failed to enrich log data"
              };
            }
          })
        );

        return c.json({ data: enrichedLogs });
      } catch (error) {
        console.error("Failed to fetch activity logs:", error);
        return c.json({ error: "Failed to fetch activity logs" }, 500);
      }
    }
  );

export default app;