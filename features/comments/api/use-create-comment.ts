import {useMutation, useQueryClient} from "@tanstack/react-query";

import { InferRequestType , InferResponseType } from "hono";
import {client} from "@/lib/rpc";
import {toast} from "sonner";

type ResponseType = InferResponseType<typeof client.api.comments[":taskId"]["$post"] , 200>
type RequestType = InferRequestType<typeof client.api.comments[":taskId"]["$post"]> 


export const useCreateComment = () =>{
    const queryClient = useQueryClient();
    

    const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
     >({
        mutationFn:async ({json,param}) => {
            const response = await client.api.comments[":taskId"]["$post"]({param,json});

             if(!response.ok){
                throw new Error("Failed to create comment");
            }
            return await response.json();
        },
        onSuccess:() => {
            toast.success("comment created");
            queryClient.invalidateQueries({queryKey:["comments"]});
        },
        onError:() => {
            toast.error("Failed to create comment");
        }
     })

     return mutation;
}
