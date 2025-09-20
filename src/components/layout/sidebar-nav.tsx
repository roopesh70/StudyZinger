"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Calendar, LineChart, BrainCircuit } from "lucide-react";

import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter
} from "@/components/ui/sidebar";
import { MotivationalQuote } from "@/components/motivational-quote";

const links = [
  { href: "/", label: "Schedule", icon: Calendar },
  { href: "/progress", label: "Progress", icon: LineChart },
  { href: "/resources", label: "Resources", icon: BookOpen },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2">
          <BrainCircuit className="size-6 text-sidebar-primary" />
          <h1 className="text-xl font-bold text-sidebar-primary-foreground">StudyZinger</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {links.map((link) => (
            <SidebarMenuItem key={link.href}>
              <Link href={link.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === link.href}
                  className="w-full"
                >
                  <link.icon className="size-4" />
                  <span>{link.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <MotivationalQuote />
      </SidebarFooter>
    </>
  );
}
