"use client";

import { OpenRouterConfig, OPENROUTER_MODELS, DEFAULT_CONFIG } from "@/hooks/useOpenRouter";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChatConfigProps {
  config: OpenRouterConfig;
  onChange: (config: OpenRouterConfig) => void;
  onClear: () => void;
}

export function ChatConfig({ config, onChange, onClear }: ChatConfigProps) {
  const update = <K extends keyof OpenRouterConfig>(key: K, value: OpenRouterConfig[K]) =>
    onChange({ ...config, [key]: value });

  const reset = () => onChange(DEFAULT_CONFIG);

  return (
    <aside className="flex h-full w-full max-w-sm flex-col gap-6 overflow-y-auto border-l border-border bg-background p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm text-foreground">Chat Settings</h2>
        <Button variant="ghost" size="sm" onClick={reset} className="h-auto p-0 text-xs text-muted-foreground">
          Reset
        </Button>
      </div>

      <Separator />

      {/* Model */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Model</Label>
        <Select value={config.model} onValueChange={(val) => update("model", val)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {OPENROUTER_MODELS.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* System Prompt */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
          System Prompt
        </Label>
        <Textarea
          value={config.systemPrompt}
          onChange={(e) => update("systemPrompt", e.target.value)}
          rows={4}
          placeholder="You are a helpful assistant."
          className="resize-none text-sm"
        />
      </div>

      {/* Temperature */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Temperature
          </Label>
          <span className="text-xs font-mono tabular-nums">{config.temperature.toFixed(1)}</span>
        </div>
        <div className="w-full px-1">
          <Slider
            min={0}
            max={2}
            step={0.1}
            value={[config.temperature]}
            onValueChange={([val]) => update("temperature", val)}
            className="w-full"
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Precise</span>
          <span>Creative</span>
        </div>
      </div>

      {/* Max Tokens */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Max Tokens
          </Label>
          <span className="text-xs font-mono tabular-nums">{config.maxTokens}</span>
        </div>
        <div className="w-full px-1">
          <Slider
            min={256}
            max={4096}
            step={256}
            value={[config.maxTokens]}
            onValueChange={([val]) => update("maxTokens", val)}
            className="w-full"
          />
        </div>
      </div>

      {/* Streaming */}
      <div className="flex items-center justify-between">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Streaming</Label>
        <Switch
          checked={config.streaming}
          onCheckedChange={(val) => update("streaming", val)}
        />
      </div>

      <Separator />

      {/* Clear chat */}
      <Button
        variant="destructive"
        className="mt-auto w-full"
        onClick={onClear}
      >
        Clear conversation
      </Button>
    </aside>
  );
}