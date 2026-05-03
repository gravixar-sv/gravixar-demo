// ECHO — live SEO drafter. Streams tokens from Anthropic via Vercel
// AI Gateway. The Studio Mix client component reads the response body
// as a stream and appends tokens as they arrive.
//
// Each completed run logs an AgentRun row for the activity feed.

import { streamText } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

const requestSchema = z.object({
  topic: z.string().min(3).max(200),
});

const SYSTEM = `
You are ECHO — a content-drafting agent for Gravixar's demo. You draft
short, opinionated blog posts in Qamar's voice:
- First-person singular ("I"). Concrete and honest.
- Refuse marketing fluff. Name specific tools, specific decisions.
- Short paragraphs. Active voice. No "in today's fast-paced world."
- Output a 200-350 word draft only — no meta-commentary, no preamble.
- Do NOT include a title or frontmatter. Start with the first sentence
  of the body.
`;

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "invalid_topic" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  // If no AI Gateway key is set, return a friendly message rather than
  // crashing — keeps the UI honest about state.
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return new Response(
      "ECHO is wired but waiting on AI_GATEWAY_API_KEY. Once Qamar adds the key in Vercel, I'll stream you a real draft on this exact topic.",
      { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  }

  const result = streamText({
    model: "anthropic/claude-sonnet-4-6",
    system: SYSTEM,
    prompt: `Topic: ${parsed.data.topic}\n\nDraft the post.`,
    maxRetries: 2,
    onFinish: async ({ text, usage }) => {
      // Best-effort logging — don't block the response on it.
      try {
        await prisma.agentRun.create({
          data: {
            agent: "ECHO",
            status: "success",
            input: { topic: parsed.data.topic },
            output: {
              tokens: usage?.totalTokens ?? 0,
              preview: text.slice(0, 240),
            },
          },
        });
      } catch (err) {
        console.error("[echo] failed to log AgentRun:", err);
      }
    },
  });

  return result.toTextStreamResponse();
}
