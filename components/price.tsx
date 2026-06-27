// components/PricingSection.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check, Zap, Landmark } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "LKR 0",
    period: "forever",
    description: "Perfect for individuals getting started.",
    badge: null,
    features: [
      "20 AI chat messages",
      "5 downloads",
      "Access to all subjects",
      "Basic analytics",
      "Community support",
    ],
    cta: "Get started free",
    href: "/signup",
    variant: "outline" as const,
    highlight: false,
  },
  {
    name: "Pro",
    price: "LKR 1000",
    period: "per month",
    description: "For students who need more power.",
    badge: "Most Popular",
    features: [
      "Unlimited AI chat messages",
      "Unlimited downloads",
      "Access to all subjects",
      "Advanced analytics",
      "Priority support",
      "Custom integrations",
    ],
    cta: "Get started with Pro",
    href: "/signup?plan=pro",
    variant: "default" as const,
    highlight: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="relative px-6 py-24 md:py-32">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[400px] w-[700px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Header */}
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <Badge
          variant="outline"
          className="mb-4 gap-1.5 rounded-full border-border/60 px-4 py-1.5 text-sm font-medium"
        >
          <Zap className="h-3.5 w-3.5 text-primary" />
          Simple Pricing
        </Badge>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Start free, scale when ready
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          No hidden fees. No surprises. Upgrade or downgrade at any time.
        </p>
      </div>

      {/* Cards */}
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative flex flex-col transition-all duration-300 ${
              plan.highlight
                ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]"
                : "border-border/60"
            }`}
          >
            {/* Popular badge */}
            {plan.badge && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <Badge className="gap-1 rounded-full px-3 py-1 text-xs font-semibold">
                  <Zap className="h-3 w-3" />
                  {plan.badge}
                </Badge>
              </div>
            )}

            <CardHeader className="pb-4 pt-8">
              <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
              <CardDescription className="text-sm">
                {plan.description}
              </CardDescription>

              {/* Price */}
              <div className="mt-4 flex items-end gap-1">
                <span className="text-5xl font-extrabold tracking-tight text-foreground">
                  {plan.price}
                </span>
                <span className="mb-1.5 text-sm text-muted-foreground">
                  / {plan.period}
                </span>
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="flex-1 pt-6">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        plan.highlight
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-6">
              <Button
                variant={plan.variant}
                size="lg"
                className="w-full text-base"
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>

              {/* Bank Transfer option — Pro only */}
              {plan.highlight && (
                <>
                  <div className="flex items-center gap-2 w-full">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground shrink-0">or pay via</span>
                    <Separator className="flex-1" />
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full text-base gap-2 border-dashed"
                    asChild
                  >
                    <Link href="/upgrade/bank-transfer">
                      <Landmark className="h-4 w-4" />
                      Bank Transfer (LKR 1000)
                    </Link>
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Manual verification · usually activated within a few hours
                  </p>
                </>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Footer note */}
      <p className="mt-12 text-center text-sm text-muted-foreground">
        All plans include SSL security &nbsp;·&nbsp; 99.9% uptime SLA &nbsp;·&nbsp; GDPR compliant
      </p>
    </section>
  );
}