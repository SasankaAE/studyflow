"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  LayoutDashboard,
  MessageSquare,
  FileDown,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Bell,
} from "lucide-react"

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "AI Chat", href: "/dashboard/chat", icon: MessageSquare },
  { label: "Papers", href: "/dashboard/papers", icon: FileDown },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single()
      setUser({
        name: profile?.full_name ?? user.email ?? "User",
        email: profile?.email ?? user.email ?? "",
      })
    }
    load()
  }, [])

  const initials =
    user?.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?"

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar */}
        <aside
          className={cn(
            "flex shrink-0 flex-col border-r border-border bg-card transition-all duration-300 ease-in-out",
            collapsed ? "w-16" : "w-60"
          )}
        >
          {/* Logo */}
          <div
            className={cn(
              "flex h-16 items-center gap-3 border-b border-border px-4",
              collapsed && "justify-center px-0"
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
              <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
            </div>
            {!collapsed && (
              <span className="text-sm font-semibold tracking-tight">
                StudyFlow
              </span>
            )}
          </div>

          {/* Nav */}
          <ScrollArea className="flex-1 py-4">
            <nav className="flex flex-col gap-1 px-2">
              {navItems.map(({ label, href, icon: Icon }) => {
                const active = pathname === href
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
                )
                return collapsed ? (
                  <Tooltip key={href}>
                    <TooltipTrigger asChild>{btn}</TooltipTrigger>
                    <TooltipContent side="right">{label}</TooltipContent>
                  </Tooltip>
                ) : (
                  btn
                )
              })}
            </nav>
          </ScrollArea>

          <Separator />

          {/* Bottom: Avatar + Collapse */}
          <div
            className={cn(
              "flex items-center gap-3 p-4",
              collapsed && "flex-col justify-center gap-2 p-2"
            )}
          >
            {!collapsed && (
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src="" />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
            )}
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">
                  {user?.name ?? "..."}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email ?? "..."}
                </p>
              </div>
            )}
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Topbar */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6">
            <h1 className="text-sm font-semibold text-foreground">
              {navItems.find((n) => n.href === pathname)?.label ?? "Dashboard"}
            </h1>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  )
}
