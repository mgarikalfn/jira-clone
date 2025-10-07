// app/api/user/password-recovery/route.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createAdminClient } from "@/lib/appwrite";

const app = new Hono()

  // Initiate password recovery - POST
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        email: z.string().email("Invalid email address"),
        url: z.string().url().optional(),
      })
    ),
    async (c) => {
      try {
        const { email, url } = c.req.valid("json");
        const { account } = await createAdminClient();

        const resetUrl = url || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password`;
        
        await account.createRecovery(email, resetUrl);

        return c.json({
          success: true,
          message: "Password recovery email sent successfully",
        });
      } catch (error: any) {
        console.error("Error initiating password recovery:", error);
        return c.json({ 
          success: false,
          error: error.message || "Failed to send recovery email" 
        }, 500);
      }
    }
  )

  // Complete password recovery - PUT (with JSON body)
  .put(
    "/",
    zValidator(
      "json",
      z.object({
        userId: z.string(),
        secret: z.string(),
        password: z.string().min(8, "Password must be at least 8 characters"),
      })
    ),
    async (c) => {
      try {
        const { userId, secret, password } = c.req.valid("json");
        const { account } = await createAdminClient();

        await account.updateRecovery(userId, secret, password);

        return c.json({
          success: true,
          message: "Password reset successfully",
        });
      } catch (error: any) {
        console.error("Error completing password recovery:", error);
        return c.json({ 
          success: false,
          error: error.message || "Failed to reset password" 
        }, 500);
      }
    }
  )

  // Complete password recovery - POST (with URL params + form data)
  .post(
    "/reset",
    zValidator(
      "form",
      z.object({
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
      })
    ),
    async (c) => {
      try {
        const { userId, secret } = c.req.query();
        const { password, confirmPassword } = c.req.valid("form");

        // Validate required parameters
        if (!userId || !secret) {
          return c.json({ 
            success: false,
            error: "Missing userId or secret parameters" 
          }, 400);
        }

        // Validate password match
        if (password !== confirmPassword) {
          return c.json({ 
            success: false,
            error: "Passwords do not match" 
          }, 400);
        }

        const { account } = await createAdminClient();
        await account.updateRecovery(userId, secret, password);

        return c.json({
          success: true,
          message: "Password reset successfully",
        });
      } catch (error: any) {
        console.error("Error completing password recovery:", error);
        return c.json({ 
          success: false,
          error: error.message || "Failed to reset password" 
        }, 500);
      }
    }
  );

export default app;