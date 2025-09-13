import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface useGetTasksProps {
  workspaceId: string;
  projectId?: string | null;
  status?: string | null;
  assigneeId?: string | null;
  dueDate?: string | null;
  search?: string | null;
}
export const useGetTasks = ({
  workspaceId,
  projectId,
  status,
  assigneeId,
  dueDate,
  search,
}: useGetTasksProps) => {
  const query = useQuery({
    queryKey: [
      "tasks",
      projectId,
      status,
      assigneeId,
      dueDate,
      search,
      workspaceId,
    ],
    queryFn: async () => {
      const response = await client.api.tasks.$get({
        query: {
          workspaceId,
          projectId: projectId ?? undefined,
          status: status ?? undefined,
          assigneeId: assigneeId ?? undefined,
          dueDate: dueDate ?? undefined,
          search: search ?? undefined,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
