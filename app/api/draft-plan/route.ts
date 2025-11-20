// app/api/draft-plan/route.ts

// Next.js types for server-side request/response in the App Router
import { NextRequest, NextResponse } from 'next/server';

// OpenAI Node SDK (server-side only – this never runs in the browser)
import OpenAI from 'openai';

// ---- Types ----

// This describes the shape of a "child" object we expect from the frontend.
// The `?` means each field is optional (can be missing or undefined).
type ChildInput = {
  id?: number;
  name?: string;
  age?: string;
  grade?: string;
};

// ---- OpenAI client ----

// We create a single OpenAI client instance using the API key from
// the environment variable OPENAI_API_KEY (set in .env.local).
// This code runs ONLY on the server in Next.js API routes.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ---- Route handler ----

// By exporting a function named POST, Next.js knows this file
// handles POST requests to /api/draft-plan.
export async function POST(req: NextRequest) {
  try {
    // 1. Read and parse the JSON body sent from the frontend.
    //    In your React code, you did: fetch('/api/draft-plan', { body: JSON.stringify({...}) }).
    const body = await req.json();

    // Safely pull out the fields we expect.
    const children: ChildInput[] = Array.isArray(body.children)
      ? body.children
      : [];

    const philosophy: string = body.philosophy || 'Not specified';
    const location: string = body.location || 'Not specified';
    const goals: string = body.goals || 'Not specified';

    // 2. Basic validation: make sure we have at least one non-empty child.
    const filledChildren = children.filter(
      (c) =>
        (c.name && c.name.trim()) ||
        (c.age && c.age.trim()) ||
        (c.grade && c.grade.trim()),
    );

    if (filledChildren.length === 0) {
      // If no children are provided, return a 400 (bad request) with an error message.
      return NextResponse.json(
        { error: 'At least one child is required.' },
        { status: 400 },
      );
    }

    // 3. Turn the children into a simple descriptive string for the prompt.
    //    Example: "Emma (age 10, grade 4), Noah (age 7, grade 2)"
    const childDescriptions = filledChildren
      .map((c, index) => {
        const name = c.name?.trim() || `Child ${index + 1}`;
        const age = c.age?.trim() || '?';
        const grade = c.grade?.trim() || '?';
        return `${name} (age ${age}, grade ${grade})`;
      })
      .join(', ');

    // 4. Build the prompt we send to OpenAI.
    //    This explains the context and what kind of output we want.
    const prompt = `
You are an assistant helping a homeschool parent plan the year.

Context:
- Children: ${childDescriptions}
- Homeschooling philosophy: ${philosophy}
- Location: ${location} (use this only for general seasonality, do NOT assume exact curriculum standards)
- Parent priorities for this year: ${goals || 'Not specified'}

Task:
Write a clear, parent-friendly "draft planning summary" in 3–6 short paragraphs.

Include:
- A brief overall perspective on the year based on the philosophy
- Key focus areas for each child (high-level, not a detailed schedule)
- Suggestions for how to balance multiple children and grade levels
- 2–4 concrete next steps the parent can take this week to move forward

Tone:
- Encouraging, practical, and clear
- No jargon
- Do NOT mention that you are an AI or reference prompts or tokens.
    `.trim();

    // 5. Safety check: if the API key is missing, don't crash.
    //    Instead, return a simple "fallback" summary so the app still works.
    if (!process.env.OPENAI_API_KEY) {
      const fallbackSummary = `
Draft planning summary (local fallback)
--------------------------------------
Children: ${childDescriptions}
Philosophy: ${philosophy}
Location: ${location}
Parent priorities: ${goals}

Note: The OpenAI API key is not configured on the server, so this is a simple placeholder summary instead of an AI-generated one.
      `.trim();

      return NextResponse.json({
        summary: fallbackSummary,
        normalized: {
          children: filledChildren,
          philosophy,
          location,
          goals,
        },
      });
    }

    // 6. Call OpenAI to generate the actual summary text.
    //    This is the "AI" part – everything above is just preparing a good prompt.
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // you can change this model later if needed
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that specializes in homeschool planning summaries for parents.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7, // higher = more creative, lower = more deterministic
    });

    // Safely read the text out of the response.
    const aiSummary =
      completion.choices[0]?.message?.content?.trim() ||
      'Unable to generate a summary at this time.';

    // 7. Return JSON back to the frontend.
    //    Your React code reads `data.summary` and displays it.
    return NextResponse.json({
      summary: aiSummary,
      normalized: {
        children: filledChildren,
        philosophy,
        location,
        goals,
      },
    });
  } catch (err) {
    // If anything goes wrong (bad JSON, OpenAI error, etc.), log it on the server
    // and return a user-friendly error to the frontend.
    console.error('Error in /api/draft-plan:', err);
    return NextResponse.json(
      { error: 'Invalid request payload or AI generation error.' },
      { status: 400 },
    );
  }
}
