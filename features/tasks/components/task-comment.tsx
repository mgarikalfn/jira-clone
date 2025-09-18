import { MemberAvatar } from "@/features/members/components/member-avatar";
import { Task } from "../types";
import { Button } from "@/components/ui/button";
import { Key, useState } from "react";
import { CalendarIcon, PencilIcon, XIcon } from "lucide-react";
import { DottedSeparator } from "@/components/ui/dotted-separator";
import { Textarea } from "@/components/ui/textarea";
import { useGetComments } from "@/features/comments/api/use-get-comments";
import { keyof } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface TaskCommentProps {
  task: Task;
}

export const TaskComment = ({ task }: TaskCommentProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const taskId = task.$id
  const {data:comments , isPending} = useGetComments({taskId});
  return (
    <div>
      <div className="p-4 boarder rounded-lg">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Comments</p>
          <Button
            onClick={() => setIsEditing((prev) => !prev)}
            size="sm"
            variant="secondary"
          >
            {isEditing ? (
              <XIcon className="size-4 mr-2" />
            ) : (
              <PencilIcon className="size-4 mr-2" />
            )}
            {isEditing ? "Cancel" : "comment"}
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        {isEditing ? (
          <div className="flex items-center gap-4">
            <MemberAvatar name={task.name} className="size-8" />
            <div className="flex flex-col gap-y-4 flex-1">
              <Textarea
                placeholder="Add a comment ..."
                rows={4}
                className="w-[400px] resize-none break-words"
              />

              <Button size="sm" className="w-fit ml-auto">
                Post
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {}
          </div>
        )}
      </div>
    </div>
  );
};

interface CommentsListProps{
  data:Comment[],

}

const CommentsList= ({data}:CommentsListProps) =>{
    return (
         <ul className="flex flex-col gap-y-4">
            {data.map((comment) =>(
                <li key={comment.$id}>
                    <Card className="shadow-none rounded-lg hover:opacity-75 transition">
                                    <CardContent className="p-4">
                                        <p className="text-lg font-medium truncate">
                                            {comment.authorId?.name}
                                        </p>
                                
                                        <div className="size-1 rounded-full bg-neutral-300"/>
                                        <div className="text-sm text-muted-foreground flex items-center">
                                            <CalendarIcon className="size-3 mr-1"/>
                                            <span className="truncate">
                                                {formatDistanceToNow(new Date(comment.$update))}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                </li>
            ))}
            <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
                No comments found
            </li>
        </ul>
    )
}