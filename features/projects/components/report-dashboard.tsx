"use client";

import { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { useGetProjectAnalytics } from "../api/use-get-project-analytics";
import LoadingPage from "@/app/loading";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useGetProjectAnalyticsWorkload } from "../api/use-get-project-analytics-workload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Users, Zap, AlertCircle, PieChart as PieChartIcon, Target, Folder } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// More pleasant color palette
const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#84CC16", "#F97316"];

// Soft pastel colors for charts
const PASTEL_COLORS = ["#A5B4FC", "#6EE7B7", "#FCD34D", "#FCA5A5", "#C4B5FD", "#67E8F9", "#BEF264", "#FDBA74"];

type ReportData = {
  status: Record<string, number>;
  priority: Record<string, number>;
  type: Record<string, number>;
};

interface ReportDashboardProps {
  projectId: string;
}

const ReportDashboard = ({ projectId }: ReportDashboardProps) => {
  const [report, setReport] = useState<ReportData | null>(null);
  const { data: initialValues, isLoading: isLoadingAnalytics } = useGetProjectAnalytics({ projectId });
  const { data: workload, isLoading: isLoadingWorkload } = useGetProjectAnalyticsWorkload({ projectId });

  if (isLoadingAnalytics || isLoadingWorkload) {
    return <LoadingPage />;
  }

  if (!initialValues || !workload) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <h3 className="text-lg font-medium">No analytics data available</h3>
        <p className="text-muted-foreground text-center">
          There's no data to display for this project yet.
        </p>
      </div>
    );
  }

  // Helper to convert object → array
  const toChartData = (obj: Record<string, number>) =>
    Object.entries(obj).map(([name, value]) => ({ name, value }));

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "#10B981",      // Emerald
      medium: "#F59E0B",   // Amber
      high: "#EF4444",     // Red
      urgent: "#DC2626",   // Dark Red
    };
    return colors[priority.toLowerCase()] || PASTEL_COLORS[0];
  };

  const getStatusColor = (status: string, index: number) => {
    const statusColors: Record<string, string> = {
      'todo': '#94A3B8',        // Slate
      'in progress': '#3B82F6', // Blue
      'in review': '#8B5CF6',   // Violet
      'done': '#10B981',        // Emerald
      'backlog': '#6B7280',     // Gray
    };
    return statusColors[status.toLowerCase()] || PASTEL_COLORS[index % PASTEL_COLORS.length];
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Project Analytics
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Comprehensive overview of task distribution and team performance
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Status Breakdown */}
        <Card className="col-span-1 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
          <CardHeader className="flex flex-row items-center space-y-0 pb-4 border-b">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-50">
                <PieChartIcon className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-gray-800">Task Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[28rem] min-w-[320px]"> {/* Increased height and set min-width */}
              <ResponsiveContainer width="99%" height="100%" minWidth={320} minHeight={400}>
                <PieChart>
                  <Pie
                    data={toChartData(initialValues.status)}
                    dataKey="value"
                    outerRadius={100} 
                    innerRadius={50}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                    paddingAngle={2}
                  >
                    {toChartData(initialValues.status).map((entry, i) => (
                      <Cell 
                        key={i} 
                        fill={getStatusColor(entry.name, i)}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} tasks`, 'Count']}
                    contentStyle={{ 
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    wrapperStyle={{ paddingLeft: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Priority Breakdown */}
        <Card className="col-span-1 shadow-lg border-0 bg-gradient-to-br from-white to-orange-50/30">
          <CardHeader className="flex flex-row items-center space-y-0 pb-4 border-b">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-50">
                <Target className="w-5 h-5 text-orange-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-gray-800">Priority Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[28rem] min-w-[320px]"> {/* Increased height and set min-width */}
              <ResponsiveContainer width="99%" height="100%" minWidth={320} minHeight={400}>
                <PieChart>
                  <Pie
                    data={toChartData(initialValues.priority)}
                    dataKey="value"
                    outerRadius={100} /* Increased radius */
                    innerRadius={50}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                    paddingAngle={2}
                  >
                    {toChartData(initialValues.priority).map((entry, i) => (
                      <Cell 
                        key={i} 
                        fill={getPriorityColor(entry.name)}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} tasks`, 'Count']}
                    contentStyle={{ 
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    wrapperStyle={{ paddingLeft: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Task Type Breakdown */}
        <Card className="col-span-1 shadow-lg border-0 bg-gradient-to-br from-white to-green-50/30">
          <CardHeader className="flex flex-row items-center space-y-0 pb-4 border-b">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-50">
                <Folder className="w-5 h-5 text-green-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-gray-800">Task Types</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[28rem] min-w-[320px]"> {/* Increased height and set min-width */}
              <ResponsiveContainer width="99%" height="100%" minWidth={320} minHeight={400}>
                <PieChart>
                  <Pie
                    data={toChartData(initialValues.type)}
                    dataKey="value"
                    outerRadius={100} /* Increased radius */
                    innerRadius={50}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                    paddingAngle={2}
                  >
                    {toChartData(initialValues.type).map((_, i) => (
                      <Cell 
                        key={i} 
                        fill={PASTEL_COLORS[(i + 2) % PASTEL_COLORS.length]}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} tasks`, 'Count']}
                    contentStyle={{ 
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    wrapperStyle={{ paddingLeft: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50/20">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-800">Team Performance Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50/80">
                <TableRow>
                  <TableHead className="w-1/4 font-semibold text-gray-700">Team Member</TableHead>
                  <TableHead className="text-center font-semibold text-gray-700">Tasks Assigned</TableHead>
                  <TableHead className="text-center font-semibold text-gray-700">Story Points</TableHead>
                  <TableHead className="text-center font-semibold text-gray-700">Average Cycle Time</TableHead>
                  <TableHead className="text-center font-semibold text-gray-700">Workload Distribution</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workload.map((member, idx) => (
                  <TableRow key={idx} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-b-0">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                          <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 text-sm font-medium">
                            {member.name[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{member.name}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-40">
                            {member.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <Badge variant="secondary" className="text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                          {member.tasks}
                        </Badge>
                        <span className="text-xs text-muted-foreground mt-1">
                          {Number(member.percentage).toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="font-medium text-gray-900">{member.storyPoints}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-4 h-4 text-emerald-500" />
                        <span className="font-medium text-gray-900">{member.cycleTime.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">days</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-full bg-gray-100 rounded-full h-2.5 flex-1">
                          <div
                            className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
                            style={{ width: `${member.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 min-w-12 text-right">
                          {Number(member.percentage).toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Summary Stats */}
          {workload.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-200">
              <div className="text-center p-4 rounded-lg bg-blue-50/50 border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">
                  {workload.reduce((sum, member) => sum + member.tasks, 0)}
                </div>
                <div className="text-sm text-blue-700 font-medium">Total Tasks</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-emerald-50/50 border border-emerald-100">
                <div className="text-2xl font-bold text-emerald-600">
                  {workload.reduce((sum, member) => sum + member.storyPoints, 0)}
                </div>
                <div className="text-sm text-emerald-700 font-medium">Total Story Points</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-amber-50/50 border border-amber-100">
                <div className="text-2xl font-bold text-amber-600">
                  {(workload.reduce((sum, member) => sum + member.cycleTime, 0) / workload.length).toFixed(1)}
                </div>
                <div className="text-sm text-amber-700 font-medium">Avg. Cycle Time</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-50/50 border border-purple-100">
                <div className="text-2xl font-bold text-purple-600">
                  {workload.length}
                </div>
                <div className="text-sm text-purple-700 font-medium">Team Members</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportDashboard;