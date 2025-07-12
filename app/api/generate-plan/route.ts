// app/api/generate-plan/route.ts

import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { brief } = await req.json();

  console.log("🔁 Received brief:", brief);

  const prompt = `
You are a senior marketing strategist. Turn the following messy campaign brief into a clean plan with:

- Campaign overview
- Objectives
- KPIs
- Budget breakdown (USD)
- Funnel strategy (3 stages)
- Creative hook
- Timeline

Brief:
${brief}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful marketing strategist." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const plan = completion.choices[0]?.message?.content || "No response generated.";
    return NextResponse.json({ plan });
  } catch (error) {
    console.error("❌ Error generating plan:", error);
    return NextResponse.json({ plan: "Error: Failed to generate plan." }, { status: 500 });
  }
}