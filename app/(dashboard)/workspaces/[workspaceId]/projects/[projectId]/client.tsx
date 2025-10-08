"use client";

import Link from "next/link";
import { FileTextIcon, PencilIcon } from "lucide-react";

import { useGetProject } from "@/features/projects/api/use-get-project";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { TaskViewSwitcher } from "@/features/tasks/components/task-view-switcher";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { useGetProjectAnalytics } from "@/features/projects/api/use-get-project-analytics";
import { Analytics } from "@/components/analytics";
import { RoleGuard } from "@/components/role-guard";
import { MemberRole } from "@/features/members/types";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCurrent } from "@/features/auth/api/use-current";

export const ProjectIdClient = () => {
  const projectId = useProjectId();
  const workspaceId = useWorkspaceId();
  const { data: user } = useCurrent();
  const { data: project, isLoading: isLoadingProject } = useGetProject({
    projectId,
  });
  const { data: analytics, isLoading: isLoadingAnalytics } =
    useGetProjectAnalytics({ projectId });

  const isLoading = isLoadingAnalytics || isLoadingProject;

  if (isLoading) {
    return <PageLoader />;
  }

  if (!project) {
    return <PageError message="project not found" />;
  }
  if (!user) {
    return <PageError message="user not found" />;
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <ProjectAvatar
            name={project.name}
            image={project.imageUrl}
            className="size-8"
          />
          <p className="text-lg font-semibold">{project.name}</p>
        </div>
        <div className="flex gap-2">
          <RoleGuard
            role={MemberRole.ADMIN}
            workspaceId={workspaceId}
            userId={user.$id}
          >
            <Button variant="secondary" size="sm" asChild>
              <Link
                href={`/workspaces/${project.workspaceId}/projects/${project.$id}/settings`}
              >
                <PencilIcon className="size-4 mr-2" />
                Edit Project
              </Link>
            </Button>
          </RoleGuard>

          <RoleGuard
            role={MemberRole.ADMIN}
            workspaceId={workspaceId}
            userId={user.$id}
          >
            <Button variant="secondary" size="sm" asChild>
              <Link
                href={`/workspaces/${project.workspaceId}/projects/${project.$id}/report`}
              >
                <FileTextIcon className="size-4 mr-2" />
                Project Report
              </Link>
            </Button>
          </RoleGuard>
        </div>
      </div>
      {analytics ? <Analytics data={analytics} /> : null}
      <TaskViewSwitcher hideProjectFilter />
    </div>
  );
};

export default ProjectIdClient;
