import z from "zod";

export const createCommentSchema = z.object({
    content:z.string().min(5,"comment to short"),
    taskId:z.string().min(1,"task is required"),
    authorId:z.string().min(1,"assignee is required"),
    workspaceId:z.string()
})