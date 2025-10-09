import { useMutation,useQueryClient } from "@tanstack/react-query";
import {InferRequestType,InferResponseType} from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.comments[":commentId"]["like"]["$post"],200>

type RequestType = InferRequestType<typeof client.api.comments[":commentId"]["like"]["$post"]>

export const useLikeComment = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
    >({
       mutationFn:async ({param}) => {
        const response = await client.api.comments[":commentId"]["like"]["$post"]({param});

        if(!response.ok){
            throw new Error("failed to like the comment")
        }

        return await response.json();
       },
       onSuccess:() => {
        toast.success("Liked comment");
        queryClient.invalidateQueries({queryKey:["like"]})
       },
       onError:() => {
        toast.error("failed to like comment")
       }
    })

    return mutation;
}