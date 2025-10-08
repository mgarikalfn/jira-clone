import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

// Define the response type based on your API response
type LikeResponse = { liked: boolean };

export const useToggleCommentLike = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        LikeResponse,
        Error,
        { commentId: string }
    >({
        mutationFn: async ({ commentId }) => {
            // Fix: Ensure the parameter matches your API route structure
            const response = await client.api.comments[":commentId"].like.$post({
                param: { commentId } // This should match your API route parameter name
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Failed to toggle like: ${error}`);
            }
            
            const data = await response.json();
            return data;
        },
        onSuccess: (data) => {
            // Invalidate comments query to refresh like status and count
            queryClient.invalidateQueries({ queryKey: ["comments"] });
            toast.success(data.liked ? "Comment liked!" : "Comment unliked!");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to toggle like");
        }
    })

    return mutation;
}