"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Sparkles, RotateCcw, Square, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  useOpenRouter,
  DEFAULT_CONFIG,
  OpenRouterConfig,
} from "@/hooks/useOpenRouter"
import { ChatConfig } from "@/components/ChatConfig"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const suggestions = [
  "Summarize a research paper",
  "Explain a concept simply",
  "Write a Python script",
  "Compare two topics",
]

export default function ChatPage() {
  const [config, setConfig] = useState<OpenRouterConfig>(DEFAULT_CONFIG)
  const bottomRef = useRef<HTMLDivElement>(null)

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

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return
    setInput("")
    await sendMessage(text.trim())
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-2">
        <span className="max-w-[200px] truncate font-mono text-xs text-muted-foreground">
          {config.model}
        </span>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" title="Settings">
              <Settings2 className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 p-0" aria-describedby={undefined}>
            <VisuallyHidden>
              <SheetTitle>Chat Settings</SheetTitle>
            </VisuallyHidden>
            <ChatConfig
              config={config}
              onChange={setConfig}
              onClear={clearMessages}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-6 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-6 text-center">
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
                  className="cursor-pointer px-3 py-1.5 text-xs transition-colors hover:bg-accent"
                  onClick={() => handleSend(s)}
                >
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 pb-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" && "flex-row-reverse"
                )}
              >
                <Avatar className="mt-0.5 h-8 w-8 shrink-0">
                  <AvatarFallback className="text-xs">
                    {msg.role === "user" ? "U" : "AI"}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                    msg.role === "user"
                      ? "rounded-tr-sm bg-primary text-primary-foreground"
                      : "rounded-tl-sm bg-muted text-foreground"
                  )}
                >
                  {msg.content || (
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

            {/* Standalone loading bubble when no streaming content yet */}
            {isLoading &&
              messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs">AI</AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
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
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border bg-background p-4">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearMessages}
              title="Clear chat"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          <Textarea
            placeholder="Ask anything…"
            className="max-h-32 min-h-[44px] resize-none text-sm"
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
              onClick={stopGeneration}
              title="Stop"
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="icon"
              disabled={!input.trim()}
              onClick={() => handleSend(input)}
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
