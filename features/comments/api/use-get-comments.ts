import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { AppComment } from "../types";

interface useGetCommentsProps {
  taskId:string
}
export const useGetComments = ({
  taskId
}: useGetCommentsProps) => {
  const query = useQuery({
    queryKey: [
      "comments",
      taskId
    ],
    queryFn: async () => {
      const response = await client.api.comments[":taskId"].$get({param:{taskId}});

      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }

      const { data } = await response.json();
      return data as AppComment[];
    },
  });

  return query;
};
