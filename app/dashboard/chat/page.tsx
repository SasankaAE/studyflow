"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Sparkles, RotateCcw, Square } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  useOpenRouter,
  DEFAULT_CONFIG,
  OpenRouterConfig,
} from "@/hooks/useOpenRouter"
import { MarkdownMessage } from "@/components/chat/markdown-message"

const suggestions = [
  "Summarize a research paper",
  "Explain a concept simply",
  "Write a Python script",
  "Compare two topics",
]

export default function ChatPage() {
  const [config, setConfig] = useState<OpenRouterConfig>(DEFAULT_CONFIG)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  // Plain div ref — we scroll this ourselves, not ScrollArea
  const scrollRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    stopGeneration,
    clearMessages,
  } = useOpenRouter(config)

  const [input, setInput] = useState("")

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`
  }, [input])

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return
    setInput("")
    await sendMessage(text.trim())
  }

  return (
    // overflow-hidden on root prevents ANY horizontal scroll on the page
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">

      {/* Header */}
      <div className="flex w-full shrink-0 items-center border-b border-border bg-background px-3 py-2 sm:px-4">
        <span className="min-w-0 truncate font-mono text-xs text-muted-foreground">
          {config.model}
        </span>
      </div>

      {/* Messages
          — plain div instead of shadcn ScrollArea
          — overflow-y-auto + overflow-x-hidden is the critical fix
          — w-full + min-w-0 prevents it from growing wider than parent */}
      <div
        ref={scrollRef}
        className="min-h-0 w-full flex-1 overflow-x-hidden overflow-y-auto"
      >
        <div className="w-full px-3 py-4 sm:px-6">
          {messages.length === 0 ? (
            <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-6 px-4 text-center sm:min-h-[400px]">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">How can I help you?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ask anything or pick a suggestion below.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((s) => (
                  <Badge
                    key={s}
                    variant="outline"
                    className="cursor-pointer px-3 py-2 text-xs transition-colors active:bg-accent sm:py-1.5 sm:hover:bg-accent"
                    onClick={() => handleSend(s)}
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-6 pb-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    // w-full + min-w-0 makes the row shrink to fit; never wider than container
                    "flex w-full min-w-0 gap-2 sm:gap-3",
                    msg.role === "user" && "flex-row-reverse"
                  )}
                >
                  <Avatar className="mt-0.5 h-7 w-7 shrink-0 sm:h-8 sm:w-8">
                    <AvatarFallback className="text-xs">
                      {msg.role === "user" ? "U" : "AI"}
                    </AvatarFallback>
                  </Avatar>

                  {/* Bubble:
                      - flex-1 min-w-0: fills remaining space, allows shrinking below content size
                      - overflow-hidden: clips anything that escapes
                      - NO percentage max-width: percentages on flex children are unreliable on mobile */}
                  <div
                    className={cn(
                      "flex-1 min-w-0 overflow-hidden rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed sm:px-4 sm:py-3",
                      msg.role === "user"
                        ? "rounded-tr-sm bg-primary text-primary-foreground"
                        : "rounded-tl-sm bg-muted text-foreground"
                    )}
                    // Cap width so user bubbles don't span 100%
                    style={{ maxWidth: "calc(100% - 36px)" }}
                  >
                    {msg.content ? (
                      isLoading &&
                      msg.role === "assistant" &&
                      i === messages.length - 1 ? (
                        <p
                          className="min-w-0"
                          style={{
                            wordBreak: "break-word",
                            overflowWrap: "anywhere",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {msg.content}
                        </p>
                      ) : (
                        <MarkdownMessage content={msg.content} />
                      )
                    ) : (
                      <span className="flex items-center gap-1.5">
                        {[0, 1, 2].map((j) => (
                          <span
                            key={j}
                            className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                            style={{ animationDelay: `${j * 150}ms` }}
                          />
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Standalone loading bubble */}
              {isLoading &&
                messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="flex gap-2 sm:gap-3">
                    <Avatar className="h-7 w-7 shrink-0 sm:h-8 sm:w-8">
                      <AvatarFallback className="text-xs">AI</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5 sm:px-4 sm:py-3">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                          style={{ animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                )}

              {error && (
                <p className="rounded-lg bg-destructive/10 px-4 py-2 text-center text-xs text-destructive">
                  {error}
                </p>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div
        className="w-full shrink-0 border-t border-border bg-background p-3 sm:p-4"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex w-full max-w-3xl items-end gap-2">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 shrink-0 sm:h-10 sm:w-10"
              onClick={clearMessages}
              title="Clear chat"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          <Textarea
            ref={textareaRef}
            placeholder="Ask anything…"
            // text-base = 16px — prevents iOS Safari from zooming on focus
            className="max-h-32 min-h-[44px] flex-1 resize-none text-base sm:text-sm"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend(input)
              }
            }}
          />
          {isLoading ? (
            <Button
              size="icon"
              variant="destructive"
              className="h-11 w-11 shrink-0 sm:h-10 sm:w-10"
              onClick={stopGeneration}
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="icon"
              className="h-11 w-11 shrink-0 sm:h-10 sm:w-10"
              disabled={!input.trim()}
              onClick={() => handleSend(input)}
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="mt-2 hidden text-center text-xs text-muted-foreground sm:block">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}