import Link from "next/link";
import Image from "next/image";
import { DottedSeparator } from "./ui/dotted-separator"
import {Navigation} from "./Navigation"
import { WorkspaceSwitcher } from "./workspace-switcher";
import Projects from "./Projects";
export const Sidebar = () =>{
    return (
        <aside className="h-full bg-neutral-100 p-4 w-full">
            
            <Link href = "/">
            <Image src="/Airlineslogo.png" alt="logo" width={168} height={32}/>
            </Link>
            <DottedSeparator className="my-4"/>
            <WorkspaceSwitcher />
            <DottedSeparator className="my-4"/>
            <Navigation/>
            <Projects/>
        </aside>
    )
}