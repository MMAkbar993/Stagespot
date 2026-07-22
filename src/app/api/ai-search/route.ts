import { NextResponse } from "next/server";
import { GoogleGenAI, Type, ApiError } from "@google/genai";

export async function POST(request: Request) {
  const { description } = (await request.json()) as { description?: string };

  if (!description?.trim()) {
    return NextResponse.json({ error: "Description is required" }, { status: 400 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "AI search isn't configured yet." }, { status: 503 });
  }

  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const response = await client.models.generateContent({
      model: "gemini-flash-latest",
      contents: `A venue on a live-performance booking platform described, in their own words, the kind of performer they want: "${description}". Suggest short, lowercase search tags (act types, moods, styles) that would help them filter to matching performers.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-6 short, lowercase search tags (act types, moods, styles) matching the description",
            },
          },
          required: ["tags"],
        },
      },
    });

    const parsed = response.text ? (JSON.parse(response.text) as { tags?: string[] }) : {};
    return NextResponse.json({ tags: parsed.tags ?? [] });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401 || error.status === 403) {
        return NextResponse.json(
          { error: "AI search isn't configured correctly (invalid API key)." },
          { status: 500 },
        );
      }
      if (error.status === 429) {
        return NextResponse.json({ error: "AI search is busy right now — try again shortly." }, { status: 429 });
      }
    }
    console.error("AI search error", error);
    return NextResponse.json({ error: "Couldn't generate suggestions right now." }, { status: 502 });
  }
}
