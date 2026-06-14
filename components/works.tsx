// components/HowItWorksSection.tsx
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UserPlus, LayoutDashboard, BrainCircuit } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Create your account",
    description:
      "Sign up in seconds — no credit card required. Set up your profile and you're ready to start studying right away.",
  },
  {
    step: "02",
    icon: LayoutDashboard,
    title: "Log in to your dashboard",
    description:
      "Access your personalized dashboard with all your subjects, notes, papers, and AI chat in one organized place.",
  },
  {
    step: "03",
    icon: BrainCircuit,
    title: "Study smarter",
    description:
      "Chat with AI tutors, review past papers, organize notes, and track your progress — all designed to help you learn faster.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative px-6 py-24 md:py-36">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-16">
        <Badge
          variant="outline"
          className="mb-4 px-4 py-1.5 text-sm rounded-full border-border/60 bg-background/80"
        >
          How it works
        </Badge>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-foreground">
          Up and running in minutes
        </h2>
        <p className="mt-4 max-w-xl text-muted-foreground text-lg leading-relaxed">
          Three simple steps to transform how your team works — no steep
          learning curve, no complicated setup.
        </p>
      </div>

      {/* Steps */}
      <div className="relative mx-auto max-w-5xl">
        {/* Connector line — desktop only */}
        <div className="hidden md:block absolute top-[72px] left-[calc(16.666%+32px)] right-[calc(16.666%+32px)] h-px">
          <Separator className="w-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {steps.map(({ step, icon: Icon, title, description }) => (
            <Card
              key={step}
              className="relative group border border-border/60 bg-card/50 backdrop-blur hover:border-primary/40 hover:bg-card transition-all duration-300"
            >
              <CardContent className="flex flex-col items-center text-center p-8 gap-4">
                {/* Step number + icon */}
                <div className="relative flex items-center justify-center">
                  {/* Outer ring */}
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-border/60 bg-background group-hover:border-primary/50 group-hover:bg-primary/5 transition-all duration-300">
                    <Icon className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                  </div>
                  {/* Step badge */}
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {step.replace("0", "")}
                  </span>
                </div>

                <Separator className="w-8 opacity-40" />

                {/* Text */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}