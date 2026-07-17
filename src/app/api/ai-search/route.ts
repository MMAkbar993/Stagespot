import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

const TagSuggestion = z.object({
  tags: z
    .array(z.string())
    .describe("3-6 short, lowercase search tags (act types, moods, styles) matching the description"),
});

export async function POST(request: Request) {
  const { description } = (await request.json()) as { description?: string };

  if (!description?.trim()) {
    return NextResponse.json({ error: "Description is required" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AI search isn't configured yet." }, { status: 503 });
  }

  const client = new Anthropic();

  try {
    const response = await client.messages.parse({
      model: "claude-opus-4-8",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: `A venue on a live-performance booking platform described, in their own words, the kind of performer they want: "${description}". Suggest short, lowercase search tags (act types, moods, styles) that would help them filter to matching performers.`,
        },
      ],
      output_config: { format: zodOutputFormat(TagSuggestion) },
    });

    return NextResponse.json({ tags: response.parsed_output?.tags ?? [] });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "AI search isn't configured correctly (invalid API key)." },
        { status: 500 },
      );
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "AI search is busy right now — try again shortly." }, { status: 429 });
    }
    console.error("AI search error", error);
    return NextResponse.json({ error: "Couldn't generate suggestions right now." }, { status: 502 });
  }
}
