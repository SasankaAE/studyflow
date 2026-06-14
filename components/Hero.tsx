// components/HeroSection.tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center text-center px-6 py-28 md:py-40 overflow-hidden">

      {/* Background grid + radial fade */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: `
            linear-gradient(to bottom, transparent 60%, hsl(var(--background)) 100%),
            linear-gradient(hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 48px 48px, 48px 48px",
        }}
      />

      {/* Glow blob */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[420px] w-[620px] rounded-full bg-primary/10 blur-3xl -z-10" />

      {/* Announcement badge */}
      <Badge
        variant="outline"
        className="mb-6 gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full border-border/60 bg-background/80 backdrop-blur"
      >
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        Introducing StudyFlow 2.0
      </Badge>

      {/* Headline */}
      <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-foreground">
        Build something{" "}
        <span className="relative inline-block">
          <span className="relative z-10 text-primary">remarkable</span>
          <span
            className="absolute inset-x-0 bottom-1 -z-10 h-3 bg-primary/20 blur-sm rounded"
            aria-hidden
          />
        </span>{" "}
        faster than ever
      </h1>

      {/* Subheading */}
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
        StudyFlow helps school and university students organize notes, chat with AI tutors,
        manage past papers, and stay on top of every subject — all in one place.
      </p>

      {/* CTA Buttons */}
      <div className="mt-10 flex flex-col sm:flex-row items-center gap-3">
        <Button size="lg" className="px-8 gap-2 text-base" asChild>
          <Link href="/signup">
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button size="lg" variant="outline" className="px-8 text-base" asChild>
          <Link href="#how-it-works">See how it works</Link>
        </Button>
      </div>

      {/* Social proof */}
      <p className="mt-8 text-sm text-muted-foreground">
        No credit card required &nbsp;·&nbsp; Free plan available &nbsp;·&nbsp; Cancel anytime
      </p>

    </section>
  );
}