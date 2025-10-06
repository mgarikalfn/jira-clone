import {useMutation, useQueryClient} from "@tanstack/react-query";

import { InferRequestType , InferResponseType } from "hono";
import {client} from "@/lib/rpc";
import {toast} from "sonner";

type ResponseType = InferResponseType<typeof client.api.tasks[":taskId"]["$patch"] , 200>
type RequestType = InferRequestType<typeof client.api.tasks[":taskId"]["$patch"]> 


export const useUpdateTask = () =>{
    const queryClient = useQueryClient();

    const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
     >({
        mutationFn:async ({json,param}) => {
            const response = await client.api.tasks[":taskId"]["$patch"]({json,param});

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
            toast.success("task updated");

            queryClient.invalidateQueries({queryKey:["tasks"]});
            queryClient.invalidateQueries({queryKey:["task",data.$id]})
        },
        onError:(error) => {
            toast.error(error.message);
        }
     })

     return mutation;
}
