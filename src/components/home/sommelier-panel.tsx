"use client";

import { FormEvent, useMemo, useState } from "react";
import { AudioLines, Compass, Star } from "lucide-react";
import type { SiteSettings } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { SoftImage } from "@/components/ui/soft-image";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "ai"; text: string };

export function SommelierPanel({
  settings,
}: {
  settings: SiteSettings["sommelier"];
}) {
  const [selected, setSelected] = useState<string[]>(["Nutty", "Caramel"]);
  const [messages, setMessages] = useState<Message[]>([
    { role: "user", text: settings.chatPreview.user },
    { role: "ai", text: settings.chatPreview.ai },
  ]);
  const [openChat, setOpenChat] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedKey = useMemo(() => selected.slice().sort().join(","), [selected]);

  function toggleTag(tag: string) {
    setSelected((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag]
    );
  }

  async function startConversation() {
    setOpenChat(true);
    setError("");
    setLoading(true);
    try {
      const prompt =
        selected.length > 0
          ? `I'm in the mood for ${selected.join(", ").toLowerCase()} chocolate.`
          : "Surprise me with a tasting path.";
      const response = await fetch("/api/sommelier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, tags: selected }),
      });
      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "Sommelier unavailable.");
      setMessages([
        { role: "user", text: prompt },
        { role: "ai", text: data.reply || settings.chatPreview.ai },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function onSend(event: FormEvent) {
    event.preventDefault();
    if (!input.trim()) return;
    const message = input.trim();
    setInput("");
    setMessages((current) => [...current, { role: "user", text: message }]);
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/sommelier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, tags: selected }),
      });
      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "Sommelier unavailable.");
      setMessages((current) => [
        ...current,
        { role: "ai", text: data.reply || "Tell me more about what you crave." },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="sommelier" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="animate-panel-in grid gap-8 rounded-[28px] border border-border bg-bg-elevated p-6 md:p-8 lg:grid-cols-[180px_1fr_280px] lg:items-center lg:gap-10">
        <div className="relative mx-auto size-40 lg:size-44">
          <div className="absolute inset-[-10px] rounded-full border border-brass/50" />
          <div className="absolute inset-[-18px] rounded-full border border-brass/20" />
          <SoftImage
            src={settings.portrait}
            alt={`${settings.name}, ${settings.title}`}
            fill
            className="rounded-full object-cover"
            sizes="176px"
          />
        </div>

        <div>
          <p className="section-label inline-flex items-center gap-2">
            <Star className="size-3.5 fill-current" />
            Meet your guide
          </p>
          <h2 className="mt-2 font-display text-2xl tracking-tight text-text-on-dark sm:text-[1.75rem]">
            {settings.title}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-muted sm:text-base">
            {settings.intro}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {settings.defaultTags.map((tag) => {
              const active = selected.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass",
                    active
                      ? "border-brass bg-brass text-bg-base"
                      : "border-border bg-transparent text-text-muted hover:border-brass hover:text-brass"
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
          <Button
            type="button"
            onClick={startConversation}
            disabled={loading}
            className="mt-6 h-11 rounded-xl bg-brass px-5 text-sm font-semibold text-bg-base hover:bg-brass-hover"
          >
            <AudioLines className="size-4" />
            Start a Conversation
          </Button>
          {error ? (
            <p className="mt-2 text-xs text-red-300" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div
          key={selectedKey + String(openChat)}
          className="space-y-3 rounded-2xl border border-border/80 bg-bg-base/40 p-4"
        >
          {(openChat ? messages : messages.slice(0, 2)).map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={cn(
                "max-w-[95%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed",
                message.role === "user"
                  ? "ml-auto bg-chat-user text-text-on-dark"
                  : "bg-chat-ai text-text-muted"
              )}
            >
              {message.text}
              {message.role === "ai" && !openChat && index === 1 ? (
                <Compass className="mt-2 size-4 text-brass" strokeWidth={1.5} />
              ) : null}
            </div>
          ))}
          {openChat ? (
            <form onSubmit={onSend} className="flex gap-2 pt-1">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about a flavor..."
                className="h-9 flex-1 rounded-lg border border-border bg-bg-elevated px-3 text-xs text-text-on-dark outline-none placeholder:text-text-muted focus:border-brass"
              />
              <Button
                type="submit"
                disabled={loading}
                className="h-9 rounded-lg bg-brass px-3 text-xs text-bg-base hover:bg-brass-hover"
              >
                Send
              </Button>
            </form>
          ) : null}
        </div>
      </div>
    </section>
  );
}
