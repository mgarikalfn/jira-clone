import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";


interface useGetLikesCommentProps{
    commentId:string
}


export const useGetLikesComment = ({commentId}:useGetLikesCommentProps) => {
    const query = useQuery({
        queryKey:["likes"],
        queryFn:async () => {
            const response = await client.api.comments[":commentId"]["like"]
        }
    })
}
