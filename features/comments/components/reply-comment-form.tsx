import { useTaskId } from "@/features/tasks/hooks/use-task-id";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useState } from "react";
import { useReplyComment } from "../api/use-reply-comment";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { useCurrent } from "@/features/auth/api/use-current";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ReplyCommentFormProps {
    data: string;
    
}

const ReplyCommentForm = ({ data }: ReplyCommentFormProps) => {
    const [value, setValue] = useState("");

    const taskId = useTaskId();
    const parentId = data;
    const workspaceId = useWorkspaceId();
    const { mutate, isPending } = useReplyComment();
    const { data: user } = useCurrent();


    if (!user) return null;

    const { name } = user;

    const handleSave = () => {
        mutate({
            json: { content: value, workspaceId: workspaceId },
            param: { taskId: taskId, parentId },
        });
    };

    return (
        <div className="flex items-center gap-4">
            <MemberAvatar name={name} className="size-8" />
            <div className="flex flex-col gap-y-4 flex-1">
                <Textarea
                    placeholder="Add a comment ..."
                    rows={4}
                    className="w-[400px] resize-none break-words"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={isPending}
                />

                <Button size="sm" className="w-fit ml-auto" onClick={handleSave}>
                    {isPending ? "replying" : "reply"}
                </Button>
            </div>
        </div>
    )
}

export default ReplyCommentForm