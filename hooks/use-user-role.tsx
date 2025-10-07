// hooks/use-user-role.ts
import { useQuery } from "@tanstack/react-query";
import { MemberRole } from "@/features/members/types";
import { client } from "@/lib/rpc";

interface UserRoleData {
  role: MemberRole;
  isLoading: boolean;
}

interface useUserRoleProps {
  workspaceId: string;
  userId: string;
}

export function useUserRole({ workspaceId, userId }: useUserRoleProps): UserRoleData {
  const { data, isLoading } = useQuery({
    queryKey: ["user-role", workspaceId, userId],
    queryFn: async (): Promise<MemberRole> => {
      if (!workspaceId || !userId) return MemberRole.GUEST;

      try {
        // Call the Hono API endpoint using the same client pattern
        const response = await client.api.members[":memberId"].$get({ 
          param: { memberId: userId } 
        });

        if (!response.ok) {
          throw new Error("Failed to fetch member role");
        }

        const { data } = await response.json();
        
        // Check if the member belongs to the requested workspace
        if (data.workspaceId !== workspaceId) {
          return MemberRole.GUEST;
        }

        return data.role as MemberRole;
      } catch (error) {
        console.error("Error fetching user role:", error);
        return MemberRole.GUEST;
      }
    },
    enabled: !!workspaceId && !!userId,
  });

  return {
    role: data || MemberRole.GUEST,
    isLoading,
  };
}