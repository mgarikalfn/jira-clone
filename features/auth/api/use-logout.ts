import {useMutation, useQueryClient} from "@tanstack/react-query";

import { InferRequestType , InferResponseType } from "hono";
import {client} from "@/lib/rpc";
import { useRouter } from "next/navigation";
import {toast} from "sonner";

type ResponseType = InferResponseType<typeof client.api.auth.logout["$post"]>


export const useLogout = () =>{
    const queryClient = useQueryClient();
    const router = useRouter();

    const mutation = useMutation<
    ResponseType,
    Error
     >({
        mutationFn:async () => {
            const response = await client.api.auth.logout["$post"]();

             if(!response.ok){
                throw new Error("Failed to logout");
            }

            return await response.json();
        },
        onSuccess:() => {
            toast.success("Logged out");
            router.refresh();
            queryClient.invalidateQueries({queryKey:["current"]});
            queryClient.invalidateQueries({queryKey:["workspaces"]})
            
        },
        onError:() => {
            toast.error("failed to log out");
        }
     })

     return mutation;
}
