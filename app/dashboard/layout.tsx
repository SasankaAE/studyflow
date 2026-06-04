"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  MessageSquare,
  FileDown,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
} from "lucide-react";

const navItems = [
  { label: "Overview",  href: "/dashboard",          icon: LayoutDashboard },
  { label: "AI Chat",   href: "/dashboard/chat",      icon: MessageSquare   },
  { label: "Papers",    href: "/dashboard/papers",    icon: FileDown        },
  { label: "Settings",  href: "/dashboard/settings",  icon: Settings        },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen bg-background overflow-hidden">

        {/* Sidebar */}
        <aside
          className={cn(
            "flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out shrink-0",
            collapsed ? "w-16" : "w-60"
          )}
        >
          {/* Logo */}
          <div className={cn("flex h-16 items-center border-b border-border px-4 gap-3", collapsed && "justify-center px-0")}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
              <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
            </div>
            {!collapsed && <span className="font-semibold text-sm tracking-tight">StudyFlow</span>}
          </div>

          {/* Nav */}
          <ScrollArea className="flex-1 py-4">
            <nav className="flex flex-col gap-1 px-2">
              {navItems.map(({ label, href, icon: Icon }) => {
                const active = pathname === href;
                const btn = (
                  <Button
                    key={href}
                    variant={active ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 text-sm font-medium",
                      collapsed && "justify-center px-0"
                    )}
                    asChild
                  >
                    <Link href={href}>
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && label}
                    </Link>
                  </Button>
                );
                return collapsed ? (
                  <Tooltip key={href}>
                    <TooltipTrigger asChild>{btn}</TooltipTrigger>
                    <TooltipContent side="right">{label}</TooltipContent>
                  </Tooltip>
                ) : btn;
              })}
            </nav>
          </ScrollArea>

          <Separator />

          {/* Bottom: Avatar + Collapse */}
          <div className={cn("flex items-center gap-3 p-4", collapsed && "justify-center flex-col gap-2 p-2")}>
            {!collapsed && (
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src="" />
                <AvatarFallback className="text-xs">JD</AvatarFallback>
              </Avatar>
            )}
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">John Doe</p>
                <p className="text-xs text-muted-foreground truncate">john@example.com</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Topbar */}
          <header className="flex h-16 items-center justify-between border-b border-border px-6 shrink-0 bg-background">
            <h1 className="text-sm font-semibold text-foreground">
              {navItems.find((n) => n.href === pathname)?.label ?? "Dashboard"}
            </h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">JD</AvatarFallback>
              </Avatar>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>

      </div>
    </TooltipProvider>
  );
}