import { ID, Query } from "node-appwrite";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { DATABASE_ID, MEMBERS_ID, PROJECTS_ID, TASKS_ID } from "@/config";
import { sessionMiddleware } from "@/lib/session-middleware";
import { createAdminClient } from "@/lib/appwrite";

import { getMember } from "@/features/members/utils";
import { Project } from "@/features/projects/types";
import { createTaskSchema } from "../schemas";
import { Task, TaskStatus } from "../types";
import { addActivityLog } from '@/lib/activityLog'; // Import the activity log function
import { MemberRole } from "@/features/members/types";

const allowedTransitions: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.BACKLOG]: [TaskStatus.TODO],
  [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS],
  [TaskStatus.IN_PROGRESS]: [TaskStatus.IN_REVIEW],
  [TaskStatus.IN_REVIEW]: [TaskStatus.DONE],
  [TaskStatus.DONE]: [], // No transitions out of DONE
};

const app = new Hono()

 .delete("/:taskId", sessionMiddleware, async (c) => {
  const user = c.get("user");
  const databases = c.get("databases");
  const { taskId } = c.req.param();

  const task = await databases.getDocument<Task>(
    DATABASE_ID,
    TASKS_ID,
    taskId
  );

  const member = await getMember({
    databases,
    workspaceId: task.workspaceId,
    userId: user.$id,
  });

  if (!member) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Only Admin or creator can delete
  if (
    member.role === MemberRole.MEMBER &&
    task.creatorId !== user.$id
  ) {
    return c.json({ error: "You can only delete tasks you created." }, 403);
  }

  await databases.deleteDocument(DATABASE_ID, TASKS_ID, taskId);

  await addActivityLog(databases,{
    userId: user.$id,
    timestamp: new Date().toISOString(),
    entityType: "task",
    entityId: taskId,
    action: "delete",
    changes: JSON.stringify({ name: task.name }),
  });

  return c.json({ data: { $id: task.$id } });
})

  .get(
  "/",
  sessionMiddleware,
  zValidator(
    "query",
    z.object({
      workspaceId: z.string(),
      projectId: z.string().nullish(),
      assigneeId: z.string().nullish(),
      status: z.nativeEnum(TaskStatus).nullish(),
      search: z.string().nullish(),
      dueDate: z.string().nullish(),
      priority: z.string().nullish(), // ✅ NEW
    })
  ),
  async (c) => {
    const { users } = await createAdminClient();
    const databases = c.get("databases");
    const user = c.get("user");

    const {
      workspaceId,
      projectId,
      assigneeId,
      status,
      search,
      dueDate,
      priority, // ✅ NEW
    } = c.req.valid("query");

    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const query = [
      Query.equal("workspaceId", workspaceId),
      Query.orderDesc("$createdAt"),
    ];

    if (projectId) query.push(Query.equal("projectId", projectId));
    if (status) query.push(Query.equal("status", status));
    if (assigneeId) query.push(Query.equal("assigneeId", assigneeId));
    if (dueDate) query.push(Query.equal("dueDate", dueDate));
    if (priority) query.push(Query.equal("priority", priority)); // ✅ NEW
    if (search) query.push(Query.search("name", search));

      const tasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_ID,
        query
      );

      const projectIds = tasks.documents.map((task) => task.projectId);
      const assigneeIds = tasks.documents.map((task) => task.assigneeId);

      const projects = await databases.listDocuments<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectIds.length > 0 ? [Query.contains("$id", projectIds)] : []
      );

      const members = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        assigneeIds.length > 0 ? [Query.contains("$id", assigneeIds)] : []
      );

      const assignees = await Promise.all(
        members.documents.map(async (member) => {
          const user = await users.get(member.userId);
          return {
            ...member,
            name: user.name || user.email,
            email: user.email,
          };
        })
      );

      const populatedTasks = tasks.documents.map((task) => {
        const project = projects.documents.find(
          (project) => project.$id === task.projectId
        );

        const assignee = assignees.find(
          (assignee) => assignee.$id === task.assigneeId
        );

        return {
          ...task,
          project,
          assignee,
        };
      });

      return c.json({ data: { ...tasks, documents: populatedTasks } });
    }
  )

  .post(
  "/",
  sessionMiddleware,
  zValidator("json", createTaskSchema),
  async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    let { name, status, workspaceId, projectId, dueDate, assigneeId } = c.req.valid("json");

    // Enforce default status to BACKLOG and error if any other status is provided
    if (status && status !== "BACKLOG") {
      return c.json({ error: "Only BACKLOG is allowed as the initial status when creating a task." }, 400);
    }
    status = "BACKLOG" as TaskStatus;

    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Restrict Members from assigning tasks to others
    if (
      member.role === MemberRole.MEMBER &&
      assigneeId &&
      assigneeId !== member.$id
    ) {
      return c.json({ error: "Members can only assign tasks to themselves." }, 403);
    }

    const highestPositionTask = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("status", status),
        Query.equal("workspaceId", workspaceId),
        Query.orderAsc("position"),
        Query.limit(1),
      ]
    );

    const newPosition =
      highestPositionTask.documents.length > 0
        ? highestPositionTask.documents[0].position + 1000
        : 1000;

    const task = await databases.createDocument(
      DATABASE_ID,
      TASKS_ID,
      ID.unique(),
      {
        name,
        status,
        workspaceId,
        projectId,
        dueDate,
        assigneeId,
        position: newPosition,
        creatorId: user.$id, // ✅ Track creator
      }
    );

    await addActivityLog(databases,{
      userId: user.$id,
      timestamp: new Date().toISOString(),
      entityType: "task",
      entityId: task.$id,
      action: "create",
      changes: JSON.stringify({ name, status, dueDate, assigneeId }),
    });

    return c.json({ data: task });
  }
)


