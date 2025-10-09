import {useMutation, useQueryClient} from "@tanstack/react-query";

import { InferRequestType , InferResponseType } from "hono";
import {client} from "@/lib/rpc";
import {toast} from "sonner";

type ResponseType = InferResponseType<typeof client.api.comments[":taskId"][":parentId"]["$post"] , 200>
type RequestType = InferRequestType<typeof client.api.comments[":taskId"][":parentId"]["$post"]> 


export const useReplyComment = () =>{
    const queryClient = useQueryClient();
    

    const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
     >({
        mutationFn:async ({json,param}) => {
            const response = await client.api.comments[":taskId"][":parentId"]["$post"]({param,json});

             if(!response.ok){
                throw new Error("Failed to create reply");
            }
            return await response.json();
        },
        onSuccess:() => {
            toast.success("reply created");
            queryClient.invalidateQueries({queryKey:["reply"]});
        },
        onError:() => {
            toast.error("Failed to create reply");
        }
     })

     return mutation;
}
