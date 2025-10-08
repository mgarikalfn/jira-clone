import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {Inter} from "next/font/google";
import {Toaster} from "@/components/ui/sonner";
import "./globals.css";
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import {cn} from "@/lib/utils"
import {QueryProvider} from '@/components/query-provider'
const inter = Inter({subsets:[
  "latin"
]})
export const metadata: Metadata = {
  title: "Project Manager",
  description: "effective project managment system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(inter.className,"antialiased min-h-screen")}
      >
        <QueryProvider>
          <Toaster/>
        <NuqsAdapter>{children}</NuqsAdapter>
        </QueryProvider>
      </body>
    </html>
  );
}
