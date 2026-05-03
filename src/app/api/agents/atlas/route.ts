// ATLAS — content reviewer. Takes a draft and runs it against
// Qamar's voice rules. Returns flagged spots with severity, the
// offending excerpt, and a suggested rewrite.
//
// Designed as a second opinion, not a publish gate. Authors keep
// the steering wheel; ATLAS just surfaces the obvious lapses.

import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 30;

const requestSchema = z.object({
  draft: z.string().min(40).max(8000),
});

const flagSchema = z.object({
  severity: z.enum(["info", "warn"]),
  rule: z.string().min(2).max(40),
  excerpt: z.string().min(1).max(280),
  issue: z.string().min(5).max(220),
  suggestion: z.string().max(280).optional(),
});

const resultSchema = z.object({
  flags: z.array(flagSchema).max(12),
  summary: z.string().min(10).max(280),
});

const SYSTEM = `
You are ATLAS — a content reviewer. You read a draft against this
style guide and flag the worst lapses. You are not a publish gate;
you are a second opinion the author can take or leave.

Style guide — Qamar's voice on gravixar.com:
- First-person singular ("I"). No "we" or "our team."
- Concrete and honest. Name specific tools, specific numbers, specific decisions.
- Refuse marketing fluff. Banned phrases: "in today's fast-paced world," "leverage" (as a verb), "best-in-class," "synergy," "unlock potential," "transform your business," "next-level," "10x," "game-changing."
- Refuse hedging. "Could potentially" → say what's true. "Various" → name them.
- Active voice. Cut passive constructions where the agent matters.
- Cut adverbs unless they're load-bearing.
- Short paragraphs. One opinion per post. Reader should know what the author thinks by the end.

Rules to use in flag.rule:
- "marketing_fluff" — banned phrases, generic claims with no substance
- "first_person" — drift to "we" / "our team" / "they say"
- "passive_voice" — passive constructions where active is clearer
- "hedging" — "could potentially," "may be able to," "various," "etc."
- "weak_adverb" — "very," "really," "quite," etc. that add no information
- "abstraction" — vague nouns where concrete terms exist
- "filler" — words/phrases that could be cut without loss

Output up to 12 flags. Severity:
- "warn" — clear violation, suggested rewrite belongs in the suggestion field
- "info" — borderline, surface it but don't insist

Summary: one short sentence on the overall voice match — "reads like Qamar" / "needs a pass to remove fluff and hedging" / etc.
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
    return NextResponse.json({ error: "invalid_draft" }, { status: 400 });
  }

  if (!process.env.AI_GATEWAY_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      flags: [],
      summary:
        "ATLAS is wired but waiting on AI_GATEWAY_API_KEY. Once Qamar adds the key, I'll review real drafts.",
      mocked: true,
    });
  }

  try {
    const result = await generateObject({
      model: "anthropic/claude-sonnet-4-6",
      schema: resultSchema,
      system: SYSTEM,
      prompt: `Review this draft:\n\n${parsed.data.draft}`,
      maxRetries: 2,
    });

    try {
      await prisma.agentRun.create({
        data: {
          agent: "ATLAS",
          status: "success",
          input: { draftPreview: parsed.data.draft.slice(0, 240) },
          output: {
            flagCount: result.object.flags.length,
            warnings: result.object.flags.filter((f) => f.severity === "warn").length,
            summary: result.object.summary,
          },
        },
      });
    } catch (err) {
      console.error("[atlas] failed to log AgentRun:", err);
    }

    return NextResponse.json(result.object);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "review_failed" },
      { status: 500 },
    );
  }
}
