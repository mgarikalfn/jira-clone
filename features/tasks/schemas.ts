import { z } from "zod";
import { TaskStatus } from "./types";

export const createTaskSchema = z.object({
  name: z.string().min(1, "Task name is required"),
  status: z.enum(TaskStatus),
  workspaceId: z.string().trim().min(1, "Workspace is required"),
  projectId: z.string().trim().min(1, "Project is required"),

  // Zod v4 way: refine instead of required_error
  dueDate: z.coerce.date().refine(
    (val) => !!val,
    { message: "Due date is required" }
  ),

  assigneeId: z.string().trim().min(1, "Assignee is required"),
  description: z.string().optional(),
});
