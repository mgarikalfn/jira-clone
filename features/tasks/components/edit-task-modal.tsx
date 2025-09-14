"use client";

import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";
import { CreateTaskFormWrapper } from "./create-task-form-wrapper";
import { useEditTaskModal } from "../hooks/use-edit-task-modal";
import { EditTaskFormWrapper } from "./edit-task-form-wrapper";

export const EditTaskModal = () => {
    const {taskId ,close} = useEditTaskModal();
    return(
        <ResponsiveModal open={!!taskId} onOpenChange={close}>
            {taskId && (
                <EditTaskFormWrapper id={taskId} onCancel={close}/>
            )}
        </ResponsiveModal>
    )
}