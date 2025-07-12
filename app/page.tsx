// app/page.tsx
"use client";

import { useState } from "react";
import { downloadDocx } from "@/utils/downloadDocx";

export default function Page() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  /* generate */
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

  /* download */
  const handleDownload = () => output && downloadDocx(output);

  return (
    <div className="min-h-screen bg-[#312F31] text-white flex flex-col">
      {/* nav */}
      <nav className="flex justify-end items-center px-10 py-4 space-x-8">
        {["Features", "Pricing", "Docs", "Contact"].map((item) => (
          <a key={item} href="#" className="text-gray-200 hover:text-white">
            {item}
          </a>
        ))}
      </nav>

      {/* hero */}
      <main className="flex flex-col items-center px-6 text-center pt-2">
        {/* teal logo – 350 px height, tight spacing */}
        <img
          src="/wordmark_light_big.png"
          alt="campaign.ai"
          className="h-[350px] mb-1 filter"
          style={{
            filter:
              "brightness(0) saturate(100%) invert(34%) sepia(73%) saturate(859%) hue-rotate(155deg) brightness(97%) contrast(95%)",
          }}
        />

        <h1 className="text-4xl font-bold text-[#f0f0f0]">
          Campaign Plan Generator
        </h1>
        <p className="mt-1 text-gray-300 max-w-xl mx-auto">
          Paste your campaign brief and receive a sleek, visual DOCX plan.
        </p>

        <textarea
          placeholder="Client is Dunder Mifflin. Need to boost paper sales. Do stuff like social media, billboards, some events. $9k budget. Need more leads."
          className="w-full max-w-xl h-48 mt-6 p-4 text-gray-900 bg-white border border-gray-300 rounded-lg resize-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-center">
          <button
            className="relative flex items-center justify-center bg-[#11C4D3] text-white font-semibold px-6 py-3 rounded hover:bg-[#0da6b7] disabled:opacity-50"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading && (
              <svg
                className="animate-spin h-5 w-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 018 8h-4l3.5 3.5L24 12h-4a8 8 0 01-8 8v-4l-3.5 3.5L12 24v-4a8 8 0 01-8-8z"
                />
              </svg>
            )}
            {loading ? "Generating…" : "Generate Plan"}
          </button>

          {output && !loading && (
            <button
              onClick={handleDownload}
              className="text-[#11C4D3] border border-[#11C4D3] font-semibold px-6 py-3 rounded hover:bg-[#264346]"
            >
              Download DOCX
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
