"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { WizardState } from "@/lib/campaign";

interface ProductStepProps {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ProductStep({
  state,
  update,
  onNext,
  onBack,
}: ProductStepProps) {
  const [intakeMode, setIntakeMode] = useState<"url" | "manual">(
    state.websiteUrl ? "url" : "manual",
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to upload images.");

      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: false });
      if (uploadErr) throw uploadErr;

      const { data: publicUrl } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);

      update({ productImageFile: file, productImageUrl: publicUrl.publicUrl });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const canContinue =
    state.productName.trim() &&
    state.usp.trim() &&
    state.industry.trim() &&
    !uploading;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Tell us about the product</h2>
        <p className="text-sm text-neutral-600 mt-1">
          Paste a website to speed things up later, or fill it in by hand.
        </p>
      </div>

      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => setIntakeMode("url")}
          className={`px-3 py-1.5 rounded-md border ${
            intakeMode === "url"
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-300 text-neutral-600"
          }`}
        >
          I have a website
        </button>
        <button
          type="button"
          onClick={() => setIntakeMode("manual")}
          className={`px-3 py-1.5 rounded-md border ${
            intakeMode === "manual"
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-300 text-neutral-600"
          }`}
        >
          I&apos;ll fill it in manually
        </button>
      </div>

      {intakeMode === "url" && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-700">
            Website URL
          </label>
          <input
            type="url"
            placeholder="https://example.com/product"
            value={state.websiteUrl}
            onChange={(e) => update({ websiteUrl: e.target.value })}
            className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
          />
          <p className="text-xs text-neutral-500">
            We&apos;ll use this to auto-fill product details in a future
            update. For now, please complete the fields below too.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-neutral-700">
          Product image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="text-sm"
        />
        {uploading && <p className="text-xs text-neutral-500">Uploading...</p>}
        {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
        {state.productImageUrl && (
          <Image
            src={state.productImageUrl}
            alt="Product preview"
            width={96}
            height={96}
            className="mt-2 h-24 w-24 object-cover rounded-md border border-neutral-200"
            unoptimized
          />
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-700">
            Product name*
          </label>
          <input
            type="text"
            value={state.productName}
            onChange={(e) => update({ productName: e.target.value })}
            className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-700">
            Industry*
          </label>
          <input
            type="text"
            placeholder="e.g. skincare, SaaS, home goods"
            value={state.industry}
            onChange={(e) => update({ industry: e.target.value })}
            className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-neutral-700">
          Unique selling point (USP)*
        </label>
        <input
          type="text"
          placeholder="What makes this different from alternatives?"
          value={state.usp}
          onChange={(e) => update({ usp: e.target.value })}
          className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-neutral-700">
          Description (optional)
        </label>
        <textarea
          rows={3}
          placeholder="Paste any existing product description - you'll be able to keep, polish, or rewrite it next."
          value={state.rawDescription}
          onChange={(e) => update({ rawDescription: e.target.value })}
          className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-700">
            Price (optional)
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={state.price}
            onChange={(e) => update({ price: e.target.value })}
            className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        {intakeMode === "manual" && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-neutral-700">
              Website (optional)
            </label>
            <input
              type="url"
              value={state.websiteUrl}
              onChange={(e) => update({ websiteUrl: e.target.value })}
              className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-neutral-600 hover:text-neutral-900"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!canContinue}
          onClick={onNext}
          className="bg-neutral-900 text-white rounded-md px-5 py-2 text-sm font-medium disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
