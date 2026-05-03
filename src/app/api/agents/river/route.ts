// RIVER — suspicion classifier. Takes a sample text and classifies it
// as legit / suspicious / spam, with a one-sentence reason.
// Uses generateObject for structured output via AI Gateway.

import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 30;

const requestSchema = z.object({
  sample: z.string().min(10).max(2000),
});

const resultSchema = z.object({
  classification: z.enum(["legit", "suspicious", "spam"]),
  confidence: z.number().min(0).max(1),
  reason: z.string().min(10).max(280),
});

const SYSTEM = `
You are RIVER — a suspicion classifier for inbound text. You decide whether
a piece of inbound content (inquiry form submission, contact note, sample
message) is:
- "legit" — sounds like a real prospect or genuine inquiry
- "suspicious" — could be either, hedged, missing context, or ambiguous
- "spam" — clear spam, scam, generic SEO bait, or automated submission

Be honest about uncertainty. confidence is your honest probability that the
classification is correct. reason is one short sentence explaining the call.
Do not be paranoid — most legit inquiries are short. Spam tends to mention
SEO services, link building, generic compliments, or contains URLs to
unrelated topics.
`;

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_sample" }, { status: 400 });
  }

  if (!process.env.AI_GATEWAY_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    // Friendly fallback — keep UI honest about state
    return NextResponse.json({
      classification: "suspicious",
      confidence: 0.5,
      reason:
        "RIVER is wired but waiting on AI_GATEWAY_API_KEY. Once Qamar adds the key, I'll classify real samples.",
      mocked: true,
    });
  }

  try {
    const result = await generateObject({
      model: "anthropic/claude-sonnet-4-6",
      schema: resultSchema,
      system: SYSTEM,
      prompt: `Classify this sample:\n\n${parsed.data.sample}`,
      maxRetries: 2,
    });

    // Log the run
    try {
      await prisma.agentRun.create({
        data: {
          agent: "RIVER",
          status: "success",
          input: { sample: parsed.data.sample.slice(0, 240) },
          output: result.object,
        },
      });
    } catch (err) {
      console.error("[river] failed to log AgentRun:", err);
    }

    return NextResponse.json(result.object);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "classification_failed" },
      { status: 500 },
    );
  }
}
