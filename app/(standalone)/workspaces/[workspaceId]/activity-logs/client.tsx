"use client";

import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Plus,
  Pencil,
  Trash,
  MessageSquare,
  ArrowLeft,
  User,
  Calendar,
  FileText,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ReactNode, useMemo } from "react";
import { useGetProjectAnalyticsWorkload } from "@/features/projects/api/use-get-project-analytics-workload";
import { useProjectId } from "@/features/projects/hooks/use-project-id";

type ActivityLog = {
  $id: string;
  userEmail: string;
  userName: string;
  timestamp: string;
  entityType: string;
  entityName: string;
  entityId: string;
  action: string;
  changes: Record<string, unknown>;
};

interface ApiActivityLog {
  $id: string;
  userEmail: string;
  userName?: string;
  timestamp: string;
  entityType: string;
  entityName?: string;
  entityId: string;
  action: string;
  changes: Record<string, unknown>;
}

// Properly type the icon objects
const actionIcons: Record<string, ReactNode> = {
  create: <Plus className="w-4 h-4" />,
  update: <Pencil className="w-4 h-4" />,
  delete: <Trash className="w-4 h-4" />,
  comment: <MessageSquare className="w-4 h-4" />,
  login: <Activity className="w-4 h-4" />,
  logout: <Activity className="w-4 h-4" />,
};

const actionColors: Record<string, string> = {
  create: "bg-green-100 text-green-800 border-green-200",
  update: "bg-blue-100 text-blue-800 border-blue-200",
  delete: "bg-red-100 text-red-800 border-red-200",
  comment: "bg-purple-100 text-purple-800 border-purple-200",
  login: "bg-gray-100 text-gray-800 border-gray-200",
  logout: "bg-gray-100 text-gray-800 border-gray-200",
};

const entityIcons: Record<string, ReactNode> = {
  task: <FileText className="w-4 h-4" />,
  project: <FileText className="w-4 h-4" />,
  member: <User className="w-4 h-4" />,
  workspace: <Activity className="w-4 h-4" />,
  user: <User className="w-4 h-4" />,
};

const LoadingSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-10 w-[150px]" />
        <Skeleton className="h-8 w-[200px]" />
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-6">
            <CardContent className="p-0">
              <div className="flex items-start gap-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-[120px]" />
                    <Skeleton className="h-6 w-[80px] rounded-full" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const BackButton = ({ workspaceId }: { workspaceId: string }) => {
  const router = useRouter();
  
  return (
    <Button
      variant="ghost"
      onClick={() => router.push(`/workspaces/${workspaceId}`)}
      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to Workspace
    </Button>
  );
};

const ChangeItem = ({ field, value, getMemberName }: { field: string; value: any; getMemberName?: (id: string) => string }) => {
  const getDisplayValue = (val: any): string => {
    if ((field.toLowerCase() === "assigneeid" || field.toLowerCase() === "assignee") && typeof val === "string" && getMemberName) {
      return getMemberName(val);
    }
    if (val === null || val === undefined) return "None";
    if (typeof val === "boolean") return val ? "Yes" : "No";
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  };

  const getFieldIcon = (fieldName: string): ReactNode => {
    switch (fieldName.toLowerCase()) {
      case "assignee":
      case "assigneeid":
        return <User className="w-3 h-3" />;
      case "status":
        return <Activity className="w-3 h-3" />;
      case "duedate":
      case "date":
        return <Calendar className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  return (
    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2 min-w-[120px]">
        {getFieldIcon(field)}
        <span className="text-sm font-medium text-gray-700 capitalize">
          {field.replace(/([A-Z])/g, ' $1').toLowerCase()}
        </span>
      </div>
      <div className="flex-1">
        <span className="text-sm text-gray-900">{getDisplayValue(value)}</span>
      </div>
    </div>
  );
};

const StatusChange = ({ oldStatus, newStatus }: { oldStatus: string; newStatus: string }) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <Activity className="w-4 h-4 text-blue-600" />
      <div className="flex-1">
        <span className="text-sm font-medium text-blue-900">Status changed</span>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="bg-white text-gray-700">
            {oldStatus}
          </Badge>
          <span className="text-gray-500">→</span>
          <Badge variant="default" className="bg-blue-600 text-white">
            {newStatus}
          </Badge>
        </div>
      </div>
    </div>
  );
};

const AssigneeChange = ({ oldAssigneeId, newAssigneeId, getMemberName }: { oldAssigneeId: string; newAssigneeId: string; getMemberName: (id: string) => string }) => {
  const oldName = oldAssigneeId ? getMemberName(oldAssigneeId) : "";
  const newName = newAssigneeId ? getMemberName(newAssigneeId) : "";
  return (
    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
      <User className="w-4 h-4 text-green-600" />
      <div className="flex-1">
        <span className="text-sm font-medium text-green-900">
          {oldName ? "Reassigned" : "Assigned"}
        </span>
        <div className="flex items-center gap-2 mt-1">
          {oldName && (
            <>
              <span className="text-sm text-gray-600 line-through">{oldName}</span>
              <span className="text-gray-500">→</span>
            </>
          )}
          <span className="text-sm font-medium text-green-800">{newName}</span>
        </div>
      </div>
    </div>
  );
};

