'use client';

import { useState } from 'react';

type Child = {
  id: number;
  name: string;
  age: string;
  grade: string;
};

const philosophies = [
  'Charlotte Mason',
  'Montessori',
  'Classical',
  'Waldorf',
  'Unschooling',
  'Eclectic / Mixed',
];

export default function HomePage() {
  // Collect homeschool inputs client-side and render a quick draft summary.
  const [children, setChildren] = useState<Child[]>([
    { id: 1, name: '', age: '', grade: '' },
  ]);
  const [philosophy, setPhilosophy] = useState('Charlotte Mason');
  const [location, setLocation] = useState('');
  const [goals, setGoals] = useState('');
  const [summary, setSummary] = useState<string | null>(null);

  // Append a new child row with a timestamp-based id.
  const addChild = () => {
    setChildren((prev) => [
      ...prev,
      { id: Date.now(), name: '', age: '', grade: '' },
    ]);
  };

  // Update the requested field for a given child.
  const updateChild = (id: number, field: keyof Child, value: string) => {
    setChildren((prev) =>
      prev.map((child) =>
        child.id === id ? { ...child, [field]: value } : child,
      ),
    );
  };

  const removeChild = (id: number) => {
    setChildren((prev) => prev.filter((child) => child.id !== id));
  };

  // Validate at least one child, then build a human-readable summary string.
  const handleGenerate = () => {
    const filledChildren = children.filter(
      (c) => c.name.trim() || c.age.trim() || c.grade.trim(),
    );

    if (filledChildren.length === 0) {
      setSummary('Add at least one child to generate a draft plan.');
      return;
    }

    const childDescriptions = filledChildren
      .map((c) => `${c.name || 'Unnamed'} (age ${c.age || '?'}, grade ${c.grade || '?'})`)
      .join(', ');

    const text = `
Draft planning summary
----------------------
Children: ${childDescriptions}
Philosophy: ${philosophy}
Location: ${location || 'Not specified'}
Parent priorities: ${goals || 'Not specified'}

Next step (future): send this data to the AI backend to generate a year plan, weekly schedule, and resource suggestions.
    `.trim();

    setSummary(text);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="max-w-4xl mx-auto px-4 pt-8 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Oviro – Homeschool Planning Assistant
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Start by telling us about your children, your preferred philosophy, and your goals.
        </p>
      </header>

      <main className="max-w-4xl mx-auto px-4 pb-10 space-y-4">
        <section className="bg-white shadow-sm border border-slate-200 rounded-xl p-4 sm:p-5">
          <h2 className="text-lg font-semibold">1. Children</h2>
          <p className="mt-1 text-xs text-slate-500">
            Add each child you&apos;ll be planning for. You can mix grades and ages.
          </p>

          <div className="mt-3 space-y-3">
            {children.map((child, index) => (
              <div key={child.id} className="border-t border-dashed border-slate-200 pt-3">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-medium text-slate-700">Child {index + 1}</span>
                  {children.length > 1 && (
                    <button
                      type="button"
                      className="text-red-500 hover:underline"
                      onClick={() => removeChild(child.id)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="flex flex-col gap-1 text-xs text-slate-600">
                    Name
                    <input
                      type="text"
                      value={child.name}
                      onChange={(e) => updateChild(child.id, 'name', e.target.value)}
                      placeholder="e.g., Emma"
                      className="rounded-md border border-slate-200 px-2 py-1 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs text-slate-600">
                    Age
                    <input
                      type="number"
                      min={3}
                      max={18}
                      value={child.age}
                      onChange={(e) => updateChild(child.id, 'age', e.target.value)}
                      placeholder="10"
                      className="rounded-md border border-slate-200 px-2 py-1 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs text-slate-600">
                    Grade / Level
                    <input
                      type="text"
                      value={child.grade}
                      onChange={(e) => updateChild(child.id, 'grade', e.target.value)}
                      placeholder="Grade 4"
                      className="rounded-md border border-slate-200 px-2 py-1 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-3 inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
            onClick={addChild}
          >
            + Add another child
          </button>
        </section>

        <section className="bg-white shadow-sm border border-slate-200 rounded-xl p-4 sm:p-5">
          <h2 className="text-lg font-semibold">2. Teaching philosophy &amp; location</h2>

          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs text-slate-600">
              Primary philosophy
              <select
                value={philosophy}
                onChange={(e) => setPhilosophy(e.target.value)}
                className="rounded-md border border-slate-200 px-2 py-1.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {philosophies.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs text-slate-600">
              Location (province / state)
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Ontario, BC, Florida"
                className="rounded-md border border-slate-200 px-2 py-1 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </label>
          </div>
        </section>

        <section className="bg-white shadow-sm border border-slate-200 rounded-xl p-4 sm:p-5">
          <h2 className="text-lg font-semibold">3. Parent priorities</h2>
          <p className="mt-1 text-xs text-slate-500">
            What matters most this year? (e.g., reading confidence, math basics, more nature time,
            better routine)
          </p>
          <textarea
            rows={4}
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="Describe your goals and constraints for this year..."
            className="mt-2 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />

          <button
            type="button"
            className="mt-3 inline-flex items-center rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700"
            onClick={handleGenerate}
          >
            Generate draft plan summary
          </button>
        </section>

        {summary && (
          <section className="bg-white shadow-sm border border-slate-200 rounded-xl p-4 sm:p-5">
            <h2 className="text-lg font-semibold">Draft summary</h2>
            <pre className="mt-2 whitespace-pre-wrap rounded-md bg-slate-900 px-3 py-2 text-xs text-slate-100">
              {summary}
            </pre>
          </section>
        )}
      </main>
    </div>
  );
}
