import z from "zod";

export const createCommentSchema = z.object({
    content:z.string().min(5,"comment to short"),
    workspaceId:z.string()
})

