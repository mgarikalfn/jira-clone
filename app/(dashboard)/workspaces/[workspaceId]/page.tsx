import { getCurrent } from "@/features/auth/server/actions"
import { redirect } from "next/navigation"

const WorkspaceIdPage = async() => {
   const user = await getCurrent();
   if(!user) redirect("/sign-in")
  return (
    <div>page</div>
  )
}

export default WorkspaceIdPage