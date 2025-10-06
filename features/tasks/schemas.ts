import { z } from "zod";
import { TaskPriority, TaskStatus, TaskType } from "./types";

export const createTaskSchema = z.object({
  name: z.string().min(1, "Task name is required"),
  status: z.enum(TaskStatus).optional(),
  workspaceId: z.string().trim().min(1, "Workspace is required"),
  projectId: z.string().trim().min(1, "Project is required"),

  dueDate: z.coerce.date<Date>(),
  assigneeId: z.string().trim().min(1, "Assignee is required"),
  
  description: z.string().optional(),
  priority:z.enum(TaskPriority).optional(),
  typeOfTask:z.enum(TaskType).optional(),
  storyPoint:z.int().optional()
});
