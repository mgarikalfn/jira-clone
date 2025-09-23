import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createCommentSchema } from "../schemas";
import { COMMENTS_ID, DATABASE_ID, TASKS_ID, WORKSPACES_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { getMember } from "@/features/members/utils";
import { Task } from "@/features/tasks/types";
import { AppComment } from "../types";
import { Console } from "console";
import { createAdminClient } from "@/lib/appwrite";
import { LIKES_ID } from "../../../config";

const app = new Hono()

  .get("/:taskId", sessionMiddleware, async (c) => {
    const currentUser = c.get("user");
    const databases = c.get("databases");
    const { taskId } = c.req.param();
    const { users } = await createAdminClient();

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
      return c.json({ error: "unauthorized" }, 401);
    }

    const comments = await databases.listDocuments<AppComment>(
      DATABASE_ID,
      COMMENTS_ID,
      [
        Query.equal("taskId", taskId), // only fetch comments for this task
      ]
    );



    const enrichedComments = await Promise.all(
      comments.documents.map(async (comment) => {
        try {
          const user = await users.get(comment.authorId);
          return {
            ...comment,
            authorName: user.name,   // add name
            // optional
          };
        } catch {
          return {
            ...comment,
            authorName: "Unknown", // fallback
          };
        }
      })
    );


    return c.json({ data: enrichedComments });
  })

  .post(
    "/:taskId",
    sessionMiddleware,
    zValidator("json", createCommentSchema),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { taskId } = c.req.param();

      const { content, workspaceId } = c.req.valid("json");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "unauthorized" }, 401);
      }

      const comment = await databases.createDocument(
        DATABASE_ID,
        COMMENTS_ID,
        ID.unique(),
        {
          content,
          authorId: user.$id,
          workspaceId,
          taskId,
        }
      );

      return c.json({ data: comment });
    }
  )

  .post(
    "/:taskId/:parentId",
    sessionMiddleware,
    zValidator("json", createCommentSchema),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { taskId } = c.req.param();
      const { parentId } = c.req.param();

      const { content, workspaceId } = c.req.valid("json");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "unauthorized" }, 401);
      }

      const comment = await databases.createDocument(
        DATABASE_ID,
        COMMENTS_ID,
        ID.unique(),
        {
          content,
          authorId: user.$id,
          workspaceId,
          taskId,
          parentId,
        }
      );

      return c.json({ data: comment });

    }
  )
  .post(
    "/:commentId/like",
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { commentId } = c.req.param();

      const existingLike = await databases.listDocuments(
        DATABASE_ID,
        LIKES_ID,
        [
          Query.equal("commentId", commentId),
          Query.equal("userId", user.$id)
        ]
      )

      if (existingLike.documents.length > 0) {
        // Already liked → unlike
        await databases.deleteDocument(
          DATABASE_ID,
          LIKES_ID, 
          existingLike.documents[0].$id);
        return c.json({liked:false})
      } else {
        // Not liked → like
        await databases.createDocument(
          DATABASE_ID,
          LIKES_ID, 
          ID.unique(),
          {
          userId: user.$id,
          commentId,
        });
        return c.json({liked:true})
      }
    }
  )


export default app;