// Helper function to safely check if an object has from/to properties
const hasFromToProperties = (obj: unknown): obj is { from: unknown; to: unknown } => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'from' in obj &&
    'to' in obj
  );
};

const ActivityLogsPage = () => {
  const router = useRouter();
  const { workspaceId } = useParams() as { workspaceId: string };
  const projectId = useProjectId();

  const { data, isLoading, error } = useQuery({
    queryKey: ["activityLogs", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/activity-log?workspaceId=${workspaceId}`);
      if (!res.ok) throw new Error("Failed to fetch activity logs");
      const responseData = await res.json();

      return responseData.data.map((log: ApiActivityLog) => ({
        ...log,
        userEmail: log.userEmail,
        userName: log.userName || log.userEmail?.split('@')[0] || "User",
        entityName: log.entityName || log.entityId || "Unknown Entity",
        changes: log.changes,
      })) as ActivityLog[];
    },
  });

  // Fetch workload for the project to get assignee names
  const { data: workload } = useGetProjectAnalyticsWorkload({ projectId });
  // Memoize a map from userId to member name (like report-dashboard)
  const memberIdToName = useMemo(() => {
    if (!workload) return {};
    const map: Record<string, string> = {};
    for (const member of workload) {
      map[member.email] = member.name || member.email;
    }
    return map;
  }, [workload]);
  // Helper to get member name by id
  const getMemberName = (id: string) => memberIdToName[id] || id;

  if (isLoading) return <LoadingSkeleton />;
  if (error)
    return (
      <div className="max-w-4xl mx-auto p-6">
        <BackButton workspaceId={workspaceId} />
        <div className="mt-8 text-center text-red-500">
          Error loading activity logs: {error.message}
        </div>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <BackButton workspaceId={workspaceId} />
        <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {data?.map((log) => (
          <Card key={log.$id} className="p-6 hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex items-start gap-4">
                {/* User Avatar */}
                <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-semibold">
                    {log.userName?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  {/* Header Row */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-gray-900">{log.userName}</span>
                    
                    <Badge 
                      variant="outline" 
                      className={`flex items-center gap-1.5 ${actionColors[log.action] || "bg-gray-100 text-gray-800 border-gray-200"}`}
                    >
                      {actionIcons[log.action]}
                      <span className="capitalize">{log.action}</span>
                    </Badge>

                    <div className="flex items-center gap-1.5 text-gray-500">
                      {entityIcons[log.entityType]}
                      <span className="text-sm capitalize">{log.entityType}</span>
                    </div>

                    <span className="text-sm text-gray-500 ml-auto">
                      {format(new Date(log.timestamp), "MMM dd, yyyy")}
                    </span>
                  </div>

                  {/* Entity Name */}
                  <p className="text-gray-700">
                    <span className="font-medium">{log.entityName}</span>
                  </p>

                  {/* Changes */}
                  {Object.entries(log.changes).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Changes:</h4>
                      
                      {/* Special handling for status changes */}
                      {log.changes.status && typeof log.changes.status === "object" && hasFromToProperties(log.changes.status) ? (
                        <StatusChange 
                          oldStatus={String((log.changes.status as { from: unknown; to: unknown }).from)} 
                          newStatus={String((log.changes.status as { from: unknown; to: unknown }).to)} 
                        />
                      ) : null}
                      
                      {/* Special handling for assignee changes */}
                      {(
                        log.changes.assigneeId && 
                        hasFromToProperties(log.changes.assigneeId)
                      ) ? (
                        <AssigneeChange 
                          oldAssigneeId={String((log.changes.assigneeId as { from: unknown; to: unknown }).from)} 
                          newAssigneeId={String((log.changes.assigneeId as { from: unknown; to: unknown }).to)} 
                          getMemberName={getMemberName}
                        />
                      ) : null}
                      
                      {/* Regular changes */}
                      <div className="space-y-2">
                        {Object.entries(log.changes).map(([key, value]) => {
                          // Skip already handled special cases
                          if ((key === 'status' || key === 'assigneeId') && 
                              hasFromToProperties(value)) {
                            return null;
                          }
                          
                          return <ChangeItem key={key} field={key} value={value} getMemberName={getMemberName} />;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {data?.length === 0 && (
          <Card className="p-12 text-center">
            <CardContent className="space-y-4">
              <Activity className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900">No activity yet</h3>
              <p className="text-gray-500">
                Activity in this workspace will appear here once team members start working.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ActivityLogsPage;