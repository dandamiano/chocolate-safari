import { NextResponse } from "next/server";
import { z } from "zod";
import { getChocolates, getSiteSettings } from "@/lib/content";
import type { Chocolate } from "@/lib/schemas";

const bodySchema = z.object({
  message: z.string().min(1).max(500),
  tags: z.array(z.string()).default([]),
});

function cannedReply(
  message: string,
  tags: string[],
  replies: { tags: string[]; reply: string }[]
): string {
  const tagged = replies
    .filter((entry) => entry.tags.length > 0)
    .find((entry) =>
      entry.tags.every((tag) =>
        tags.map((value) => value.toLowerCase()).includes(tag.toLowerCase())
      )
    );

  const partial = replies
    .filter((entry) => entry.tags.length > 0)
    .find((entry) =>
      entry.tags.some((tag) =>
        tags.map((value) => value.toLowerCase()).includes(tag.toLowerCase())
      )
    );

  const fallback =
    replies.find((entry) => entry.tags.length === 0)?.reply ??
    "Share a flavor direction and I’ll suggest a short tasting flight.";

  const fromMessage = replies.find((entry) =>
    entry.tags.some((tag) => message.toLowerCase().includes(tag.toLowerCase()))
  );

  return tagged?.reply ?? partial?.reply ?? fromMessage?.reply ?? fallback;
}

function scoreChocolate(chocolate: Chocolate, tags: string[], message: string): number {
  const needle = [...tags, ...message.split(/\s+/)].map((t) => t.toLowerCase());
  let score = 0;
  for (const tag of chocolate.tags) {
    if (needle.some((n) => n && tag.toLowerCase().includes(n))) score += 3;
  }
  const haystack = `${chocolate.title} ${chocolate.shortDescription} ${chocolate.originCountry}`.toLowerCase();
  for (const n of needle) {
    if (n.length > 2 && haystack.includes(n)) score += 1;
  }
  return score;
}

function catalogueContext(chocolates: Chocolate[], tags: string[], message: string): string {
  const ranked = [...chocolates]
    .map((c) => ({ c, score: scoreChocolate(c, tags, message) }))
    .sort((a, b) => b.score - a.score || b.c.rating - a.c.rating)
    .slice(0, 8)
    .map(({ c }) => c);

  if (ranked.length === 0) return "No catalogue entries available.";

  return ranked
    .map(
      (c) =>
        `- ${c.title} (${c.brand}, ${c.originCountry}): tags=${c.tags.join(", ")}; rating=${c.rating}; ${c.shortDescription}`
    )
    .join("\n");
}

async function llmReply(
  message: string,
  tags: string[],
  chocolates: Chocolate[]
): Promise<string | null> {
  const apiKey =
    process.env.OPENAI_API_KEY?.trim() || process.env.AI_API_KEY?.trim();
  if (!apiKey) return null;

  const baseUrl = (
    process.env.AI_BASE_URL?.trim() || "https://api.openai.com/v1"
  ).replace(/\/$/, "");
  const model = process.env.AI_MODEL?.trim() || "gpt-4o-mini";

  const context = catalogueContext(chocolates, tags, message);
  const system = `You are the Chocolate Safari sommelier. Recommend 1–3 bars from the catalogue context only. Be concise (2–4 sentences), warm, and specific about flavor. Mention bar titles. If tags are provided, lean into them. Do not invent bars outside the list.`;

  const user = `Tags: ${tags.length ? tags.join(", ") : "(none)"}
Request: ${message}

Catalogue:
${context}`;

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        max_tokens: 280,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!response.ok) {
      console.warn(
        "[sommelier] LLM error:",
        response.status,
        await response.text().catch(() => "")
      );
      return null;
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    return text || null;
  } catch (error) {
    console.warn("[sommelier] LLM fetch failed:", error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { message, tags } = bodySchema.parse(json);
    const [settings, chocolates] = await Promise.all([
      getSiteSettings(),
      getChocolates(),
    ]);

    const fromLlm = await llmReply(message, tags, chocolates);
    if (fromLlm) {
      return NextResponse.json({ reply: fromLlm, source: "llm" as const });
    }

    const reply = cannedReply(message, tags, settings.sommelier.cannedReplies);
    return NextResponse.json({ reply, source: "canned" as const });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid request." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Sommelier is resting. Try again shortly." },
      { status: 500 }
    );
  }
}
