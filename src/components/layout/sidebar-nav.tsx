
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, LineChart, Target, MessageSquare } from "lucide-react";

import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter
} from "@/components/ui/sidebar";
import { MotivationalQuote } from "@/components/motivational-quote";
import { GraduationCap } from "lucide-react";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/targets", label: "Targets", icon: Target },
  { href: "/progress", label: "Progress", icon: LineChart },
  { href: "/resources", label: "Resources", icon: BookOpen },
  { href: "/ai-chat", label: "AI", icon: MessageSquare },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="size-8 text-accent" />
          <h1 className="font-script text-4xl text-white">zinger</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {links.map((link) => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === link.href}
                className="w-full"
                tooltip={link.label}
              >
                <Link href={link.href}>
                  <link.icon className="size-4" />
                  <span>{link.label}</span>
                </Link>
              </SidebarMenuButton>
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
