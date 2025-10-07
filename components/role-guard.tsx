// components/RoleGuard.tsx
import { ReactNode } from "react";
import { useUserRole } from "@/hooks/use-user-role";
import { MemberRole } from "@/features/members/types";
import LoadingPage from "@/app/loading";

interface RoleGuardProps {
  role: MemberRole | MemberRole[];
  workspaceId?: string;
  userId?:string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({
  role,
  workspaceId,
  userId,
  children,
  fallback = null,
}: RoleGuardProps) {
   
  if (!workspaceId || !userId) {
    return <>{fallback}</>;
  }

  const { role: userRole, isLoading } = useUserRole({ workspaceId, userId });

  if (isLoading) {
    return <LoadingPage/>
  }

  const allowedRoles = Array.isArray(role) ? role : [role];
  const hasAccess = userRole && allowedRoles.includes(userRole);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}