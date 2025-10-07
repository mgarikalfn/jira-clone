import { createAdminClient } from "@/lib/appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Query } from "node-appwrite";
import { Hono } from "hono";
import z from "zod";
import { getMember } from "../utils";
import { DATABASE_ID, MEMBERS_ID } from "@/config";
import { Member, MemberRole } from "../types";
import { addActivityLog } from "@/lib/activityLog";

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", z.object({ workspaceId: z.string() })),
    async (c) => {
      const { users } = await createAdminClient();
      const databases = c.get("databases");
      const user = c.get("user");
      const { workspaceId } = c.req.valid("query");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "unauthorized" }, 401);
      }

      const members = await databases.listDocuments<Member>(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal("workspaceId", workspaceId)]
      );

      const populatedMembers = await Promise.all(
        members.documents.map(async (member) => {
          const user = await users.get(member.userId);
          return {
            ...member,
            name: user.name,
            email: user.email,
          };
        })
      );
      return c.json({
        data: {
          ...members,
          documents: populatedMembers,
        },
      });
    }
  )

  .get("/:memberId", sessionMiddleware, async (c) => {
    const { memberId } = c.req.param(); // This is the userId, not the document $id
    const databases = c.get("databases");
    const { users } = await createAdminClient();

    // Use listDocuments to query by userId column
    const memberResponse = await databases.listDocuments(
      DATABASE_ID,
      MEMBERS_ID,
      [Query.equal("userId", memberId)]
    );

    if (memberResponse.total === 0) {
      return c.json({ error: "Member not found" }, 404);
    }

    const memberDoc = memberResponse.documents[0];

    // Get user info from Appwrite Users collection
    let userInfo = null;
    try {
      userInfo = await users.get(memberDoc.userId);
    } catch (e) {
      // fallback if user not found
      userInfo = { name: "Unknown", email: "" };
    }

    return c.json({
      data: {
        $id: memberDoc.$id,
        userId: memberDoc.userId,
        workspaceId: memberDoc.workspaceId,
        role: memberDoc.role,
        name: userInfo.name,
        email: userInfo.email,
      },
    });
  })

  .delete("/:memberId", sessionMiddleware, async (c) => {
    const { memberId } = c.req.param();
    const user = c.get("user");
    const databases = c.get("databases");

    const memberToDelete = await databases.getDocument(
      DATABASE_ID,
      MEMBERS_ID,
      memberId
    );

    const allMembersInWorkspace = await databases.listDocuments(
      DATABASE_ID,
      MEMBERS_ID,
      [Query.equal("workspaceId", memberToDelete.workspaceId)]
    );

    const member = await getMember({
      databases,
      workspaceId: memberToDelete.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "unauthorized" }, 401);
    }

    if (member.$id !== memberToDelete.$id && member.role !== MemberRole.ADMIN) {
      return c.json({ error: "unauthorized" }, 401);
    }

    if (allMembersInWorkspace.total === 1) {
      return c.json({ error: "cannot delete the only member" }, 401);
    }

    await databases.deleteDocument(DATABASE_ID, MEMBERS_ID, memberId);

    await addActivityLog(databases, {
      userId: user.$id,
      timestamp: new Date().toISOString(),
      entityType: "workspace",
      entityId: memberToDelete.workspaceId,
      action: "delete",
      changes: JSON.stringify({ deletedBy: user.$id }),
    });

    return c.json({ data: { $id: memberToDelete.$id } });
  })

  .patch(
    "/:memberId",
    sessionMiddleware,
    zValidator("json", z.object({ role: z.nativeEnum(MemberRole) })),
    async (c) => {
      const { memberId } = c.req.param();
      const user = c.get("user");
      const databases = c.get("databases");
      const { role } = c.req.valid("json");

      const memberToUpdate = await databases.getDocument(
        DATABASE_ID,
        MEMBERS_ID,
        memberId
      );

      const allMembersInWorkspace = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal("workspaceId", memberToUpdate.workspaceId)]
      );

      const member = await getMember({
        databases,
        workspaceId: memberToUpdate.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "unauthorized" }, 401);
      }

      if (member.role !== MemberRole.ADMIN) {
        return c.json({ error: "unauthorized" }, 401);
      }

      if (allMembersInWorkspace.total === 1) {
        return c.json({ error: "cannot downgrade the only member" }, 401);
      }

      await databases.updateDocument(DATABASE_ID, MEMBERS_ID, memberId, {
        role,
      });

      await addActivityLog(databases, {
        userId: user.$id,
        timestamp: new Date().toISOString(),
        entityType: "member",
        entityId: memberId,
        action: "update",
        changes: JSON.stringify({ role }),
      });

      return c.json({ data: { $id: memberToUpdate.$id } });
    }
  );

export default app;
