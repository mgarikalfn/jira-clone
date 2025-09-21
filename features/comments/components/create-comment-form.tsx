import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"

import { Task } from "@/features/tasks/types";
import { MemberAvatar } from "@/features/members/components/member-avatar"
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCreateComment } from "../api/use-create-comment";


interface CreateCommentFormProps{
    task:Task
}

const CreateCommentForm = ({task}:CreateCommentFormProps) => {
    const [value, setValue] = useState(task.commentId?.content);
    const taskId = task.$id;
    const workspaceId = useWorkspaceId();
    const { mutate, isPending: isCreating } = useCreateComment();

    const handleSave = () => {
        mutate({
            json: { content: value, workspaceId: workspaceId },
            param: { taskId: taskId },
        });
    };

    return (
        <div className="flex items-center gap-4">
            <MemberAvatar name={task.name} className="size-8" />
            <div className="flex flex-col gap-y-4 flex-1">
                <Textarea
                    placeholder="Add a comment ..."
                    rows={4}
                    className="w-[400px] resize-none break-words"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={isCreating}
                />

                <Button size="sm" className="w-fit ml-auto" onClick={handleSave}>
                    {isCreating ? "commenting" : "comment"}
                </Button>
            </div>
        </div>
    )
}

export default CreateCommentForm