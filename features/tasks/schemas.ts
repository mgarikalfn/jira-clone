import { z } from "zod";
import { TaskStatus } from "./types";

export const createTaskSchema = z.object({
  name: z.string().min(1, "Task name is required"),
  status: z.enum(TaskStatus),
  workspaceId: z.string().trim().min(1, "Workspace is required"),
  projectId: z.string().trim().min(1, "Project is required"),

dueDate: z.coerce.date<Date>(),
  assigneeId: z.string().trim().min(1, "Assignee is required"),
  description: z.string().optional(),
});
