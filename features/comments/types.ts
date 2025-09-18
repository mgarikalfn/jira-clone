import { Models } from "node-appwrite";


export type Comment = Models.Document & {
    authorId:string;
    content:string;
    workspaceId:string;
    taskId:string;
}