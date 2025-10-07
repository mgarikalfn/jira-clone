import z from "zod";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";

import { getMember } from "@/features/members/utils";

import { sessionMiddleware } from "@/lib/session-middleware";
import {
  DATABASE_ID,
  IMAGES_BUCKET_ID,
  MEMBERS_ID,
  PROJECTS_ID,
  TASKS_ID,
  WORKSPACES_ID,
} from "@/config";
import { createProjectSchema, updateProjectSchema } from "../schema";
import { Project } from "../types";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { Task, TaskStatus } from "@/features/tasks/types";
import { createAdminClient } from "@/lib/appwrite";
import { addActivityLog } from "@/lib/activityLog";
import { MemberRole } from "@/features/members/types";

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", z.object({ workspaceId: z.string() })),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");

      const { workspaceId } = c.req.valid("query");
      if (!workspaceId) {
        return c.json({ error: "Missing workspaceId" }, 400);
      }

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "unauthorized" }, 401);
      }

      const projects = await databases.listDocuments<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        [Query.equal("workspaceId", workspaceId), Query.orderDesc("$createdAt")]
      );

      return c.json({ data: projects });
    }
  )

  .get("/:projectId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { projectId } = c.req.param();

    const project = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      projectId
    );

    const member = await getMember({
      databases,
      workspaceId: project.workspaceId,
      userId: user.$id,
    });

    // You can access the role using member.role if member is not null

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    return c.json({ data: project });
  })

  .post(
    "/",
    sessionMiddleware,
    zValidator("form", createProjectSchema),
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      const { name, image, workspaceId } = c.req.valid("form");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "unauthorized" }, 401);
      }

      if (member.role !== MemberRole.ADMIN) {
        return c.json({ error: "unauthorized" }, 401);
      }

      let uploadedImageUrl: string | undefined;

      if (image instanceof File) {
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          image
        );

        // ✅ Store the permanent Appwrite URL instead of a blob/base64
        const fileViewBuffer = await storage.getFileView(
          IMAGES_BUCKET_ID,
          file.$id
        );
        // Convert ArrayBuffer to a base64 string URL (or handle as needed)
        uploadedImageUrl = `data:image/png;base64,${Buffer.from(
          fileViewBuffer
        ).toString("base64")}`;
      }

      const project = await databases.createDocument(
        DATABASE_ID,
        PROJECTS_ID,
        ID.unique(),
        {
          name,
          imageUrl: uploadedImageUrl,
          workspaceId,
        }
      );

      await addActivityLog(databases, {
        userId: user.$id,
        timestamp: new Date().toISOString(),
        entityType: "project",
        entityId: project.$id,
        action: "create",
        changes: JSON.stringify({ name, imageFileId: File }),
      });

      return c.json({ data: project });
    }
  )

  .patch(
    "/:projectId",
    sessionMiddleware,
    zValidator("form", updateProjectSchema),
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      const { projectId } = c.req.param();
      const { name, image } = c.req.valid("form");

      const existingProject = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectId
      );

      const member = await getMember({
        databases,
        workspaceId: existingProject.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "unauthorized" }, 401);
      }

      if (member.role !== MemberRole.ADMIN) {
        return c.json({ error: "unauthorized" }, 401);
      }

      let uploadedImageUrl: string | undefined;

      if (image instanceof File) {
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          image
        );

        // ✅ Store the permanent Appwrite URL instead of a blob/base64
        const fileViewBuffer = await storage.getFileView(
          IMAGES_BUCKET_ID,
          file.$id
        );
        // Convert ArrayBuffer to a base64 string URL (or handle as needed)
        uploadedImageUrl = `data:image/png;base64,${Buffer.from(
          fileViewBuffer
        ).toString("base64")}`;
      }
      const project = await databases.updateDocument(
        DATABASE_ID,
        PROJECTS_ID,
        projectId,
        {
          name,
          imageUrl: uploadedImageUrl,
        }
      );

      await addActivityLog(databases, {
        userId: user.$id,
        timestamp: new Date().toISOString(),
        entityType: "project",
        entityId: projectId,
        action: "update",
        changes: JSON.stringify({ name, imageFileId: File }),
      });
      return c.json({ data: project });
    }
  )

  .delete("/:projectId", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");

    const { projectId } = c.req.param();

    const existingProject = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      projectId
    );

    const member = await getMember({
      databases,
      workspaceId: existingProject.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (member.role !== MemberRole.ADMIN) {
      return c.json({ error: "unauthorized" }, 401);
    }

    await databases.deleteDocument(DATABASE_ID, PROJECTS_ID, projectId);

    await addActivityLog(databases, {
      userId: user.$id,
      timestamp: new Date().toISOString(),
      entityType: "project",
      entityId: projectId,
      action: "delete",
      changes: JSON.stringify({ name: existingProject.name }),
    });

    return c.json({ data: { $id: existingProject.$id } });
  })

  .get("/:projectId/analytics", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");
    const { projectId } = c.req.param();

    const project = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      projectId
    );

    const member = await getMember({
      databases,
      workspaceId: project.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const statusDist: Record<string, number> = {};
    const priorityDist: Record<string, number> = {};
    const typeDist: Record<string, number> = {};

    const tasks = await databases.listDocuments<Task>(DATABASE_ID, TASKS_ID, [
      Query.equal("projectId", projectId),
    ]);
    for (const task of tasks.documents) {
      // Status
      const status = task.status || "Unknown";
      statusDist[status] = (statusDist[status] || 0) + 1;

      // Priority
      const priority = task.priority || "Unspecified";
      priorityDist[priority] = (priorityDist[priority] || 0) + 1;

      // Type
      const type = task.type || "General";
      typeDist[type] = (typeDist[type] || 0) + 1;
    }

    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const thisMonthTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("projectId", projectId),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("projectId", projectId),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ]
    );

    const taskCount = thisMonthTasks.total;
    const taskDifference = taskCount - lastMonthTasks.total;

    const thisMonthAssignedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("projectId", projectId),
        Query.equal("assigneeId", member.$id),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthAssignedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("projectId", projectId),
        Query.equal("assigneeId", member.$id),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ]
    );

    const assignedTaskCount = thisMonthAssignedTasks.total;
    const assignedTaskDifference =
      assignedTaskCount - lastMonthAssignedTasks.total;

    const thisMonthIncompleteTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("projectId", projectId),
        Query.equal("status", TaskStatus.DONE),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthIncompleteTask = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("projectId", projectId),
        Query.equal("status", TaskStatus.DONE),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ]
    );

    const incompleteTaskCount = thisMonthIncompleteTasks.total;
    const incompleteTaskDifference =
      incompleteTaskCount - lastMonthIncompleteTask.total;

    const thisMonthCompletedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("projectId", projectId),
        Query.equal("status", TaskStatus.DONE),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthCompletedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("projectId", projectId),
        Query.equal("status", TaskStatus.DONE),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ]
    );

    const completedTaskCount = thisMonthCompletedTasks.total;
    const completedTaskDifference =
      completedTaskCount - lastMonthCompletedTasks.total;

    const thisMonthOverdueTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("projectId", projectId),
        Query.notEqual("status", TaskStatus.DONE),
        Query.lessThan("dueDate", now.toISOString()),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthOverdueTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("projectId", projectId),
        Query.notEqual("status", TaskStatus.DONE),
        Query.lessThan("dueDate", now.toISOString()),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ]
    );

    const overdueTaskCount = thisMonthOverdueTasks.total;
    const overdueTaskDifference =
      overdueTaskCount - lastMonthOverdueTasks.total;

    return c.json({
      data: {
        taskCount,
        taskDifference,
        assignedTaskCount,
        assignedTaskDifference,
        completedTaskCount,
        completedTaskDifference,
        incompleteTaskCount,
        incompleteTaskDifference,
        overdueTaskCount,
        overdueTaskDifference,
        status: statusDist,
        priority: priorityDist,
        type: typeDist,
      },
    });
  })

  .get("/:projectId/analytics/workload", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const { projectId } = c.req.param();
    const { users } = await createAdminClient();

    try {
      // 1. Get the project to find its workspace
      const project = await databases.getDocument(
        DATABASE_ID,
        PROJECTS_ID,
        projectId
      );
      const workspaceId = project.workspaceId;

      console.log(`Project ${projectId} belongs to workspace ${workspaceId}`);

      // 2. Fetch tasks for this project
      const tasks = await databases.listDocuments<Task>(DATABASE_ID, TASKS_ID, [
        Query.equal("projectId", projectId),
      ]);

      console.log(`Found ${tasks.total} tasks`);

      // 3. Get unique assigneeIds from tasks (these are member IDs)
      const assigneeMemberIds = [
        ...new Set(
          tasks.documents
            .map((task) => task.assigneeId)
            .filter((id): id is string => !!id)
        ),
      ];

      console.log("Assignee Member IDs from tasks:", assigneeMemberIds);

      if (assigneeMemberIds.length === 0) {
        return c.json({ data: [] });
      }

      // 4. Fetch member documents using the member IDs from tasks
      const members = await databases.listDocuments(DATABASE_ID, MEMBERS_ID, [
        Query.equal("$id", assigneeMemberIds),
      ]);

      console.log(`Found ${members.total} relevant members`);

      // 5. Process each member
      const result = await Promise.all(
        members.documents.map(async (member) => {
          try {
            // Get user details from the member's userId
            const user = await users.get(member.userId);

            // Get tasks assigned to this member (using member.$id)
            const assignedTasks = tasks.documents.filter(
              (task) => task.assigneeId === member.$id
            );

            console.log(
              `Member ${member.$id} (${user.name}) has ${assignedTasks.length} tasks`
            );

            // Calculate metrics
            const completedTasks = assignedTasks.filter(
              (t) => t.startedAt && t.completedAt
            );

            const totalCycleTime = completedTasks.reduce((sum, task) => {
              const start = new Date(task.startedAt!).getTime();
              const end = new Date(task.completedAt!).getTime();
              return sum + (end - start) / (1000 * 60 * 60 * 24);
            }, 0);

            const averageCycleTime =
              completedTasks.length > 0
                ? totalCycleTime / completedTasks.length
                : 0;

            return {
              name: user.name,
              email: user.email,
              tasks: assignedTasks.length,
              storyPoints: assignedTasks.reduce(
                (sum, t) => sum + (t.storyPoint || 0),
                0
              ),
              cycleTime: Number(averageCycleTime.toFixed(1)),
              percentage:
                tasks.total > 0
                  ? Number(
                      ((assignedTasks.length / tasks.total) * 100).toFixed(1)
                    )
                  : 0,
            };
          } catch (error) {
            console.warn(`Error processing member ${member.$id}:`, error);
            return null;
          }
        })
      );

      const validResults = result.filter((member) => member !== null);
      const sortedResults = validResults.sort((a, b) => b.tasks - a.tasks);

      console.log(
        `Final result: ${sortedResults.length} team members with workload data`
      );
      return c.json({ data: sortedResults });
    } catch (error) {
      console.error("Error in workload endpoint:", error);
      return c.json({ error: "Failed to fetch workload data" }, 500);
    }
  });

export default app;
