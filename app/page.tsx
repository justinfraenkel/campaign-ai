// app/page.tsx
"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const planRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setOutput("");

    const res = await fetch("/api/generate-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brief: input }),
    });

    const data = await res.json();
    setOutput(data.plan);
    setLoading(false);
  };

  const handleDownload = async () => {
    if (!planRef.current) return;

    const html2pdf = (await import("html2pdf.js")).default;

    html2pdf()
      .from(planRef.current)
      .set({
        margin: 0.5,
        filename: "campaign-plan.pdf",
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      })
      .save();
  };

  const renderFormattedOutput = () => {
    if (!output) return null;

    const sections = output.split(/\n(?=### )/g); // split at '### Section Title'

    return (
      <div
        ref={planRef}
        className="font-sans bg-white text-[#312F31] px-10 py-8 rounded shadow space-y-6 max-w-[700px] mx-auto"
        style={{
          fontFamily: "Inter, sans-serif",
          pageBreakInside: "avoid",
          breakInside: "avoid",
        }}
      >
        {/* Logo */}
        <div className="w-full flex justify-center mb-6">
          <img src="/wordmark_dark.png" alt="campaign.ai logo" className="h-8" />
        </div>

        {/* Sections */}
        {sections.map((section, idx) => {
          const titleMatch = section.match(/^### (.+)/);
          const title = titleMatch ? titleMatch[1] : "";
          const content = section.replace(/^### .+\n?/, "");

          return (
            <div
              key={idx}
              className="space-y-2"
              style={{
                pageBreakInside: "avoid",
                breakInside: "avoid",
              }}
            >
              {title && (
                <h2 className="text-xl font-semibold text-[#11C4D3]">
                  {title}
                </h2>
              )}
              <div className="whitespace-pre-wrap">{content.trim()}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-white text-[#312F31] p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-[#11C4D3]">
          campaign.ai — 1-Page Plan Generator
        </h1>

        <textarea
          placeholder="Paste your messy campaign brief here..."
          className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className="flex items-center gap-4">
          <button
            className="bg-[#11C4D3] text-white font-semibold px-4 py-2 rounded hover:bg-[#0da6b7] disabled:opacity-50"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Plan"}
          </button>

          {output && (
            <button
              onClick={handleDownload}
              className="text-[#11C4D3] border border-[#11C4D3] font-semibold px-4 py-2 rounded hover:bg-[#f0f9fa]"
            >
              Download PDF
            </button>
          )}
        </div>

        <div className="mt-8 border-t pt-6">
          {output ? (
            <div className="space-y-4">{renderFormattedOutput()}</div>
          ) : (
            <p className="text-gray-400 italic">
              Your clean campaign plan will appear here...
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
