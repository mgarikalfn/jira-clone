import { Hono } from "hono";
import { handle } from "hono/vercel";

import auth from "@/features/auth/server/route";
import workspaces from "@/features/workspaces/server/route";
import members from "@/features/members/server/route";
import projects from "@/features/projects/server/route";
import tasks from "@/features/tasks/server/route";
import comments from "@/features/comments/server/route";
import activityLog from "@/features/activityLogs/server/route";
import profile from "@/app/api/user/profile/route";
import passwordRecovery from "@/app/api/user/password-recovery/route";

const app = new Hono().basePath("/api");

const routes = app
  .route("/auth", auth)
  .route("/members", members)
  .route("/workspaces", workspaces)
  .route("/projects", projects)
  .route("/tasks", tasks)
  .route("/comments", comments)
  .route("/activity-log", activityLog)
  .route("/user/profile", profile) // Changed to match your file structure
  .route("/user/password-recovery", passwordRecovery); // Add password recovery

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const PUT = handle(app);

export type AppType = typeof routes;