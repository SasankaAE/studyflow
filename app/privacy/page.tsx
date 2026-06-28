import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Eye,
  Lock,
  Users,
  RefreshCw,
  Mail,
  Database,
  Cookie,
  ChevronRight,
} from "lucide-react";

const lastUpdated = "June 17, 2025";

const sections = [
  {
    id: "information-we-collect",
    icon: Database,
    title: "Information We Collect",
    content: [
      {
        subtitle: "Account Information",
        text: "When you register on StudyFlow, we collect your name, email address, school or university name, and a securely hashed password. This information is required to create and manage your account.",
      },
      {
        subtitle: "Usage Data",
        text: "We automatically collect data about how you interact with the platform — such as pages visited, features used, study sessions started, and time spent. This helps us improve your learning experience.",
      },
      {
        subtitle: "Payment Information",
        text: "Payments are processed securely through OnePay. We do not store your card details. We only retain transaction references and subscription status needed to manage your plan.",
      },
    ],
  },
  {
    id: "how-we-use-it",
    icon: Eye,
    title: "How We Use Your Information",
    content: [
      {
        subtitle: "To Provide the Service",
        text: "We use your information to operate StudyFlow — including managing your account, delivering AI-powered study tools, processing payments, and sending service-related notifications.",
      },
      {
        subtitle: "To Improve StudyFlow",
        text: "Aggregated, anonymised usage data helps us understand which features are most helpful and where the experience can be improved. This data is never linked to individual users.",
      },
      {
        subtitle: "To Communicate With You",
        text: "We may send you updates about new features, maintenance windows, or changes to this policy. You can opt out of marketing emails at any time from your account settings.",
      },
    ],
  },
  {
    id: "data-sharing",
    icon: Users,
    title: "Data Sharing",
    content: [
      {
        subtitle: "We Do Not Sell Your Data",
        text: "Your personal information is never sold to third parties. Full stop.",
      },
      {
        subtitle: "Trusted Service Providers",
        text: "We share minimal necessary data with providers who help run StudyFlow — such as Supabase (database hosting), OnePay (payment processing), and OpenRouter (AI model access). Each provider is bound by a data processing agreement.",
      },
      {
        subtitle: "Legal Requirements",
        text: "We may disclose your information if required by Sri Lankan law or a valid legal order. We will notify you where legally permitted to do so.",
      },
    ],
  },
  {
    id: "data-security",
    icon: Lock,
    title: "Data Security",
    content: [
      {
        subtitle: "How We Protect Your Data",
        text: "All data is encrypted in transit using TLS. Passwords are hashed using bcrypt and never stored in plain text. Access to production databases is restricted to authorised team members only.",
      },
      {
        subtitle: "Breach Response",
        text: "In the unlikely event of a data breach that affects your personal information, we will notify you within 72 hours via the email address on your account.",
      },
    ],
  },
  {
    id: "cookies",
    icon: Cookie,
    title: "Cookies & Tracking",
    content: [
      {
        subtitle: "Essential Cookies",
        text: "We use cookies to maintain your login session and remember your preferences. These are strictly necessary for the platform to work and cannot be disabled.",
      },
      {
        subtitle: "Analytics",
        text: "We may use privacy-respecting analytics to understand platform usage in aggregate. No personally identifiable data is sent to analytics providers.",
      },
    ],
  },
  {
    id: "your-rights",
    icon: Shield,
    title: "Your Rights",
    content: [
      {
        subtitle: "Access & Portability",
        text: "You can request a copy of all personal data we hold about you at any time by contacting us.",
      },
      {
        subtitle: "Correction & Deletion",
        text: "You can update your profile information directly in your account settings. To delete your account and all associated data, go to Settings → Account → Delete Account.",
      },
      {
        subtitle: "Withdraw Consent",
        text: "Where we rely on your consent to process data, you can withdraw it at any time. This will not affect the lawfulness of processing before the withdrawal.",
      },
    ],
  },
  {
    id: "updates",
    icon: RefreshCw,
    title: "Policy Updates",
    content: [
      {
        subtitle: "When We Make Changes",
        text: "We may update this policy from time to time. When we do, we'll revise the 'Last Updated' date at the top of this page and notify you by email if the changes are significant. Continued use of StudyFlow after changes are posted means you accept the updated policy.",
      },
    ],
  },
  {
    id: "contact",
    icon: Mail,
    title: "Contact Us",
    content: [
      {
        subtitle: "Questions or Concerns",
        text: "If you have any questions about this Privacy Policy or how we handle your data, please reach out to us at sasankaakash22@gmail.com. We aim to respond within 3 business days.",
      },
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <Badge variant="secondary" className="text-xs font-medium">
              Legal
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl">
            We built StudyFlow to help Sri Lankan students learn better — not to
            profit from their data. This policy explains exactly what we collect,
            why, and how we keep it safe.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last updated:{" "}
            <span className="font-medium text-foreground">{lastUpdated}</span>
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex flex-col lg:flex-row gap-10">
        {/* Sticky sidebar nav */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              On this page
            </p>
            <nav className="flex flex-col gap-1">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1 rounded-md"
                >
                  <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {s.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="space-y-12">
            {sections.map((section, idx) => {
              const Icon = section.icon;
              return (
                <section key={section.id} id={section.id}>
                  <div className="flex items-center gap-3 mb-5 p-4">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">{section.title}</h2>
                  </div>

                  <div className="space-y-5 pl-11 p-4">
                    {section.content.map((item, i) => (
                      <div key={i}>
                        <h3 className="text-sm font-semibold text-foreground mb-1">
                          {item.subtitle}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  {idx < sections.length - 1 && (
                    <Separator className="mt-10" />
                  )}
                </section>
              );
            })}

            {/* Footer note */}
            <div className="rounded-xl border bg-muted/40 px-6 py-5 mt-4 mb-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                By using StudyFlow, you agree to this Privacy Policy. If you do
                not agree, please discontinue use of the platform. For any
                questions, email us at{" "}
                <a
                  href="mailto:studyflow.aismart@gmail.com"
                  className="text-primary underline underline-offset-4 hover:no-underline"
                >
                  studyflow.aismart@gmail.com
                </a>
                .
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}