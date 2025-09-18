import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createCommentSchema } from "../schemas";
import { COMMENTS_ID, DATABASE_ID, TASKS_ID, WORKSPACES_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { getMember } from "@/features/members/utils";
import { Task } from "@/features/tasks/types";
import { Comment } from "../types";

const app = new Hono()

.get(
    "/:taskId",
    sessionMiddleware,
    async (c) => {
            const currentUser = c.get("user");
            const databases = c.get("databases");
            const {taskId} = c.req.param();
    
            const task = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId
            )
    
            const currentMember = await getMember({
                databases,
                workspaceId:task.workspaceId,
                userId:currentUser.$id
    ,        });
    
            if(!currentMember){
                return c.json({error:"unauthorized"},401);
            }
            
            const comments = await databases.getDocument<Comment>(
                DATABASE_ID,
                COMMENTS_ID,
                taskId
            );

            return c.json({data:comments})
        }
    
)

.post(
    "/",
    sessionMiddleware,
    zValidator("json",createCommentSchema),
    async (c) => {
        const user = c.get("user");
        const databases = c.get("databases");

        const {content,taskId,workspaceId} = c.req.valid("json");

        const member = await getMember({
            databases,
            workspaceId,
            userId:user.$id
        })

        if(!member){
            return c.json({error:"unauthorized"},401);
        }

        const comment = await databases.createDocument(
            DATABASE_ID,
            COMMENTS_ID,
            ID.unique(),{
                content,
                authorId:user.$id,
                workspaceId,
                taskId
            }
        );

        return c.json({data:comment});
        
    },
)






export default app;