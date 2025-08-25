import Link from "next/link"
import{ FcGoogle } from "react-icons/fc"
import {FaGithub} from 'react-icons/fa'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DottedSeparator } from "@/components/ui/dotted-separator";
import { Input } from "@/components/ui/input";

export const SignUpCard = () => {
  return (
    <Card className="w-full h-full md:w-[487px] border-none shadow-none">
      <CardHeader className="flex flex-col items-center justify-center text-center p-7">
        <CardTitle className="text-2xl">Sign Up</CardTitle>
        <CardDescription>
          By signing up , you agree to our {""}
          <Link href="/privacy">
           <span className="text-blue-700">Privacy Policy</span>
          </Link>{""}
          <Link href="/terms">
          <span className="text-blue-700">Terms of service</span>
          </Link>
        </CardDescription>
        
      </CardHeader>
       <div className="px-7">
        <DottedSeparator />
      </div> 
      <CardContent className="p-7">
        <form action="" className="space-y-4">
           <Input
            required
            type="text"
            value={""}
            onChange={() => {}}
            placeholder="Enter username"
            disabled={false}
          />
          <Input
            required
            type="email"
            value={""}
            onChange={() => {}}
            placeholder="Enter email address"
            disabled={false}
          />
          <Input
            required
            type="password"
            value={""}
            onChange={() => {}}
            placeholder="Enter password"
            disabled={false}
            min={8}
            max={256}
          />
          <Button disabled={false} size="lg" className="w-full">
            Login
          </Button>
        </form>
      </CardContent>
      <div className="px-7">
        <DottedSeparator/>
      </div>
      <CardContent className="p-7 flex flex-col gap-y-4">
        <Button disabled={false} variant="secondary" size="lg" className="w-full">
            <FcGoogle className="mr-2 size-5"/>
            Login with Google</Button>
         <Button disabled={false} variant="secondary" size="lg" className="w-full">
            <FaGithub className="mr-2 size-5"/>
            Login with GitHub</Button>
      </CardContent>
    </Card>
  );
};
