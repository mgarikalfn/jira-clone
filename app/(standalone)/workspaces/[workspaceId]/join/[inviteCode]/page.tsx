import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/server/queries"


const WorkspaceIdJoinPage = async () => {

  const user = await getCurrent();
  if(!user) redirect("/sign-in");

  return <WorkspaceIdJoinPage/>
}

export default WorkspaceIdJoinPage