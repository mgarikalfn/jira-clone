import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createCommentSchema } from "../schemas";
import { COMMENTS_ID, DATABASE_ID, TASKS_ID, WORKSPACES_ID, LIKES_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { getMember } from "@/features/members/utils";
import { Task } from "@/features/tasks/types";
import { AppComment } from "../types";
import { createAdminClient } from "@/lib/appwrite";

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

  // Delete comment
  .delete(
    "/:commentId",
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { commentId } = c.req.param();

      try {
        // Get the comment first to check ownership and workspace
        const comment = await databases.getDocument<AppComment>(
          DATABASE_ID,
          COMMENTS_ID,
          commentId
        );

        if (!comment) {
          return c.json({ error: "Comment not found" }, 404);
        }

        // Check if user is a member of the workspace
        const member = await getMember({
          databases,
          workspaceId: comment.workspaceId,
          userId: user.$id,
        });

        if (!member) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        // Check if user is the author or has admin role
        const isAuthor = comment.authorId === user.$id;
        const isAdmin = member.role === "ADMIN";

        if (!isAuthor && !isAdmin) {
          return c.json({ 
            error: "You can only delete your own comments" 
          }, 403);
        }

        // First, delete all likes associated with this comment
        const commentLikes = await databases.listDocuments(
          DATABASE_ID,
          LIKES_ID,
          [Query.equal("commentId", commentId)]
        );

        // Delete all likes in parallel
        await Promise.all(
          commentLikes.documents.map(like =>
            databases.deleteDocument(DATABASE_ID, LIKES_ID, like.$id)
          )
        );

        // Also delete any child comments (replies)
        const childComments = await databases.listDocuments(
          DATABASE_ID,
          COMMENTS_ID,
          [Query.equal("parentId", commentId)]
        );

        // Delete all child comments and their likes in parallel
        await Promise.all(
          childComments.documents.map(async (childComment) => {
            // Delete likes for child comment
            const childLikes = await databases.listDocuments(
              DATABASE_ID,
              LIKES_ID,
              [Query.equal("commentId", childComment.$id)]
            );
            
            await Promise.all(
              childLikes.documents.map(like =>
                databases.deleteDocument(DATABASE_ID, LIKES_ID, like.$id)
              )
            );
            
            // Delete the child comment
            return databases.deleteDocument(DATABASE_ID, COMMENTS_ID, childComment.$id);
          })
        );

        // Finally, delete the main comment
        await databases.deleteDocument(DATABASE_ID, COMMENTS_ID, commentId);

        return c.json({ 
          success: true,
          message: "Comment deleted successfully" 
        });

      } catch (error: any) {
        console.error("Error deleting comment:", error);
        return c.json({ 
          error: error.message || "Failed to delete comment" 
        }, 500);
      }
    }
  )

export default app;