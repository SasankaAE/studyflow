import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Shield,
  CreditCard,
  UserCheck,
  AlertTriangle,
  Mail,
  ChevronRight,
  FileText,
} from "lucide-react";
import Link from "next/link";

const LAST_UPDATED = "June 17, 2025";
const EFFECTIVE_DATE = "June 17, 2025";
const CONTACT_EMAIL = "studyflow.aismart@gmail.com";
const COMPANY_NAME = "StudyFlow";

interface Section {
  id: string;
  icon: React.ElementType;
  title: string;
  content: React.ReactNode;
}

const sections: Section[] = [
  {
    id: "acceptance",
    icon: UserCheck,
    title: "Acceptance of Terms",
    content: (
      <p className="text-muted-foreground leading-relaxed">
        By creating an account or using StudyFlow, you agree to these Terms of
        Service and our{" "}
        <Link
          href="/privacy"
          className="text-primary underline-offset-4 hover:underline"
        >
          Privacy Policy
        </Link>
        . If you are under 18, a parent or guardian must review and agree on
        your behalf. If you do not agree with any part of these terms, please do
        not use our platform.
      </p>
    ),
  },
  {
    id: "account",
    icon: Shield,
    title: "Your Account",
    content: (
      <ul className="space-y-3 text-muted-foreground">
        {[
          "You must provide accurate information when creating your account.",
          "Keep your password secure. You are responsible for all activity under your account.",
          `Notify us immediately at ${CONTACT_EMAIL} if you suspect unauthorized access.`,
          "One account per person. Creating multiple accounts to bypass limits is not allowed.",
          "You must be at least 13 years old to use StudyFlow.",
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "usage",
    icon: BookOpen,
    title: "Acceptable Use",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground leading-relaxed">
          StudyFlow is built for students to learn and grow. To keep the
          platform safe and fair for everyone, you agree not to:
        </p>
        <ul className="space-y-3 text-muted-foreground">
          {[
            "Share, resell, or distribute any course content or materials.",
            "Use automated tools, bots, or scrapers to access the platform.",
            "Attempt to reverse-engineer or tamper with our AI features.",
            "Upload or share content that is harmful, offensive, or violates copyright.",
            "Impersonate another student, instructor, or StudyFlow staff.",
            "Use the platform for any purpose other than personal, educational use.",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: "payments",
    icon: CreditCard,
    title: "Payments & Subscriptions",
    content: (
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          StudyFlow offers free and premium plans. Payments are processed
          securely through OnePay and other supported Sri Lankan payment
          gateways.
        </p>
        <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-2">
          <p className="font-medium text-foreground text-sm">Billing details:</p>
          <ul className="space-y-2 text-sm">
            {[
              "Subscriptions renew automatically unless cancelled before the renewal date.",
              "Prices are shown in Sri Lankan Rupees (LKR) and include applicable taxes.",
              "You can cancel anytime from your account settings — no cancellation fees.",
              "Refunds are issued within 7 days of purchase if you have not accessed premium content.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "ip",
    icon: FileText,
    title: "Intellectual Property",
    content: (
      <p className="text-muted-foreground leading-relaxed">
        All content on StudyFlow — including lessons, AI-generated study guides,
        question banks, and UI — is owned by StudyFlow or its licensors. You
        receive a limited, non-transferable licence to use the platform for
        personal study. Your own notes and uploads remain yours; by uploading,
        you grant us permission to process them solely to provide the service.
      </p>
    ),
  },
  {
    id: "termination",
    icon: AlertTriangle,
    title: "Termination",
    content: (
      <p className="text-muted-foreground leading-relaxed">
        We may suspend or close your account if you violate these terms, engage
        in fraud, or if we are required to do so by law. You can delete your
        account at any time from Settings → Account. Upon termination, your
        access to premium content ends and your data is handled per our Privacy
        Policy.
      </p>
    ),
  },
  {
    id: "contact",
    icon: Mail,
    title: "Contact Us",
    content: (
      <div className="space-y-3 text-muted-foreground">
        <p className="leading-relaxed">
          Have a question about these terms? We are happy to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild variant="outline" size="sm">
            <a href={`mailto:${CONTACT_EMAIL}`}>
              <Mail className="mr-2 h-4 w-4" />
              {CONTACT_EMAIL}
            </a>
          </Button>
        </div>
      </div>
    ),
  },
];

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-normal">
                Legal
              </Badge>
              <Badge variant="outline" className="text-xs font-normal">
                Updated {LAST_UPDATED}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Terms of Service
            </h1>
            <p className="max-w-2xl text-muted-foreground leading-relaxed">
              These terms govern your use of {COMPANY_NAME}. We have written
              them to be straightforward — please read them carefully before
              using the platform.
            </p>
            <p className="text-sm text-muted-foreground">
              Effective date:{" "}
              <span className="font-medium text-foreground">{EFFECTIVE_DATE}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          {/* Sticky sidebar nav */}
          <aside className="hidden lg:block">
            <div className="sticky top-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                On this page
              </p>
              <nav className="flex flex-col gap-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <s.icon className="h-3.5 w-3.5 shrink-0" />
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex flex-col gap-6">
            {sections.map((section) => (
              <Card
                key={section.id}
                id={section.id}
                className="scroll-mt-6 border shadow-none"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <section.icon className="h-4 w-4 text-primary" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {section.title}
                    </h2>
                  </div>
                  {section.content}
                </CardContent>
              </Card>
            ))}

            {/* Footer note */}
            <div className="rounded-lg border border-border bg-muted/30 px-5 py-4 text-sm text-muted-foreground leading-relaxed mb-4">
              <strong className="text-foreground">Changes to these terms:</strong>{" "}
              We may update these Terms from time to time. When we do, we will
              update the date at the top of this page and notify you by email or
              an in-app notice. Continued use of StudyFlow after changes means
              you accept the updated terms.
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}