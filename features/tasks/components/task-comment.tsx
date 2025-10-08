import { MemberAvatar } from "@/features/members/components/member-avatar";
import { Task } from "../types";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  CalendarIcon,
  HeartIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { DottedSeparator } from "@/components/ui/dotted-separator";
import { useGetComments } from "@/features/comments/api/use-get-comments";
import { formatDistanceToNow } from "date-fns";
import { PageLoader } from "@/components/page-loader";
import { AppComment } from "@/features/comments/types";
import CreateCommentForm from "@/features/comments/components/create-comment-form";

import { useDeleteComment } from "@/features/comments/api/use-delete-comment";
import { useCurrent } from "@/features/auth/api/use-current";
import { useConfirm } from "@/hooks/use-confirm";
import { useToggleCommentLike } from "@/features/comments/api/use-toggle-like-comment";

interface TaskCommentProps {
  task: Task;
}

export const TaskComment = ({ task }: TaskCommentProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const taskId = task.$id;
  const { data: comments = [], isPending } = useGetComments({ taskId });

  return (
    <div>
      <div className="p-4 border rounded-lg">
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
            {isEditing ? "Cancel" : "Comment"}
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
  const { data: currentUser } = useCurrent();

  return (
    <ul className="flex flex-col gap-y-4 bg-gray-100 rounded-lg p-4">
      {data.map((comment) => (
        <CommentItem
          key={comment.$id}
          comment={comment}
          currentUserId={currentUser?.$id}
        />
      ))}
    </ul>
  );
};

interface CommentItemProps {
  comment: AppComment;
  currentUserId?: string;
}

const CommentItem = ({
  comment,
  currentUserId,
}: CommentItemProps) => {
  const toggleLike = useToggleCommentLike();
  const deleteComment = useDeleteComment();
  
  // UseConfirm hook for delete confirmation
  const [DeleteConfirm, confirmDelete] = useConfirm(
    "Delete Comment",
    "Are you sure you want to delete this comment? This action cannot be undone.",
    "destructive"
  );

  const isLiked = false; // You'll need to get this from your comment data
  const canDelete = comment.authorId === currentUserId;

  const handleLikeToggle = () => {
    toggleLike.mutate({ commentId: comment.$id });
  };

  const handleDeleteClick = async () => {
    const ok = await confirmDelete();

    if (!ok) return;

    deleteComment.mutate(
      { param: { commentId: comment.$id } }
    );
  };

  return (
    <>
      <DeleteConfirm />
      <li className="flex flex-col gap-y-2">
        <div className="flex gap-x-4">
          <MemberAvatar
            name={comment.authorName}
            className="size-8 flex-shrink-0"
          />
          <div className="flex-1 rounded-lg bg-white p-4 shadow-sm">
            {/* Author + date */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                <p className="text-sm font-semibold text-gray-800">
                  {comment.authorName}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <CalendarIcon className="size-3 mr-1" />
                  <span>
                    {formatDistanceToNow(new Date(comment.$updatedAt))} ago
                  </span>
                </div>
              </div>
              
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteClick}
                  disabled={deleteComment.isPending}
                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  <Trash2Icon className="size-4" />
                </Button>
              )}
            </div>

            {/* Comment text */}
            <p className="mt-2 text-sm text-gray-700">{comment.content}</p>

            {/* Actions */}
            <div className="pt-4 flex items-center gap-4">
              {/* Like button */}
              <button
                onClick={handleLikeToggle}
                disabled={toggleLike.isPending}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  isLiked 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-gray-500 hover:text-gray-700'
                } disabled:opacity-50`}
              >
                <HeartIcon 
                  size="16" 
                  fill={isLiked ? "currentColor" : "none"} 
                />
                Like
                {toggleLike.isPending && "..."}
              </button>

              {/* Like count - you'll need to add this to your comment data */}
              {/* <span className="text-xs text-gray-500">
                {comment.likeCount || 0} likes
              </span> */}
            </div>
          </div>
        </div>
      </li>
    </>
  );
};