"use client";
import { RiAddCircleFill } from "react-icons/ri";

import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { WorkspaceAvatar } from "@/features/workspaces/components/workspace-avatar";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCreateWorkspaceModal } from "@/features/workspaces/hooks/use-create-workspace-modal";
import { RoleGuard } from "./role-guard";
import { useCurrent } from "@/features/auth/api/use-current";
import { MemberRole } from "@/features/members/types";

export const WorkspaceSwitcher = () => {
  const workspaceId = useWorkspaceId();
  const { data: user } = useCurrent();
  const router = useRouter();
  const { data: workspaces } = useGetWorkspaces();
  const { open } = useCreateWorkspaceModal();

  const onselect = (id: string) => {
    router.push(`/workspaces/${id}`);
  };

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-neutral-500">Workspaces</p>
        <RoleGuard
          role={MemberRole.ADMIN}
          workspaceId={workspaceId}
          userId={user?.$id}
        >
          <RiAddCircleFill
            onClick={open}
            className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition"
          />
        </RoleGuard>
      </div>

      <Select onValueChange={onselect} value={workspaceId}>
        <SelectTrigger className="w-full bg-neutral-200 font-medium p-1">
          <SelectValue placeholder="No workspace selected" />
        </SelectTrigger>
        <SelectContent>
          {workspaces?.documents.map((workspace) => {
            console.log(workspace);
            return (
              <SelectItem key={workspace.$id} value={workspace.$id}>
                <div className="flex justify-start items-center gap-3 font-medium">
                  <WorkspaceAvatar
                    name={workspace.name}
                    image={workspace.imageUrl}
                    className={""}
                  />
                  <span className="truncate">{workspace.name}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};
