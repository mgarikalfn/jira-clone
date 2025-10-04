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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0", "#FF6B6B"];

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
      low: "#00C49F",
      medium: "#FFBB28",
      high: "#FF8042",
      urgent: "#FF6B6B",
    };
    return colors[priority.toLowerCase()] || COLORS[0];
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Project Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive overview of task distribution and team performance
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center space-y-0 pb-4">
            <PieChartIcon className="w-5 h-5 mr-2 text-blue-500" />
            <CardTitle className="text-lg">Task Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={toChartData(initialValues.status)}
                    dataKey="value"
                    outerRadius={80}
                    innerRadius={40}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {toChartData(initialValues.status).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} tasks`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Priority Breakdown */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center space-y-0 pb-4">
            <Target className="w-5 h-5 mr-2 text-orange-500" />
            <CardTitle className="text-lg">Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={toChartData(initialValues.priority)}
                    dataKey="value"
                    outerRadius={80}
                    innerRadius={40}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {toChartData(initialValues.priority).map((entry, i) => (
                      <Cell key={i} fill={getPriorityColor(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} tasks`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Task Type Breakdown */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center space-y-0 pb-4">
            <Folder className="w-5 h-5 mr-2 text-green-500" />
            <CardTitle className="text-lg">Task Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={toChartData(initialValues.type)}
                    dataKey="value"
                    outerRadius={80}
                    innerRadius={40}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {toChartData(initialValues.type).map((_, i) => (
                      <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} tasks`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            <CardTitle>Team Performance Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4">Team Member</TableHead>
                  <TableHead className="text-center">Tasks Assigned</TableHead>
                  <TableHead className="text-center">Story Points</TableHead>
                  <TableHead className="text-center">Average Cycle Time</TableHead>
                  <TableHead className="text-center">Workload Distribution</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workload.map((member, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                            {member.name[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{member.name}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-32">
                            {member.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <Badge variant="secondary" className="text-sm">
                          {member.tasks}
                        </Badge>
                        <span className="text-xs text-muted-foreground mt-1">
                          {Number(member.percentage).toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">{member.storyPoints}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-4 h-4 text-green-500" />
                        <span className="font-medium">{member.cycleTime.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">days</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${member.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground min-w-10">
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {workload.reduce((sum, member) => sum + member.tasks, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {workload.reduce((sum, member) => sum + member.storyPoints, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Story Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {(workload.reduce((sum, member) => sum + member.cycleTime, 0) / workload.length).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Avg. Cycle Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {workload.length}
                </div>
                <div className="text-sm text-muted-foreground">Team Members</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportDashboard;