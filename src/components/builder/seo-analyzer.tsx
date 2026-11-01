"use client";

import { useState } from "react";
import { Search, CheckCircle2, AlertCircle, Sparkles, FileText } from "lucide-react";
import { ProjectFileRecord } from "@/lib/db/store";

interface SeoAnalyzerProps {
  files: ProjectFileRecord[];
  onApplyFix?: (instruction: string) => void;
}

export function SeoAnalyzer({ files, onApplyFix }: SeoAnalyzerProps) {
  const indexHtml = files.find((f) => f.path === "index.html")?.content || "";

  // Perform client-side static analysis on index.html
  const hasH1 = /<h1\b[^>]*>.*?<\/h1>/i.test(indexHtml);
  const h1Count = (indexHtml.match(/<h1\b[^>]*>/gi) || []).length;
  const hasMetaDescription = /<meta\s+name=["']description["']/i.test(indexHtml);
  const hasViewport = /<meta\s+name=["']viewport["']/i.test(indexHtml);
  const hasTitle = /<title>.*?<\/title>/i.test(indexHtml);
  const imagesWithoutAlt = (indexHtml.match(/<img(?![^>]*\balt=)[^>]*>/gi) || []).length;

  const checks = [
    {
      title: "Document Title",
      status: hasTitle ? "passed" : "failed",
      description: hasTitle
        ? "Title tag is defined in <head>."
        : "Missing <title> tag. Critical for search engine indexing.",
      fix: "Add an optimized <title> tag describing the website under 60 characters.",
    },
    {
      title: "Meta Description",
      status: hasMetaDescription ? "passed" : "warning",
      description: hasMetaDescription
        ? "Meta description found."
        : "No meta description found. Search engines use this for snippet previews.",
      fix: "Add a high-converting meta description tag under 160 characters.",
    },
    {
      title: "Heading Hierarchy",
      status: h1Count === 1 ? "passed" : h1Count === 0 ? "failed" : "warning",
      description:
        h1Count === 1
          ? "Ideal: Exactly one <h1> tag exists on the page."
          : h1Count === 0
          ? "No <h1> heading detected."
          : `Multiple (${h1Count}) <h1> tags detected. Best practice is a single <h1>.`,
      fix: "Ensure there is exactly one <h1> heading that clearly defines the primary value proposition.",
    },
    {
      title: "Mobile Viewport Meta",
      status: hasViewport ? "passed" : "failed",
      description: hasViewport
        ? "Mobile viewport tag is properly configured."
        : "Missing viewport tag. Mobile responsiveness will fail Core Web Vitals.",
      fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> in <head>.',
    },
    {
      title: "Image Alt Attributes",
      status: imagesWithoutAlt === 0 ? "passed" : "warning",
      description:
        imagesWithoutAlt === 0
          ? "All images have alt attributes."
          : `${imagesWithoutAlt} image(s) missing descriptive alt attributes for screen readers and SEO.`,
      fix: "Add descriptive, contextual alt attributes to all <img> elements.",
    },
  ];

  return (
    <div className="p-4 space-y-4 text-xs font-sans text-porcelain">
      <div className="flex items-center gap-2 pb-3 border-b border-border">
        <Search className="h-4 w-4 text-mint" />
        <h3 className="font-bold text-sm text-porcelain">SEO & Accessibility Audit</h3>
      </div>

      <div className="space-y-3">
        {checks.map((check, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg bg-graphite-200 border border-border space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs flex items-center gap-1.5">
                {check.status === "passed" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-mint" />
                ) : (
                  <AlertCircle
                    className={`h-3.5 w-3.5 ${
                      check.status === "failed" ? "text-red-400" : "text-amber-400"
                    }`}
                  />
                )}
                {check.title}
              </span>
              <span
                className={`text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded ${
                  check.status === "passed"
                    ? "bg-mint/10 text-mint"
                    : check.status === "failed"
                    ? "bg-red-500/10 text-red-400"
                    : "bg-amber-500/10 text-amber-400"
                }`}
              >
                {check.status}
              </span>
            </div>
            <p className="text-porcelain-muted text-[11px] leading-relaxed">
              {check.description}
            </p>
            {check.status !== "passed" && onApplyFix && (
              <button
                type="button"
                onClick={() => onApplyFix(check.fix)}
                className="flex items-center gap-1 text-[11px] font-bold text-mint hover:underline pt-1"
              >
                <Sparkles className="h-3 w-3" />
                Ask AI to fix this
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
