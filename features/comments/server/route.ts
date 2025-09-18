import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createCommentSchema } from "../schemas";
import { COMMENTS_ID, DATABASE_ID, WORKSPACES_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { getMember } from "@/features/members/utils";

const app = new Hono()
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