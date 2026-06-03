// components/FeaturesSection.tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Zap,
  ShieldCheck,
  BarChart3,
  Layers,
  RefreshCw,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Optimized performance out of the box. Ship features at the speed your users expect.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by Default",
    description:
      "Enterprise-grade security baked in. Your data stays protected without extra configuration.",
  },
  {
    icon: BarChart3,
    title: "Powerful Analytics",
    description:
      "Real-time insights into what matters. Make data-driven decisions with confidence.",
  },
  {
    icon: Layers,
    title: "Modular Architecture",
    description:
      "Pick what you need, leave what you don't. A composable system that scales with you.",
  },
  {
    icon: RefreshCw,
    title: "Seamless Sync",
    description:
      "Keep everything in sync across devices and teammates. No conflicts, no friction.",
  },
  {
    icon: Users,
    title: "Built for Teams",
    description:
      "Roles, permissions, and collaboration tools designed for how modern teams actually work.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="px-6 py-24 md:py-32" >
      <div className="mx-auto max-w-6xl">

        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <Badge
            variant="outline"
            className="mb-4 px-4 py-1.5 text-sm rounded-full border-border/60 bg-background"
          >
            Features
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-foreground max-w-2xl">
            Everything you need,{" "}
            <span className="text-primary">nothing you don't</span>
          </h2>
          {/* <Separator className="mt-8 w-16 bg-primary/40" /> */}
          <p className="mt-6 max-w-xl text-muted-foreground text-lg leading-relaxed">
            A carefully crafted toolkit that removes complexity without
            sacrificing power. Built for teams who care about quality.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border-border/60 bg-card/50 backdrop-blur transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
              >
                {/* Subtle hover glow */}
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-primary/5 to-transparent" />

                <CardHeader className="pb-3">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 transition-colors group-hover:bg-primary/15">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base font-semibold">
                    {feature.title}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

      </div>
    </section>
  );
}