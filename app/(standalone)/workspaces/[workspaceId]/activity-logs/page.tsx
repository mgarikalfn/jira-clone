import { redirect } from "next/navigation";


import ActivityLogsClient from "./client";
import { getCurrent } from "@/features/auth/server/queries";

const ActivityLogsPage = async () => {
  const user = await getCurrent();

  if (!user) redirect("/sign-in");

  return (
   <ActivityLogsClient />
  );
};

export default ActivityLogsPage;