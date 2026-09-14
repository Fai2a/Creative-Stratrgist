"use client";

import { useState } from "react";

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
      className="w-full text-left flex items-center justify-between gap-3 rounded-md border border-neutral-200 px-3 py-2 text-sm hover:border-neutral-400 transition"
    >
      <span>{text}</span>
      <span className="text-xs text-neutral-500 shrink-0">
        {copied ? "Copied!" : "Copy"}
      </span>
    </button>
  );
}
