import {z} from "zod";
import { TaskStatus } from "./types";

export const createTaskSchema = z.object({
    name:z.string().min(1,"required"),
    status:z.enum(TaskStatus),
    workspaceId:z.string().trim().min(1,"required"),
    projectId:z.string().trim().min(1,"Required"),
    dueDate:z.coerce.date(),
    assigneeId:z.string().trim().min(1,"Required"),
    description:z.string().optional(),
})