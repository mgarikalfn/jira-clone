"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Divide, ImageIcon } from "lucide-react";
import z from "zod";
import {useRef} from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { AvatarFallback } from "@radix-ui/react-avatar";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DottedSeparator } from "@/components/ui/dotted-separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";

import { useCreateTask } from "../api/use-create-task";
import { cn } from "@/lib/utils";
import { createTaskSchema } from "../schemas";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { DatePicker } from "@/components/ui/date-picker";
import { SelectTrigger, SelectValue } from "@radix-ui/react-select";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { Task, TaskStatus } from "../types";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useUpdateTask } from "../api/use-update-task";


interface EditTaskFormProps{
    onCancel?:() => void;
    projectOptions:{id:string ,name:string , imageUrl:string}[];
    memberOptions:{id:string, name:string}[];
    initialValues:Task;
}

export const EditTaskForm = ({onCancel,projectOptions,memberOptions , initialValues}:EditTaskFormProps)=>{

    const workspaceId = useWorkspaceId();
    const {mutate,isPending} = useUpdateTask();
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

  const formSchema = createTaskSchema.omit({ workspaceId: true ,description:true});

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
     ...initialValues,
     dueDate:initialValues.dueDate? new Date(initialValues.dueDate) : undefined,
    },
});



    const onSubmit = (values:z.infer<typeof formSchema>) => {

        mutate({json:values,param:{taskId:initialValues.$id}} , {
            onSuccess: ({data}) => {
                form.reset();
                onCancel?.();
                //Todo : redirect to new task
            }
        });
    };

    return (
        <Card className="w-full h-full border-none shadow-none">
            <CardHeader className="flex p-7">
                <CardTitle className="text-xl font-bold">
                    Edit a  task
                </CardTitle>
            </CardHeader>
            <div className="px-7">
                <DottedSeparator/>
            </div>
            <CardContent className="p-7">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-y-4"> 
                        <FormField
                          control={form.control}
                          name="name"
                          render={({field}) => (
                            <FormItem>
                                <FormLabel>
                                    task Name
                                </FormLabel>
                                <FormControl>
                                    <Input
                                    {...field}
                                    placeholder="Enter task name"
                                    />
                                </FormControl>
                            </FormItem>
                          )}
                          />
                        <FormField
                          control={form.control}
                          name="dueDate"
                          render={({field}) => (
                            <FormItem>
                                <FormLabel>
                                    Due Date
                                </FormLabel>
                                <FormControl>
                                   <DatePicker {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                          )}
                          />

                        <FormField
                          control={form.control}
                          name="assigneeId"
                          render={({field}) => (
                            <FormItem>
                                <FormLabel>
                                    Assignee
                                </FormLabel>
                                <Select 
                                 defaultValue={field.value}
                                 onValueChange={field.onChange}
                                >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="select assignee"/>
                                    </SelectTrigger>
                                </FormControl>
                                <FormMessage/>
                                <SelectContent>
                                    {memberOptions.map((member) => (
                                        <SelectItem key={member.id} value={member.id}>
                                            <div className="flex items-center gap-x-2">
                                                <MemberAvatar className="size-6" name={member.name}/>
                                                {member.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                            </FormItem>
                          )}
                          />

                        <FormField
                          control={form.control}
                          name="status"
                          render={({field}) => (
                            <FormItem>
                                <FormLabel>
                                    Status
                                </FormLabel>
                                <Select 
                                 defaultValue={field.value}
                                 onValueChange={field.onChange}
                                >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="select status"/>
                                    </SelectTrigger>
                                </FormControl>
                                <FormMessage/>
                                <SelectContent>
                                   <SelectItem value={TaskStatus.BACKLOG}>
                                    Backlog
                                   </SelectItem>
                                   <SelectItem value={TaskStatus.IN_PROGRESS}>
                                    In Progress
                                   </SelectItem>
                                   <SelectItem value={TaskStatus.IN_REVIEW}>
                                    In Review
                                   </SelectItem>
                                   <SelectItem value={TaskStatus.TODO}>
                                    Todo
                                   </SelectItem>
                                   <SelectItem value={TaskStatus.DONE}>
                                    Done
                                   </SelectItem>
                                </SelectContent>
                                </Select>
                            </FormItem>
                          )}
                          />

                           <FormField
                          control={form.control}
                          name="projectId"
                          render={({field}) => (
                            <FormItem>
                                <FormLabel>
                                    Project
                                </FormLabel>
                                <Select 
                                 defaultValue={field.value}
                                 onValueChange={field.onChange}
                                >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="select project"/>
                                    </SelectTrigger>
                                </FormControl>
                                <FormMessage/>
                                <SelectContent>
                                    {projectOptions.map((project) => (
                                        <SelectItem key={project.id} value={project.id}>
                                            <div className="flex items-center gap-x-2">
                                                <ProjectAvatar className="size-6" name={project.name} image={project.imageUrl}/>
                                                {project.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                            </FormItem>
                          )}
                          />
                          
                          <DottedSeparator className="py-7"/>

                          <div className="flex items-center justify-between">
                            <Button 
                            type="button" 
                            size="lg"
                            variant="secondary"
                            onClick={onCancel}
                            disabled={isPending}
                            className={cn(!onCancel && "invisible")}
                            >
                                Cancel
                            </Button>
                             <Button 
                             type="submit" 
                             size="lg"
                           disabled={isPending}>
                                Save Changes
                            </Button>
                          </div>
                          </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}