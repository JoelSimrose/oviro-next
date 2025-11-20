// app/api/draft-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';

type ChildInput = {
  id?: number;
  name?: string;
  age?: string;
  grade?: string;
};

// Accepts a draft plan payload and returns a human-readable summary plus normalized data.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Normalize child inputs; ignore non-array payloads.
    const children: ChildInput[] = Array.isArray(body.children)
      ? body.children
      : [];

    const philosophy: string = body.philosophy || 'Not specified';
    const location: string = body.location || 'Not specified';
    const goals: string = body.goals || 'Not specified';

    const filledChildren = children.filter(
      (c) =>
        (c.name && c.name.trim()) ||
        (c.age && c.age.trim()) ||
        (c.grade && c.grade.trim()),
    );

    if (filledChildren.length === 0) {
      return NextResponse.json(
        { error: 'At least one child is required.' },
        { status: 400 },
      );
    }

    // Generate concise descriptors for each child to surface in the plain-text summary.
    const childDescriptions = filledChildren
      .map((c, index) => {
        const name = c.name?.trim() || `Child ${index + 1}`;
        const age = c.age?.trim() || '?';
        const grade = c.grade?.trim() || '?';
        return `${name} (age ${age}, grade ${grade})`;
      })
      .join(', ');

    const summary = `
Draft planning summary
----------------------
Children: ${childDescriptions}
Philosophy: ${philosophy}
Location: ${location}
Parent priorities: ${goals}

Next step (future): use this payload to call the AI backend to generate a detailed yearly plan, weekly schedule, and resource suggestions.
      `.trim();

    return NextResponse.json({
      summary,
      normalized: {
        children: filledChildren,
        philosophy,
        location,
        goals,
      },
    });
  } catch (err) {
    console.error('Error in /api/draft-plan:', err);
    return NextResponse.json(
      { error: 'Invalid request payload.' },
      { status: 400 },
    );
  }
}
