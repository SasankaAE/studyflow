"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import { cn } from "@/lib/utils"

interface MarkdownMessageProps {
  content: string
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <div className="w-full min-w-0 overflow-hidden">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p({ children, ...props }) {
            return (
              <p
                {...props}
                className="mb-2 w-full break-words whitespace-pre-wrap last:mb-0"
              >
                {children}
              </p>
            )
          },
          pre({ children, ...props }) {
            return (
              <pre
                {...props}
                className="my-2 w-full max-w-full overflow-x-auto rounded-lg bg-black/30 p-3 text-xs leading-relaxed sm:text-sm"
              >
                {children}
              </pre>
            )
          },
          code({ children, className, ...props }) {
            const isInline = !className
            return isInline ? (
              <code
                {...props}
                className="break-all rounded bg-black/20 px-1 py-0.5 font-mono text-xs"
              >
                {children}
              </code>
            ) : (
              <code
                {...props}
                className={cn(
                  "block w-full whitespace-pre font-mono text-xs sm:text-sm",
                  className
                )}
              >
                {children}
              </code>
            )
          },
          ul({ children, ...props }) {
            return (
              <ul
                {...props}
                className="mb-2 ml-4 list-disc space-y-1 last:mb-0"
              >
                {children}
              </ul>
            )
          },
          ol({ children, ...props }) {
            return (
              <ol
                {...props}
                className="mb-2 ml-4 list-decimal space-y-1 last:mb-0"
              >
                {children}
              </ol>
            )
          },
          li({ children, ...props }) {
            return (
              <li {...props} className="break-words text-sm leading-relaxed">
                {children}
              </li>
            )
          },
          h1({ children, ...props }) {
            return (
              <h1
                {...props}
                className="mb-2 mt-3 text-base font-bold leading-tight first:mt-0"
              >
                {children}
              </h1>
            )
          },
          h2({ children, ...props }) {
            return (
              <h2
                {...props}
                className="mb-2 mt-3 text-sm font-bold leading-tight first:mt-0"
              >
                {children}
              </h2>
            )
          },
          h3({ children, ...props }) {
            return (
              <h3
                {...props}
                className="mb-1 mt-2 text-sm font-semibold first:mt-0"
              >
                {children}
              </h3>
            )
          },
          blockquote({ children, ...props }) {
            return (
              <blockquote
                {...props}
                className="my-2 border-l-2 border-muted-foreground/40 pl-3 italic text-muted-foreground"
              >
                {children}
              </blockquote>
            )
          },
          table({ children, ...props }) {
            return (
              <div className="my-2 w-full overflow-x-auto">
                <table
                  {...props}
                  className="w-full border-collapse text-xs sm:text-sm"
                >
                  {children}
                </table>
              </div>
            )
          },
          th({ children, ...props }) {
            return (
              <th
                {...props}
                className="border border-border bg-muted px-2 py-1 text-left font-semibold"
              >
                {children}
              </th>
            )
          },
          td({ children, ...props }) {
            return (
              <td
                {...props}
                className="break-words border border-border px-2 py-1"
              >
                {children}
              </td>
            )
          },
          a({ children, href, ...props }) {
            return (
              <a
                {...props}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-primary underline underline-offset-2 hover:opacity-80"
              >
                {children}
              </a>
            )
          },
          hr({ ...props }) {
            return <hr {...props} className="my-3 border-border" />
          },
          strong({ children, ...props }) {
            return (
              <strong {...props} className="font-semibold">
                {children}
              </strong>
            )
          },
          em({ children, ...props }) {
            return (
              <em {...props} className="italic">
                {children}
              </em>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}