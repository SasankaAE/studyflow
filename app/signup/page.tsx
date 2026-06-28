"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

// ← split into its own component so useSearchParams can be wrapped in Suspense
function SignupForm() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan") ?? ""

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }))
  }

  const handleSubmit = async () => {
    setError(null)
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError("All fields are required.")
      return
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: `${form.firstName} ${form.lastName}` },
        emailRedirectTo: `${location.origin}/auth/callback${plan ? `?plan=${plan}` : ""}`,
      },
    })
    setLoading(false)

    if (error) { setError(error.message); return }
    setSent(true)
  }

  return (
    <Card className="border-border/60 shadow-xl">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-center text-2xl font-bold">
          {sent ? "Check your email" : "Create an account"}
        </CardTitle>
        <CardDescription className="text-center">
          {sent
            ? "We sent a confirmation link to your inbox"
            : "Get started for free — no credit card required"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {sent ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="rounded-full bg-emerald-500/10 p-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Confirm your email address</p>
              <p className="text-xs text-muted-foreground">
                We sent a confirmation link to{" "}
                <span className="font-medium text-foreground">{form.email}</span>.
                Click the link in the email to activate your account.
              </p>
            </div>
            {plan === "pro" && (
              <p className="text-xs text-primary font-medium">
                After confirming, you'll be taken to the bank transfer page to activate Pro.
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Didn't receive it? Check your spam folder or{" "}
              <button
                className="underline underline-offset-4 hover:text-foreground transition-colors"
                onClick={() => setSent(false)}
              >
                try again
              </button>
              .
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" placeholder="John"
                  value={form.firstName} onChange={handleChange} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" placeholder="Doe"
                  value={form.lastName} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com"
                value={form.email} onChange={handleChange} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Min. 8 characters"
                value={form.password} onChange={handleChange} />
            </div>

            {error && (
              <p className="text-center text-sm text-destructive">{error}</p>
            )}

            <Button className="w-full" size="lg" onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="underline underline-offset-4 transition-colors hover:text-foreground">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline underline-offset-4 transition-colors hover:text-foreground">
                Privacy Policy
              </Link>.
            </p>
          </>
        )}
      </CardContent>

      <CardFooter className="justify-center border-t pt-4">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

// ← page just wraps SignupForm in Suspense
export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="pointer-events-none fixed top-0 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />

      <div className="w-full max-w-md space-y-6">
        <Link href="/" className="flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="h-7 w-7 text-primary">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="text-xl font-semibold tracking-tight">StudyFlow</span>
        </Link>

        {/* ← Suspense required by Next.js for useSearchParams in static pages */}
        <Suspense fallback={<div className="h-[500px] rounded-xl border border-border/60 animate-pulse bg-muted/30" />}>
          <SignupForm />
        </Suspense>
      </div>
    </div>
  )
}