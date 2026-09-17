"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyableLine({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can fail (permissions, insecure context) - not
      // worth surfacing an error for a copy-to-clipboard convenience.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="w-full text-left flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:border-primary/40 hover:shadow-sm transition"
    >
      <span className="min-w-0 break-words">{text}</span>
      <span
        className={`flex items-center gap-1 text-xs shrink-0 ${
          copied ? "text-emerald-600" : "text-muted-foreground"
        }`}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}
