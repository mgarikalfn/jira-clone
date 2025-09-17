"use client"; 

import { z } from "zod";

import Link from "next/link";
import { FcGoogle } from "react-icons/fc";

import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { DottedSeparator } from "@/components/ui/dotted-separator";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { registerSchema } from "../schemas";
import { useRegister } from "../api/use-register";
import { signUpWithGithub, signUpWithGoogle } from "@/lib/oauth";





export const SignUpCard = () => {
  const {mutate , isPending} = useRegister();
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const onSubmit = (value: z.infer<typeof registerSchema>) => {
  mutate({json : value })
};
  return (
    <Card className="w-full h-full md:w-[487px] border-none shadow-none">
      <CardHeader className="flex flex-col items-center justify-center text-center p-7">
        <CardTitle className="text-2xl">Sign Up</CardTitle>
        <CardDescription>
          By signing up , you agree to our {""}
          <Link href="/privacy">
            <span className="text-blue-700">Privacy Policy</span>
          </Link>
          {""}
          <Link href="/terms">
            <span className="text-blue-700">Terms of service</span>
          </Link>
        </CardDescription>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
       <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                    <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter email address"
                    disabled={false}
                  />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Input
                    type="password"
                    required
                    {...field}
                    placeholder="Enter password"
                    disabled={false}
                    min={8}
                    max={256}
                  />
                  <FormMessage/>
                </FormItem>
              )}
            />
            <FormField
            name="name"
            control={form.control}
            render={({field})=>(
              <FormItem>
                  <Input
                    type="text"
                    required
                    {...field}
                    placeholder="Enter username"
                    disabled={false}
                    min={8}
                    max={256}
                  />
                  <FormMessage/>
                </FormItem>
            )}
            />
             <Button disabled={isPending} size="lg" className="w-full">Sign Up</Button>
          </form>
        </Form>
      </CardContent>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7 flex flex-col gap-y-4">
        <Button
          onClick={() => signUpWithGoogle()}
          disabled={isPending}
          variant="secondary"
          size="lg"
          className="w-full"
        >
          <FcGoogle className="mr-2 size-5" />
          Login with Google
        </Button>
        <Button
          onClick={() => signUpWithGithub}
          disabled={isPending}
          variant="secondary"
          size="lg"
          className="w-full"
        >
          <FaGithub className="mr-2 size-5" />
          Login with GitHub
        </Button>
      </CardContent>

       <div className="px-7">
              <DottedSeparator/>
      </div>
      <CardContent className="p-7 flex items-center justify-center">
        <p>
            Already  have an account?
            <Link href="/sign-in">
            <span className="text-blue-700">&nbsp;Sign in</span>
            </Link>
        </p>
      </CardContent>
    </Card>
  );
};
