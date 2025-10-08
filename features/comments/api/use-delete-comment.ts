import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.comments[":commentId"]["$delete"], 200>
type RequestType = InferRequestType<typeof client.api.comments[":commentId"]["$delete"]>

export const useDeleteComment = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ param }) => {
            const response = await client.api.comments[":commentId"]["$delete"]({ param });

            if (!response.ok) {
                throw new Error("Failed to delete comment");
            }
            return await response.json();
        },
        onSuccess: () => {
            toast.success("Comment deleted");
            // Invalidate comments query to refresh the list
            queryClient.invalidateQueries({ queryKey: ["comments"] });
            // Also invalidate tasks query if comments are shown in task details
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
        onError: () => {
            toast.error("Failed to delete comment");
        }
    })

    return mutation;
}