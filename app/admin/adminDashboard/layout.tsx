"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard, CreditCard, FileUp,
  Menu, LogOut, ShieldAlert,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
}

const NAV: NavItem[] = [
  { href: "/admin/dashboard",                label: "Overview",      icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/admin/dashboard/bank-transfers", label: "Bank Transfers", icon: <CreditCard className="h-4 w-4" /> },
  { href: "/admin/dashboard/upload",         label: "Upload Paper",  icon: <FileUp className="h-4 w-4" /> },
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
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  // Exact match for overview, prefix match for sub-pages
  const isActive = (href: string) => {
    if (href === "/admin/dashboard") return pathname === href
    return pathname.startsWith(href)
  }

  const currentLabel = NAV.find((n) => isActive(n.href))?.label ?? "Dashboard"

  return (
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
          "fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-border bg-card transition-transform duration-200 md:static md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="flex h-14 items-center gap-2.5 border-b border-border px-5">
          <StudyFlowLogo className="h-6 w-6" />
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">StudyFlow</p>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldAlert className="h-2.5 w-2.5 text-red-400" />
              <p className="text-[10px] text-red-400 leading-tight font-medium">Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {NAV.map((item) => (
            <button
              key={item.href}
              onClick={() => {
                router.push(item.href)
                setSidebarOpen(false)
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sign out */}
        <div className="border-t border-border p-3">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
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
  )
}