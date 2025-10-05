// src/lib/activityLog.ts
import { ID, Query, Models, Databases, Users } from "node-appwrite";
import { createAdminClient } from "./appwrite";

export interface ActivityLogEntry {
  userId: string;
  timestamp?: string;
  entityType: "task" | "project" | "member" | "workspace" | "user";
  entityId: string;
  action: "create" | "update" | "delete" | "comment" | "login" | "logout" | string;
  changes: string;
}

export interface EnrichedActivityLog extends Models.Document {
  userId: string;
  userEmail: string;
  userName: string;
  timestamp: string;
  entityType: string;
  entityId: string;
  entityName: string;
  action: string;
  changes: Record<string, unknown>;
}

async function getEntityName(
  entityType: string,
  entityId: string,
  databases: Databases,
  users: Users,
  databaseId: string
): Promise<string> {
  try {
    switch (entityType) {
      case 'task':
        const task = await databases.getDocument(
          databaseId,
          process.env.NEXT_PUBLIC_APPWRITE_TASKS_ID!,
          entityId
        ).catch(() => null);
        return task?.name || 'Deleted Task';
      
      case 'project':
        const project = await databases.getDocument(
          databaseId,
          process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_ID!,
          entityId
        ).catch(() => null);
        return project?.name || 'Deleted Project';
      
      case 'member':
        const member = await databases.getDocument(
          databaseId,
          process.env.NEXT_PUBLIC_APPWRITE_MEMBERS_ID!,
          entityId
        ).catch(() => null);
        
        if (!member) return 'Deleted Member';
        
        try {
          const memberUser = await users.get(member.userId);
          return memberUser.name || memberUser.email || 'Unknown User';
        } catch (userError) {
          console.error(`Error fetching user ${member.userId}:`, userError);
          return 'Deleted User';
        }
      
      case 'workspace':
        const workspace = await databases.getDocument(
          databaseId,
          process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID!,
          entityId
        ).catch(() => null);
        return workspace?.name || 'Deleted Workspace';
      
      case 'user':
        try {
          const user = await users.get(entityId);
          return user.name || user.email || 'Unknown User';
        } catch (error) {
          console.error(`Error fetching user ${entityId}:`, error);
          return 'Deleted User';
        }
      
      default:
        return 'Unknown Entity';
    }
  } catch (error) {
    console.error(`Error fetching ${entityType} name:`, error);
    return 'Deleted Entity';
  }
}

// lib/activityLog.ts
export async function addActivityLog(
  databases: Databases, // Accept databases as parameter
  entry: ActivityLogEntry
) {
  try {
    const collectionId = process.env.NEXT_PUBLIC_APPWRITE_ACTIVITY_LOGS ?? "activityLogs";
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? "default";

    const timestamp = entry.timestamp || new Date().toISOString();

    return await databases.createDocument(
      databaseId,
      collectionId,
      ID.unique(),
      {
        userId: entry.userId,
        timestamp,
        entityType: entry.entityType,
        entityId: entry.entityId,
        action: entry.action,
        changes: entry.changes,
      }
    );
  } catch (error) {
    console.error("Failed to create activity log:", error);
    throw error;
  }
}
export async function getActivityLogs(filter?: { 
  userId?: string;
  entityType?: "task" | "project" | "member" | "workspace" | "user";
  limit?: number;
  offset?: number;
}): Promise<EnrichedActivityLog[]> {
  try {
    const { databases, users } = await createAdminClient();
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? "default";
    const collectionId = process.env.NEXT_PUBLIC_APPWRITE_ACTIVITYLOGS_ID ?? "activityLogs";

    const queries = [
      Query.orderDesc("timestamp"),
      Query.limit(filter?.limit || 20),
      Query.offset(filter?.offset || 0)
    ];

    if (filter?.userId) queries.push(Query.equal("userId", filter.userId));
    if (filter?.entityType) queries.push(Query.equal("entityType", filter.entityType));

    const response = await databases.listDocuments(databaseId, collectionId, queries);

    return await Promise.all(response.documents.map(async (doc) => {
      try {
        const [user, entityName] = await Promise.all([
          users.get(doc.userId),
          getEntityName(doc.entityType, doc.entityId, databases, users, databaseId)
        ]);

        return {
          ...doc,
          userEmail: user.email,
          userName: user.name || user.email,
          entityName,
          changes: JSON.parse(doc.changes as string)
        } as EnrichedActivityLog;

      } catch (error) {
        console.error("Error enriching log data:", error);
        const entityName = await getEntityName(doc.entityType, doc.entityId, databases, users, databaseId)
          .catch(() => "Deleted Entity");
        
        return {
          ...doc,
          userEmail: "unknown@example.com",
          userName: "Deleted User",
          entityName,
          changes: JSON.parse(doc.changes as string)
        } as EnrichedActivityLog;
      }
    }));
  } catch (error) {
    console.error("Failed to fetch activity logs:", error);
    throw error;
  }
}