// features/tasks/server/route.ts (updated PATCH endpoint only)
.patch(
  "/:taskId",
  sessionMiddleware,
  zValidator("json", createTaskSchema.partial()),
  async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { taskId } = c.req.param();
    const updateData = c.req.valid("json");

    const existingTask = await databases.getDocument<Task>(
      DATABASE_ID,
      TASKS_ID,
      taskId
    );

    const member = await getMember({
      databases,
      workspaceId: existingTask.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // ===== NEW: Status transition validation =====
       if (
      updateData.status &&
      updateData.status !== existingTask.status &&
      member.role !== MemberRole.ADMIN // Skip check for Admins
    ) {
      const allowed = allowedTransitions[existingTask.status] || [];
      if (!allowed.includes(updateData.status)) {
        return c.json(
          {
            error: `Invalid status transition from ${existingTask.status} to ${updateData.status}.`,
          },
          400
        );
      }
    }

    // Allow MEMBERS to update if they are either the creator or assignee
    if (
      member.role === MemberRole.MEMBER &&
      existingTask.creatorId !== user.$id &&
      existingTask.assigneeId !== member.$id
    ) {
      return c.json(
        { error: "You can only update tasks assigned to you or created by you." },
        403
      );
    }

    // Members can't reassign tasks to others
    if (
      member.role === MemberRole.MEMBER &&
      updateData.assigneeId &&
      updateData.assigneeId !== member.$id
    ) {
      return c.json(
        { error: "You can only assign tasks to yourself." },
        403
      );
    }

    // Members can't move tasks to other projects
    if (
      member.role === MemberRole.MEMBER &&
      updateData.projectId &&
      updateData.projectId !== existingTask.projectId
    ) {
      return c.json(
        { error: "You cannot move tasks to another project." },
        403
      );
    }

    // Convert priority to lowercase string if it exists (you might want to confirm this step)
    const updatedData = {
      ...updateData,
    
      dueDate: updateData.dueDate?.toISOString(),
    };

    const filteredData = Object.fromEntries(
      Object.entries(updatedData).filter(([, v]) => v !== undefined)

    );

    const task = await databases.updateDocument(
      DATABASE_ID,
      TASKS_ID,
      taskId,
      filteredData
    );

    await addActivityLog(databases,{
      userId: user.$id,
      timestamp: new Date().toISOString(),
      entityType: "task",
      entityId: taskId,
      action: "update",
      changes: JSON.stringify(filteredData),
    });

    return c.json({ data: task });
  }
)


  .get("/:taskId", sessionMiddleware, async (c) => {
    const currentUser = c.get("user");
    const databases = c.get("databases");
    const { users } = await createAdminClient();

    const { taskId } = c.req.param();

    const task = await databases.getDocument<Task>(
      DATABASE_ID,
      TASKS_ID,
      taskId
    );

    const currentMember = await getMember({
      databases,
      workspaceId: task.workspaceId,
      userId: currentUser.$id,
    });

    if (!currentMember) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const project = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      task.projectId
    );

    const member = await databases.getDocument(
      DATABASE_ID,
      MEMBERS_ID,
      task.assigneeId
    );

    const user = await users.get(member.userId);

    const assignee = {
      ...member,
      name: user.name || user.email,
      email: user.email,
    };

    return c.json({
      data: {
        ...task,
        project,
        assignee,
      },
    });
  })
