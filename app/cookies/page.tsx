import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Cookie,
  BarChart3,
  Settings2,
  ShieldCheck,
  Mail,
  Clock,
} from "lucide-react";

const LAST_UPDATED = "June 17, 2025";

const cookieTypes = [
  {
    icon: ShieldCheck,
    title: "Essential Cookies",
    badge: "Always Active",
    badgeVariant: "default" as const,
    description:
      "These cookies are required for StudyFlow to work. They handle your login session, keep you signed in, and protect your account from unauthorized access.",
    examples: [
      "Session token — keeps you logged in while studying",
      "CSRF token — protects form submissions from attacks",
      "Cookie consent preference — remembers your choice on this page",
    ],
  },
  {
    icon: BarChart3,
    title: "Analytics Cookies",
    badge: "Optional",
    badgeVariant: "secondary" as const,
    description:
      "Help us understand how students use StudyFlow — which features are helpful, where people get stuck, and how we can improve the experience.",
    examples: [
      "Page views and session duration",
      "Feature usage (e.g. flashcards, practice tests)",
      "Error tracking to fix bugs faster",
    ],
  },
  {
    icon: Settings2,
    title: "Preference Cookies",
    badge: "Optional",
    badgeVariant: "secondary" as const,
    description:
      "Remember your personal settings so you don't have to reconfigure them every visit.",
    examples: [
      "Dark / light mode preference",
      "Language and region setting",
      "Dashboard layout and pinned subjects",
    ],
  },
];

const sections = [
  {
    title: "What is a cookie?",
    content:
      "A cookie is a small text file saved to your browser when you visit a website. It lets the site remember information about your visit — like whether you're logged in or what settings you've chosen. Cookies don't contain viruses and can't access other files on your device.",
  },
  {
    title: "How long do cookies last?",
    content:
      "Session cookies disappear when you close your browser. Persistent cookies stay until they expire or you delete them. Essential cookies on StudyFlow last up to 30 days. Analytics and preference cookies last up to 12 months.",
  },
  {
    title: "Third-party cookies",
    content:
      "StudyFlow uses a small number of trusted third-party services — such as an analytics provider — that may set their own cookies. These partners are contractually bound to use cookie data only on our behalf and never for their own advertising.",
  },
  {
    title: "Managing your cookies",
    content:
      "You can delete or block cookies at any time through your browser settings. Blocking essential cookies will prevent you from logging in. Blocking optional cookies won't affect core functionality, but some preferences won't be saved between visits.",
  },
];

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Cookie className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Legal
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            Cookie Policy
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-xl">
            StudyFlow uses cookies to keep your account secure and make the
            platform work better for you. Here&apos;s exactly what we use and
            why.
          </p>
          <div className="flex items-center gap-2 mt-5 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last updated: {LAST_UPDATED}</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10 p-6">

        {/* Cookie Types */}
        <section>
          <h2 className="text-xl font-semibold mb-1">Cookies we use</h2>
          <p className="text-muted-foreground text-sm p-5">
            We keep this list short on purpose — we only use what we genuinely need.
          </p>
          <div className="space-y-4">
            {cookieTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card key={type.title} className="border">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-muted">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <CardTitle className="text-base">{type.title}</CardTitle>
                      </div>
                      <Badge variant={type.badgeVariant} className="shrink-0 text-xs">
                        {type.badge}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm leading-relaxed pt-1">
                      {type.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Separator className="mb-3" />
                    <ul className="space-y-1.5">
                      {type.examples.map((ex) => (
                        <li
                          key={ex}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                          {ex}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <Separator />

        {/* Q&A Sections */}
        <section className="space-y-7">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-base font-semibold mb-2">{s.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {s.content}
              </p>
            </div>
          ))}
        </section>

        <Separator />

        {/* Browser guides */}
        <section>
          <h2 className="text-base font-semibold mb-2">
            How to manage cookies in your browser
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Follow your browser&apos;s own guide to clear or block cookies:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: "Chrome", url: "https://support.google.com/chrome/answer/95647" },
              { name: "Firefox", url: "https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" },
              { name: "Safari", url: "https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" },
              { name: "Edge", url: "https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" },
            ].map((b) => (
              <a
                key={b.name}
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-lg border px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-muted/40 transition-colors"
              >
                {b.name}
              </a>
            ))}
          </div>
        </section>

        <Separator />

        {/* Contact */}
        <section className="rounded-xl border bg-muted/20 p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold mb-1">Questions?</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If you have any questions about how StudyFlow uses cookies,
                email us at{" "}
                <a
                  href="mailto:privacy@studyflow.lk"
                  className="text-primary underline underline-offset-4 hover:opacity-80"
                >
                  privacy@studyflow.lk
                </a>
                . We&apos;ll respond within 2 business days.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}