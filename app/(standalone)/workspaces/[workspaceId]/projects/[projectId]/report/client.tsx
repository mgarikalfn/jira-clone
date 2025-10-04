"use client";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { ProjectAnalytics } from "@/features/projects/components/project-analytics";
import ReportDashboard from "@/features/projects/components/report-dashboard";
import { useProjectId } from "@/features/projects/hooks/use-project-id";

export const ProjectIdReportClient = () => {
  const projectId = useProjectId();
 /*  const {data:initialValues , isLoading} = useGetProject({projectId});

  if (isLoading) {
    return <PageLoader />;
  }

  if (!initialValues) {
    return <PageError message="Project not found" />;
  }
 */
  return (
    <div>
        <ReportDashboard projectId={projectId} />
    </div>
  )
};
