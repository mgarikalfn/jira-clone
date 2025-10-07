// app/api/user/profile/route.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { sessionMiddleware } from "@/lib/session-middleware";
import { createAdminClient } from "@/lib/appwrite";


const app = new Hono()

  // Get current user profile
  .get("/", sessionMiddleware, async (c) => {
    try {
      const user = c.get("user");
      const { users } = await createAdminClient();
      
      const userData = await users.get(user.$id);
      
      return c.json({
        data: {
          id: userData.$id,
          name: userData.name,
          email: userData.email,
          emailVerification: userData.emailVerification,
          phone: userData.phone,
          phoneVerification: userData.phoneVerification,
          prefs: userData.prefs,
          createdAt: userData.$createdAt,
        }
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return c.json({ error: "Failed to fetch user profile" }, 500);
    }
  })

  // Update user name
  .patch(
    "/name",
    sessionMiddleware,
    zValidator(
      "json",
      z.object({
        name: z.string().min(1, "Name is required").max(255, "Name too long"),
      })
    ),
    async (c) => {
      try {
        const user = c.get("user");
        const { name } = c.req.valid("json");
        const { users } = await createAdminClient();

        const updatedUser = await users.updateName(user.$id, name);

        return c.json({
          message: "Name updated successfully",
          data: {
            name: updatedUser.name,
          }
        });
      } catch (error: any) {
        console.error("Error updating name:", error);
        return c.json({ 
          error: error.message || "Failed to update name" 
        }, 500);
      }
    }
  )

  // Update user email (requires verification)
  .patch(
    "/email",
    sessionMiddleware,
    zValidator(
      "json",
      z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required for email change"),
      })
    ),
    async (c) => {
      try {
        const user = c.get("user");
        const { email, password } = c.req.valid("json");
        const { users, account } = await createAdminClient();

        // First, verify the password by creating a session
        try {
          await account.createEmailPasswordSession(email, password);
          // Delete the temporary session immediately
          // await account.deleteSession('current');
        } catch (authError) {
          return c.json({ error: "Invalid password" }, 401);
        }

        // Update email (this will trigger verification)
        const updatedUser = await users.updateEmail(user.$id, email);

        return c.json({
          message: "Email updated successfully. Please check your email for verification.",
          data: {
            email: updatedUser.email,
            emailVerification: updatedUser.emailVerification,
          }
        });
      } catch (error: any) {
        console.error("Error updating email:", error);
        return c.json({ 
          error: error.message || "Failed to update email" 
        }, 500);
      }
    }
  )

  // Update password
  .patch(
    "/password",
    sessionMiddleware,
    zValidator(
      "json",
      z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(8, "New password must be at least 8 characters"),
      })
    ),
    async (c) => {
      try {
        const user = c.get("user");
        const { currentPassword, newPassword } = c.req.valid("json");
        const { account, users } = await createAdminClient();

        // Get user email for authentication
        const userData = await users.get(user.$id);

        // Verify current password by creating a session
        try {
          const session = await account.createEmailPasswordSession(userData.email, currentPassword);
          // Delete the temporary session after verification
          await account.deleteSession(session.$id);
        } catch (authError) {
          return c.json({ error: "Current password is incorrect" }, 401);
        }

        // Update password
        const updatedUser = await account.updatePassword(newPassword, currentPassword);

        return c.json({
          message: "Password updated successfully",
        });
      } catch (error: any) {
        console.error("Error updating password:", error);
        return c.json({ 
          error: error.message || "Failed to update password" 
        }, 500);
      }
    }
  )

  // Update user preferences
  .patch(
    "/prefs",
    sessionMiddleware,
    zValidator(
      "json",
      z.object({
        prefs: z.record(z.string(), z.any()),
      })
    ),
    async (c) => {
      try {
        const user = c.get("user");
        const { prefs } = c.req.valid("json");
        const { users } = await createAdminClient();

        const updatedUser = await users.updatePrefs(user.$id, prefs);

        return c.json({
          message: "Preferences updated successfully",
          data: {
            prefs: updatedUser.prefs,
          }
        });
      } catch (error: any) {
        console.error("Error updating preferences:", error);
        return c.json({ 
          error: error.message || "Failed to update preferences" 
        }, 500);
      }
    }
  );

export default app;