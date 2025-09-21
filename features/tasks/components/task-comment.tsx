import { MemberAvatar } from "@/features/members/components/member-avatar";
import { Task } from "../types";
import { Button } from "@/components/ui/button";
import { Key, useState } from "react";
import {
  CalendarIcon,
  CornerUpLeftIcon,
  PencilIcon,
  ThumbsUpIcon,
  Trash2Icon,
  TrashIcon,
  XIcon,
} from "lucide-react";
import { DottedSeparator } from "@/components/ui/dotted-separator";
import { Textarea } from "@/components/ui/textarea";
import { useGetComments } from "@/features/comments/api/use-get-comments";
import { keyof } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { PageLoader } from "@/components/page-loader";
import { AppComment } from "@/features/comments/types";
import { useCreateComment } from "@/features/comments/api/use-create-comment";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import Link from "next/link";
import { FaTrashRestore } from "react-icons/fa";
import CreateCommentForm from "@/features/comments/components/create-comment-form";
import ReplyCommentForm from "@/features/comments/components/reply-comment-form";

interface TaskCommentProps {
  task: Task;
}

export const TaskComment = ({ task }: TaskCommentProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const taskId = task.$id;
  const { data: comments = [], isPending } = useGetComments({ taskId });

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
        {isEditing ? <CreateCommentForm task={task} /> : <div>{}</div>}

        {isPending ? <PageLoader /> : <CommentsList data={comments} />}
      </div>
    </div>
  );
};

interface CommentsListProps {
  data: AppComment[];
}

const CommentsList = ({ data }: CommentsListProps) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  return (
    <ul className="flex flex-col gap-y-4 bg-gray-100 rounded-lg p-4">
      {data.map((comment) => (
        <li key={comment.$id} className="flex gap-x-4">
          {/* Avatar */}
          <MemberAvatar
            name={comment.authorName}
            className="size-8 flex-shrink-0"
          />

          {/* Comment body */}
          <div className="flex-1 rounded-lg bg-white p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
              <p className="text-sm font-semibold text-gray-800">
                {comment.authorName}
              </p>
              <div className="flex items-center text-xs text-gray-500">
                <CalendarIcon className="size-3 mr-1" />
                <span className="truncate">
                  {formatDistanceToNow(new Date(comment.$updatedAt))} ago
                </span>
              </div>
            </div>

            <p className="mt-2 text-sm text-gray-700">{comment.content}</p>

            {/* Action buttons */}
            <div className="pt-4 flex items-center gap-4">
              <CornerUpLeftIcon
                size="16"
                className="cursor-pointer"
                onClick={() =>
                  setReplyingTo(replyingTo === comment.$id ? null : comment.$id)
                }
              />
              <ThumbsUpIcon size="16" className="cursor-pointer" />
              <TrashIcon size="16" className="cursor-pointer" />
            </div>

            {/* Reply form - indented */}
            {replyingTo === comment.$id && (
              <div className="mt-3 ml-10">
                <ReplyCommentForm data={comment.$id} />
              </div>
            )}
          </div>
        </li>
      ))}

      {data.length === 0 && (
        <li className="text-sm text-gray-500 text-center">
          No comments found
        </li>
      )}
    </ul>
  );
};
