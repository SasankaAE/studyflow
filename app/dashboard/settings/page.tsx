"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  User,
  Shield,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { usePlan } from "@/hooks/usePlan"

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const { plan, usage, limits, loading: planLoading } = usePlan()

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  })
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [upgradingPlan, setUpgradingPlan] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)
  const [passwordMsg, setPasswordMsg] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single()
      if (data) {
        const parts = (data.full_name ?? "").split(" ")
        setProfile({
          firstName: parts[0] ?? "",
          lastName: parts.slice(1).join(" "),
          email: data.email ?? user.email ?? "",
        })
      }
      setLoadingProfile(false)
    }
    load()
  }, [])

  const initials =
    [profile.firstName[0], profile.lastName[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "?"

  const handleSaveProfile = async () => {
    setProfileMsg(null)
    setSavingProfile(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    const full_name = `${profile.firstName} ${profile.lastName}`.trim()
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name, email: profile.email })
      .eq("id", user.id)
    if (profile.email !== user.email)
      await supabase.auth.updateUser({ email: profile.email })
    setSavingProfile(false)
    setProfileMsg(
      profileError
        ? { type: "error", text: profileError.message }
        : { type: "success", text: "Profile updated." }
    )
  }

  const handleChangePassword = async () => {
    setPasswordMsg(null)
    if (!passwords.next || passwords.next !== passwords.confirm) {
      setPasswordMsg({ type: "error", text: "Passwords do not match." })
      return
    }
    if (passwords.next.length < 8) {
      setPasswordMsg({
        type: "error",
        text: "Password must be at least 8 characters.",
      })
      return
    }
    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({
      password: passwords.next,
    })
    setSavingPassword(false)
    setPasswordMsg(
      error
        ? { type: "error", text: error.message }
        : { type: "success", text: "Password updated." }
    )
    if (!error) setPasswords({ current: "", next: "", confirm: "" })
  }

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure? This cannot be undone.")) return
    setDeletingAccount(true)
    await fetch("/api/auth/delete-account", { method: "DELETE" })
    await supabase.auth.signOut()
    router.push("/login")
  }

  const handleUpgrade = () => {
    router.push("/pricing")
  }

  const chatPct =
    limits.chatsPerMonth === Infinity
      ? 0
      : Math.min(Math.round((usage.chats / limits.chatsPerMonth) * 100), 100)
  const paperPct =
    limits.downloadsPerMonth === Infinity
      ? 0
      : Math.min(
          Math.round((usage.papers / limits.downloadsPerMonth) * 100),
          100
        )

  return (
    <div className="max-w-2xl space-y-6 p-6">
      <div>
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your account preferences.
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-3">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <CardTitle className="text-sm">Profile</CardTitle>
            <CardDescription className="text-xs">
              Update your personal information
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingProfile ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">First name</Label>
                  <Input
                    value={profile.firstName}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, firstName: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Last name</Label>
                  <Input
                    value={profile.lastName}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, lastName: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs">Email</Label>
                  <Input
                    value={profile.email}
                    type="email"
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, email: e.target.value }))
                    }
                  />
                </div>
              </div>
              {profileMsg && (
                <div
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                    profileMsg.type === "success"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {profileMsg.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  {profileMsg.text}
                </div>
              )}
              <Button
                size="sm"
                onClick={handleSaveProfile}
                disabled={savingProfile}
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Plan */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-3">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <div>
            <CardTitle className="text-sm">Plan & usage</CardTitle>
            <CardDescription className="text-xs">
              Your current plan and monthly usage
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {planLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Current plan</span>
                  <Badge
                    variant={plan === "pro" ? "default" : "secondary"}
                    className="text-xs capitalize"
                  >
                    {plan}
                  </Badge>
                </div>
                {plan === "free" && (
                  <Button size="sm" onClick={handleUpgrade}>
                    Upgrade to Pro
                  </Button>
                )}
              </div>

              <Separator />

              {/* Chats usage */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Chats this month</span>
                  <span>
                    {usage.chats} /{" "}
                    {limits.chatsPerMonth === Infinity
                      ? "∞"
                      : limits.chatsPerMonth}
                  </span>
                </div>
                {limits.chatsPerMonth !== Infinity && (
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${chatPct >= 90 ? "bg-destructive" : "bg-primary"}`}
                      style={{ width: `${chatPct}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Downloads usage */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Downloads this month</span>
                  <span>
                    {usage.papers} /{" "}
                    {limits.downloadsPerMonth === Infinity
                      ? "∞"
                      : limits.downloadsPerMonth}
                  </span>
                </div>
                {limits.downloadsPerMonth !== Infinity && (
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${paperPct >= 90 ? "bg-destructive" : "bg-primary"}`}
                      style={{ width: `${paperPct}%` }}
                    />
                  </div>
                )}
              </div>

              {plan === "free" && (
                <p className="text-xs text-muted-foreground">
                  Upgrade to Pro for unlimited chats and downloads.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-3">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <div>
            <CardTitle className="text-sm">Security</CardTitle>
            <CardDescription className="text-xs">
              Manage your account security
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">New password</Label>
              <Input
                type="password"
                placeholder="Min. 8 characters"
                value={passwords.next}
                onChange={(e) =>
                  setPasswords((p) => ({ ...p, next: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Confirm new password</Label>
              <Input
                type="password"
                placeholder="Repeat password"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords((p) => ({ ...p, confirm: e.target.value }))
                }
              />
            </div>
            {passwordMsg && (
              <div
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                  passwordMsg.type === "success"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {passwordMsg.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                {passwordMsg.text}
              </div>
            )}
            <Button
              size="sm"
              onClick={handleChangePassword}
              disabled={savingPassword}
            >
              {savingPassword ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Updating…
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-destructive">Danger zone</p>
            <p className="mt-0.5 mb-3 text-xs text-muted-foreground">
              This action is irreversible
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
            >
              {deletingAccount ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete account"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
