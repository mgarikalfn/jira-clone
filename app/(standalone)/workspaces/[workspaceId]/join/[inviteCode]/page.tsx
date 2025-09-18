import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/server/queries"
import { WorkspaceFormPage } from "./client";


const WorkspaceIdJoinPage = async () => {

  const user = await getCurrent();
  if(!user) redirect("/sign-in");

  return <WorkspaceFormPage/>
}

export default WorkspaceIdJoinPage