import {useMutation, useQueryClient} from "@tanstack/react-query";

import { InferRequestType , InferResponseType } from "hono";
import {client} from "@/lib/rpc";
import {toast} from "sonner";
import { error } from "console";

type ResponseType = InferResponseType<typeof client.api.tasks[":taskId"]["$delete"] , 200>
type RequestType = InferRequestType<typeof client.api.tasks[":taskId"]["$delete"]> 


export const useDeleteTask = () =>{
   
    const queryClient = useQueryClient();
    

    const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
     >({
        mutationFn:async ({param}) => {
            const response = await client.api.tasks[":taskId"]["$delete"]({param});

             if(!response.ok){
                let errorMsg = "Failed to delete tasks";
                try{
                    const errorData = await response.json();
                     if ("error" in errorData && errorData.error) errorMsg = errorData.error;
                }catch{}
                throw new Error(errorMsg);
            }
            return await response.json();
        },
        onSuccess:({data}) => {
            toast.success("task deleted");

          
            queryClient.invalidateQueries({queryKey:["tasks"]});
            queryClient.invalidateQueries({queryKey:["tasks" ,data.$id]})
        },
        onError:(error) => {
            toast.error(error.message)
        }
     })

     return mutation;
}
