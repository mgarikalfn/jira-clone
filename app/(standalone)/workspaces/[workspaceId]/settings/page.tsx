import { getCurrent } from "@/features/auth/server/queries";
import { redirect } from "next/navigation";
import { WorkspaceIdSettingsClient } from "./client";


const WorkspaceIdSettingsPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return <WorkspaceIdSettingsClient />;
};

export default WorkspaceIdSettingsPage;
