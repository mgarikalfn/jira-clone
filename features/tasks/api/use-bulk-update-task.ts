import {useMutation, useQueryClient} from "@tanstack/react-query";

import { InferRequestType , InferResponseType } from "hono";
import {client} from "@/lib/rpc";
import {toast} from "sonner";

type ResponseType = InferResponseType<typeof client.api.tasks["bulk-update"]["$post"] , 200>
type RequestType = InferRequestType<typeof client.api.tasks["bulk-update"]["$post"]> 


export const useBulkUpdateTasks = () =>{
    const queryClient = useQueryClient();
    const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
     >({
       mutationFn: async ({ json }) => {
  const response = await client.api.tasks["bulk-update"]["$post"]({ json });

  if (!response.ok) {
    // Try to extract a specific error message from the response
    let errorMsg = "Failed to update tasks";
    try {
      const errorData = await response.json();
      if ("error" in errorData && errorData.error) errorMsg = errorData.error;
    } catch {}
    throw new Error(errorMsg);
  }
  return await response.json();
},
onError: (error) => {
  toast.error(error.message);
},
        onSuccess:() => {
            toast.success("tasks updated");

            queryClient.invalidateQueries({queryKey:["tasks"]});
        }
       
     })

     return mutation;
}
