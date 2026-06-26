"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  LayoutDashboard, CreditCard, FileUp,
  Menu, LogOut, ShieldAlert,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
}

const NAV: NavItem[] = [
  { href: "/admin/adminDashboard",                label: "Overview",       icon: LayoutDashboard },
  { href: "/admin/adminDashboard/bank-transfers", label: "Bank Transfers", icon: CreditCard },
  { href: "/admin/adminDashboard/upload",         label: "Upload Paper",   icon: FileUp },
]

// ─── Logo ─────────────────────────────────────────────────────────────────────

function StudyFlowLogo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-primary", className)}
    >
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  )
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  // Exact match for overview, prefix match for sub-pages
  const isActive = (href: string) => {
    if (href === "/admin/adminDashboard") return pathname === href
    return pathname.startsWith(href)
  }

  const currentLabel = NAV.find((n) => isActive(n.href))?.label ?? "Dashboard"

  return (
    <TooltipProvider delayDuration={200}>
    <div className="dark flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border bg-card transition-all duration-200 md:static md:translate-x-0",
          collapsed ? "w-[60px]" : "w-60",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className={cn(
          "flex h-14 items-center border-b border-border",
          collapsed ? "justify-center px-0" : "gap-2.5 px-5"
        )}>
          <StudyFlowLogo className="h-6 w-6 shrink-0" />
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold text-foreground leading-tight">StudyFlow</p>
              <div className="flex items-center gap-1 mt-0.5">
                <ShieldAlert className="h-2.5 w-2.5 text-red-400" />
                <p className="text-[10px] text-red-400 leading-tight font-medium">Admin</p>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className={cn("flex-1 space-y-0.5 py-4", collapsed ? "px-1.5" : "px-3")}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
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
                <Link href={href} onClick={() => setSidebarOpen(false)}>
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
            ) : btn
          })}
        </nav>

        {/* Collapse toggle (desktop only) + Sign out */}
        <div className={cn("border-t border-border p-3 space-y-0.5")}>
          {/* Collapse toggle — hidden on mobile since sidebar is overlay */}
          <Button
            variant="ghost"
            className={cn(
              "hidden w-full text-sm font-medium text-muted-foreground md:flex",
              collapsed ? "justify-center px-0" : "justify-start gap-3"
            )}
            onClick={() => setCollapsed((c) => !c)}
          >
            <Menu className="h-4 w-4 shrink-0" />
            {!collapsed && "Collapse"}
          </Button>

          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-center px-0 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign out</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign out
            </Button>
          )}
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar (mobile only) */}
        <header className="flex h-14 items-center gap-3 border-b border-border bg-card px-4 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-sm font-semibold text-foreground">{currentLabel}</span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
    </TooltipProvider>
  )
}