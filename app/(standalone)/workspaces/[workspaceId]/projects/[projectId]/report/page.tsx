import { getCurrent } from "@/features/auth/server/queries";
import { redirect } from "next/navigation";
import { ProjectIdReportClient } from "./client";

const ProjectReportPage = async () => {
  const user = await getCurrent();
   if (!user) redirect("/sign-in");

   return <ProjectIdReportClient/>
}

export default ProjectReportPage