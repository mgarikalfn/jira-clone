import z from "zod";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";

import { getMember } from "@/features/members/utils";

import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, IMAGES_BUCKET_ID, PROJECTS_ID, WORKSPACES_ID } from "@/config";
import { createProjectSchema } from "../schema";

const app = new Hono()
.get(
    "/",
    sessionMiddleware,
    zValidator("query",z.object({workspaceId:z.string()})),
    async (c) => {
        const user =c.get("user");
        const databases = c.get("databases");

        const {workspaceId} = c.req.valid("query");
        if(!workspaceId){
            return c.json({error:"Missing workspaceId" },400)
        }

        const member = await getMember({
            databases,
            workspaceId,
            userId:user.$id
        });

        if(!member) {
            return c.json({error:"unauthorized"},401);
        }

        const projects = await databases.listDocuments(
            DATABASE_ID,
            PROJECTS_ID,
            [
                Query.equal("workspaceId" , workspaceId),
                Query.orderDesc("$createdAt"),
            ],
        );

        return c.json({data:projects})
    }
)

.post(
    "/",
    sessionMiddleware,
    zValidator("form" , createProjectSchema),
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      const { name, image , workspaceId } = c.req.valid("form");

      const member = await getMember({
        databases,
        workspaceId,
        userId:user.$id
      });

      if(!member) {
        return c.json({error:"unauthorized"} ,401)
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
          userid: user.$id,
          imageUrl: uploadedImageUrl,
          workspaceId:workspaceId,
        }
      );

     
      return c.json({ data: project });
    }
)

export default app;