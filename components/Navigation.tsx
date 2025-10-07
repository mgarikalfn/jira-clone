"use client";

import { Activity, SettingsIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { GoCheckCircle, GoCheckCircleFill, GoHome, GoHomeFill } from "react-icons/go";
import { cn } from "@/lib/utils";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { usePathname } from "next/navigation";
import { RoleGuard } from "@/components/role-guard";
import { MemberRole } from "@/features/members/types";
import { useCurrent } from "@/features/auth/api/use-current";

const routes = [
  {
    label: "Home",
    href: "",
    icon: GoHome,
    activeIcon: GoHomeFill,
  },
  {
    label: "My Tasks",
    href: "/tasks",
    icon: GoCheckCircle,
    activeIcon: GoCheckCircleFill,
  },
  {
    label: "Members",
    href: "/members",
    icon: UsersIcon,
    activeIcon: UsersIcon,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: SettingsIcon,
    activeIcon: SettingsIcon,
    requiredRole: [MemberRole.ADMIN],
  },
  {
    label: "Activity Logs",
    href: "/activity-logs",
    icon: Activity,
    activeIcon: Activity,
    requiredRole: [MemberRole.ADMIN],
  },
];

interface NavigationItemProps {
  item: typeof routes[0];
  workspaceId: string;
  pathname: string;
}

const NavigationItem = ({ item, workspaceId, pathname }: NavigationItemProps) => {
  const fullHref = `/workspaces/${workspaceId}${item.href}`;
  const isActive = pathname === fullHref;
  const Icon = isActive ? item.activeIcon : item.icon;
  const {data:user} = useCurrent();
  const linkContent = (
    <div className={cn(
      "flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition text-neutral-500",
      isActive && "bg-white shadow-sm hover:opacity-100 text-primary"
    )}>
      <Icon className="size-5 text-neutral-500" />
      {item.label}
      {item.requiredRole && (
        <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded ml-auto">
          Admin
        </span>
      )}
    </div>
  );

  // If route requires specific role, wrap with RoleGuard
  if (item.requiredRole) {
    return (
      <RoleGuard 
        role={item.requiredRole} 
        workspaceId={workspaceId}
        userId={user?.$id}
        fallback={null}
      >
        <Link href={fullHref}>
          {linkContent}
        </Link>
      </RoleGuard>
    );
  }

  // Public route - no role restriction
  return (
    <Link href={fullHref}>
      {linkContent}
    </Link>
  );
};

export const Navigation = () => {
  const workspaceId = useWorkspaceId();
  const pathname = usePathname();

  return (
    <div className="flex flex-col">
      {routes.map((item) => (
        <NavigationItem
          key={item.href}
          item={item}
          workspaceId={workspaceId}
          pathname={pathname}
        />
      ))}
    </div>
  );
};