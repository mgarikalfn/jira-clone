"use client"
import { useGetProjects } from '@/features/projects/api/use-get-projects';
import { ProjectAvatar } from '@/features/projects/components/project-avatar';
import { useCreateProjectModal } from '@/features/projects/hooks/use-create-project-modal';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RiAddCircleFill } from 'react-icons/ri';
import { RoleGuard } from './role-guard';
import { MemberRole } from '@/features/members/types';
import { useCurrent } from '@/features/auth/api/use-current';

const Projects = () => {
    const projectId = null
    const pathname = usePathname();
    const {open} = useCreateProjectModal();
    const workspaceId = useWorkspaceId();
    const {data} =useGetProjects({workspaceId});
    const {data:user} = useCurrent();


  return (
    <div className='flex flex-col gap-y-2'>
        <div className='flex items-center justify-between'>
            <p className='text-xs uppercase text-neutral-500'>Projects</p>
            <RoleGuard role={MemberRole.ADMIN} workspaceId={workspaceId} userId={user?.$id} >

            <RiAddCircleFill onClick={open} className='size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition'/>
            </RoleGuard>
        </div>
        {data?.documents.map((project) => {
            const href = `/workspaces/${workspaceId}/projects/${project.$id}`
            const isActive = pathname === href

            return (
                <Link href={href} key={project.$id}>
                    <div className={cn(
                        "flex items-center gap-2.5 p-2.5 rounded-md hover:opacity-75 transition cursor-pointer text-neutral-500",
                        isActive && "bg-white shadow-sm hover:opacity-100 text-primary"
                    )}>
                        <ProjectAvatar image={project.imageUrl} name={project.name} className={''}/>
                        <span className='truncate'>{project.name}</span>
                    </div>
                </Link>
            )
        })}
    </div>
  )
}

export default Projects