.post(
  "/bulk-update",
  sessionMiddleware,
  zValidator(
    "json",
    z.object({
      tasks: z.array(
        z.object({
          $id: z.string(),
          status: z.nativeEnum(TaskStatus),
          position: z.number().int().positive().min(1000).max(1_000_000),
        })
      ),
    })
  ),
  async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { tasks } = c.req.valid("json");

    // Fetch tasks to update from DB
    const tasksToUpdate = await databases.listDocuments<Task>(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.contains(
          "$id",
          tasks.map((task) => task.$id)
        ),
      ]
    );

    const workspaceIds = new Set(
      tasksToUpdate.documents.map((task) => task.workspaceId)
    );

    if (workspaceIds.size !== 1) {
      return c.json(
        { error: "All tasks must belong to the same workspace." },
        400
      );
    }

    const workspaceId = workspaceIds.values().next().value;

    if (!workspaceId) {
      return c.json({ error: "Workspace ID is required." }, 400);
    }

    // Get member info
    const member = await getMember({
      databases,
      workspaceId: workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Filter tasks this member is allowed to update (assigned to or created by them if MEMBER)
    const allowedTasks = tasksToUpdate.documents.filter((task) => {
      if (member.role === MemberRole.ADMIN) {
        return true; // Admin can update all
      }
      // MEMBER can update tasks they are assigned to or created
      return task.assigneeId === member.$id || task.creatorId === user.$id;
    });

    const allowedTaskIds = new Set(allowedTasks.map((task) => task.$id));
    const tasksToActuallyUpdate = tasks.filter((task) =>
      allowedTaskIds.has(task.$id)
    );

    if (tasksToActuallyUpdate.length === 0) {
      return c.json(
        { error: "You have no permission to update any of these tasks." },
        403
      );
    }

    // ===== NEW: Validate all status transitions before updating =====
      for (const taskUpdate of tasksToActuallyUpdate) {
      const currentTask = allowedTasks.find((t) => t.$id === taskUpdate.$id);
      if (
        currentTask &&
        taskUpdate.status !== currentTask.status &&
        member.role !== MemberRole.ADMIN // Skip check for Admins
      ) {
        const allowed = allowedTransitions[currentTask.status] || [];
        if (!allowed.includes(taskUpdate.status)) {
          return c.json(
            {
              error: `Invalid status transition from ${currentTask.status} to ${taskUpdate.status}.`,
            },
            400
          );
        }
      }
    }

    // Proceed with updates only on allowed tasks with valid transitions
    const updatedTasks = await Promise.all(
      tasksToActuallyUpdate.map(async (task) => {
        const { $id, status, position } = task;
        const updatedTask = await databases.updateDocument<Task>(
          DATABASE_ID,
          TASKS_ID,
          $id,
          { status, position }
        );

        await addActivityLog(databases,{
          userId: user.$id,
          timestamp: new Date().toISOString(),
          entityType: "task",
          entityId: $id,
          action: "update",
          changes: JSON.stringify({ status, position }),
        });

        return updatedTask;
      })
    );

    return c.json({
      data: updatedTasks,
      message:
        tasksToActuallyUpdate.length < tasks.length
          ? "Some tasks were skipped due to insufficient permissions."
          : undefined,
    });
  }
);

export default app;