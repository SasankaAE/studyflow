import { useState, useCallback, useRef } from "react";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface OpenRouterConfig {
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  streaming: boolean;
}

export const DEFAULT_CONFIG: OpenRouterConfig = {
  model: "openai/gpt-4o-mini",
  systemPrompt: "You are a helpful assistant.",
  temperature: 0.7,
  maxTokens: 1024,
  streaming: true,
};

export const OPENROUTER_MODELS = [
  { id: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
  { id: "openai/gpt-4o", label: "GPT-4o" },
  { id: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
  { id: "anthropic/claude-3-haiku", label: "Claude 3 Haiku" },
  { id: "google/gemini-2.0-flash-001", label: "Gemini 2.0 Flash" },
  { id: "meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B" },
  { id: "mistralai/mistral-nemo", label: "Mistral Nemo" },
  { id: "deepseek/deepseek-chat", label: "DeepSeek Chat" },
];

export function useOpenRouter(config: OpenRouterConfig) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (userInput: string) => {
      if (!userInput.trim() || isLoading) return;

      const userMsg: Message = { role: "user", content: userInput.trim() };
      const history = [...messages, userMsg];
      setMessages(history);
      setIsLoading(true);
      setError(null);

      abortRef.current = new AbortController();

      const body = {
        model: config.model,
        messages: [
          ...(config.systemPrompt
            ? [{ role: "system", content: config.systemPrompt }]
            : []),
          ...history,
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        stream: config.streaming,
      };

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.error || `HTTP ${res.status}`);
        }

        if (config.streaming) {
          const reader = res.body?.getReader();
          const decoder = new TextDecoder();
          let assistantContent = "";

          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "" },
          ]);

          while (reader) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

            for (const line of lines) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content || "";
                assistantContent += delta;
                setMessages((prev) => [
                  ...prev.slice(0, -1),
                  { role: "assistant", content: assistantContent },
                ]);
              } catch {
                // skip malformed chunks
              }
            }
          }
        } else {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content || "";
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content },
          ]);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Something went wrong");
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsLoading(false);
      }
    },
    [messages, config, isLoading]
  );

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, stopGeneration, clearMessages };
}