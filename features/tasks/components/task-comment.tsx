import { MemberAvatar } from "@/features/members/components/member-avatar";
import { Task } from "../types";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PencilIcon, XIcon } from "lucide-react";


interface TaskCommentProps{
    task:Task;
}

export const TaskComment = ({task}:TaskCommentProps) =>{
    const [isEditing,setIsEditing] = useState(false);
    return (
        <div>
            <MemberAvatar name={task.name} className="size-12"/>
            <div className="p-4 boarder rounded-lg">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">
                        Comments
                    </p>
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
                        {isEditing ? "Cancel" : "Edit"}
                        </Button>
                        
                </div>
            </div>
        </div>
    )
}