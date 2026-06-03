// components/FAQSection.tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

const faqs = [
  {
    question: "What is MyApp and who is it for?",
    answer:
      "MyApp is a productivity platform designed for teams of all sizes. Whether you're a solo founder or a growing enterprise, MyApp helps you streamline workflows, collaborate in real-time, and ship faster.",
  },
  {
    question: "Is there a free plan available?",
    answer:
      "Yes! Our free plan includes up to 3 projects, 5 team members, and 5GB of storage. No credit card required to get started.",
  },
  {
    question: "Can I upgrade or downgrade my plan at any time?",
    answer:
      "Absolutely. You can upgrade, downgrade, or cancel your subscription at any time from your account settings. Changes take effect at the start of your next billing cycle.",
  },
  {
    question: "How does billing work?",
    answer:
      "We offer monthly and annual billing. Annual plans come with a 20% discount. You'll be charged at the start of each billing period, and invoices are sent to your registered email.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Security is our top priority. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We are SOC 2 Type II certified and conduct regular third-party security audits.",
  },
  {
    question: "Do you offer customer support?",
    answer:
      "Yes. Free plan users have access to our community forum and documentation. Pro and Enterprise users get priority email and live chat support with guaranteed response times.",
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="relative px-6 py-24 md:py-32">
      {/* Background subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-background via-transparent to-background" />

      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center text-center">
          <Badge
            variant="outline"
            className="mb-4 rounded-full border-border/60 bg-background/80 px-4 py-1 text-sm font-medium"
          >
            FAQ
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Everything you need to know about MyApp. Can't find an answer?{" "}
            <a
              href="/contact"
              className="text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
            ></a>
            Reach out to us.
          </p>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="rounded-lg border border-border/60 bg-card px-6 shadow-sm transition-shadow hover:shadow-md data-[state=open]:shadow-md"
            >
              <AccordionTrigger className="py-5 text-left text-base font-medium hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
