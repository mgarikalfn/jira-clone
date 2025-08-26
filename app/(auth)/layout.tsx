"use client"

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";
interface LayoutPageProps {
    children: React.ReactNode;
}
const LayoutPage = ({ children }: LayoutPageProps) => {
    const pathname = usePathname();

    return (
        <main className="bg-neutral-100 min-h-screen">

            <div className="mx-auto max-w-screen-2xl p-4">
                <nav className="flex justify-between items-center">

                    <Image src="/logo.svg" height={30} width={50} alt="logo" />
                    <Button asChild variant="secondary">
                        <Link href={pathname === "/sign-in" ? "/sign-up" : "/sign-in"}>
                        {pathname === "/sign-in" ? "Sign Up" : "Login"}
                        </Link>
                        </Button>
                </nav>
                <div className="flex flex-col items-center justify-center pt-4 md:pt-14">
                    {children}
                </div>

            </div>

        </main>
    );
};

export default LayoutPage;
