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
    question: "What is StudyFlow and who is it for?",
    answer:
      "StudyFlow is an AI-powered study platform built for school and university students. It helps you organize notes, manage past papers, chat with AI tutors, and stay on top of every subject — all in one place.",
  },
  {
    question: "Is there a free plan available?",
    answer:
      "Yes! Our free plan gives you access to AI chat, note organization, and limited PDF storage. No credit card required to get started.",
  },
  {
    question: "How does the AI chat tutor work?",
    answer:
      "Our AI chat is powered by advanced language models and can explain concepts, answer questions from your study materials, summarize notes, and help you prepare for exams — available 24/7.",
  },
  {
    question: "Can I upgrade or downgrade my plan at any time?",
    answer:
      "Absolutely. You can upgrade, downgrade, or cancel your subscription at any time from your account settings. Changes take effect at the start of your next billing cycle.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. All your notes, files, and chat data are encrypted in transit and at rest. Only you (and admins, where applicable) can access your uploaded materials via secure signed URLs.",
  },
  {
    question: "Do you offer support for both school and university students?",
    answer:
      "Definitely. StudyFlow is designed to scale from school-level subjects to university coursework, with content organization and AI assistance tailored to your academic level.",
  },
  {
    question: "Do you offer customer support?",
    answer:
      "Yes. Free plan users have access to our help center and community forum. Premium users get priority email support with faster response times.",
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
            Everything you need to know about StudyFlow. Can't find an answer?{" "}
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
