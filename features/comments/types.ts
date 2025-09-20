import { Models } from "node-appwrite";


export type AppComment = Models.Document & {
    authorId:string;
    content:string;
    workspaceId:string;
    taskId:string;
}
