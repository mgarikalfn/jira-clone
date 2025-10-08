import { Project } from "@/features/projects/types";
import { TaskStatus } from "../types";
import { cn } from "@/lib/utils";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useRouter } from "next/navigation";

interface EventCardProps{
    title:string;
    assignee:any;
    project:Project;
    status:TaskStatus;
    id:string;
};

const statusColorMap:Record<TaskStatus,string> ={
    [TaskStatus.BACKLOG]:"border-l-pink-500",
    [TaskStatus.TODO]:"border-l-red-500",
    [TaskStatus.IN_PROGRESS]:"border-l-yellow-500",
    [TaskStatus.IN_REVIEW]:"border-l-blue-500",
    [TaskStatus.DONE]:"border-l-emerald-500",
}

export const EventCard =({title,assignee,project,status,id}:EventCardProps) => {
    const workspaceId = useWorkspaceId();
    const router = useRouter();

    const onClick = (e:React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        router.push(`/workspaces/${workspaceId}/tasks/${id}`)
    }

    return (
       <div className="px-2">
    <div onClick={onClick} className={cn(
        "p-2 text-xs bg-white text-primary border rounded-md border-l-4 flex flex-col gap-y-2 cursor-pointer hover:opacity-75 transition",
        statusColorMap[status]
    )}>
        <p className="line-clamp-2 font-medium">{title}</p>
        <div className="flex flex-col gap-y-1.5">
            <div className="flex items-center gap-x-1.5">
                <MemberAvatar name={assignee?.name} className="size-4" />
                <span className="text-xs text-muted-foreground truncate">{assignee?.name}</span>
            </div>
            <div className="flex items-center gap-x-1.5">
                {/* <ProjectAvatar name={project?.name} image={project?.imageUrl} className="size-4" /> */}
                <span className="text-xs text-muted-foreground truncate">{project?.name}</span>
            </div>
        </div>
    </div>
</div>
    )
}