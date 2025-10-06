import {useMutation, useQueryClient} from "@tanstack/react-query";

import { InferRequestType , InferResponseType } from "hono";
import {client} from "@/lib/rpc";
import {toast} from "sonner";

type ResponseType = InferResponseType<typeof client.api.tasks["$post"] , 200>
type RequestType = InferRequestType<typeof client.api.tasks["$post"]> 


export const useCreateTask = () =>{
    const queryClient = useQueryClient();
    

    const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
     >({
        mutationFn:async ({json}) => {
            const response = await client.api.tasks["$post"]({json});

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
        onSuccess:() => {
            toast.success("task created");
            queryClient.invalidateQueries({queryKey:["tasks"]});
        },
        onError:(error) => {
            toast.error(error.message);
        }
     })

     return mutation;
}
