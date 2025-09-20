"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";

const titles: { [key: string]: string } = {
  "/": "Home",
  "/progress": "Your Progress",
  "/resources": "Study Resources",
};

export function Header() {
  const pathname = usePathname();
  const title = titles[pathname] || "Dashboard";

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="text-xl font-semibold md:text-2xl">{title}</h1>
    </header>
  );
}
