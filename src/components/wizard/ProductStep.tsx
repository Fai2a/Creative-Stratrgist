"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus, Link2, PencilLine } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { WizardState } from "@/lib/campaign";
import { buttonClasses, inputClass, labelClass } from "@/lib/ui";

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
        <h2 className="text-xl font-semibold tracking-tight">
          Tell us about the product
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Paste a website to speed things up later, or fill it in by hand.
        </p>
      </div>

      <div className="inline-flex self-start rounded-lg border border-border bg-muted p-1 text-sm">
        <button
          type="button"
          onClick={() => setIntakeMode("url")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
            intakeMode === "url"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Link2 className="h-3.5 w-3.5" />I have a website
        </button>
        <button
          type="button"
          onClick={() => setIntakeMode("manual")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
            intakeMode === "manual"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <PencilLine className="h-3.5 w-3.5" />
          I&apos;ll fill it in manually
        </button>
      </div>

      {intakeMode === "url" && (
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Website URL</label>
          <input
            type="url"
            placeholder="https://example.com/product"
            value={state.websiteUrl}
            onChange={(e) => update({ websiteUrl: e.target.value })}
            className={inputClass}
          />
          <p className="text-xs text-muted-foreground">
            We&apos;ll use this to auto-fill product details in a future
            update. For now, please complete the fields below too.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Product image</label>
        <label className="flex items-center gap-4 rounded-xl border border-dashed border-border bg-muted/50 px-4 py-4 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition">
          <div className="h-16 w-16 rounded-lg bg-card border border-border flex items-center justify-center shrink-0 overflow-hidden">
            {state.productImageUrl ? (
              <Image
                src={state.productImageUrl}
                alt="Product preview"
                width={64}
                height={64}
                className="h-16 w-16 object-cover"
                unoptimized
              />
            ) : (
              <ImagePlus className="h-6 w-6 text-neutral-400" />
            )}
          </div>
          <div className="text-sm">
            <span className="text-primary font-medium">
              {state.productImageUrl ? "Change image" : "Upload an image"}
            </span>
            <p className="text-muted-foreground text-xs mt-0.5">
              {uploading
                ? "Uploading..."
                : "PNG or JPG, shown in your campaign summary"}
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>
        {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Product name*</label>
          <input
            type="text"
            value={state.productName}
            onChange={(e) => update({ productName: e.target.value })}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Industry*</label>
          <input
            type="text"
            placeholder="e.g. skincare, SaaS, home goods"
            value={state.industry}
            onChange={(e) => update({ industry: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Unique selling point (USP)*</label>
        <input
          type="text"
          placeholder="What makes this different from alternatives?"
          value={state.usp}
          onChange={(e) => update({ usp: e.target.value })}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Description (optional)</label>
        <textarea
          rows={3}
          placeholder="Paste any existing product description - you'll be able to keep, polish, or rewrite it next."
          value={state.rawDescription}
          onChange={(e) => update({ rawDescription: e.target.value })}
          className={inputClass}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Price (optional)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={state.price}
            onChange={(e) => update({ price: e.target.value })}
            className={inputClass}
          />
        </div>
        {intakeMode === "manual" && (
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Website (optional)</label>
            <input
              type="url"
              value={state.websiteUrl}
              onChange={(e) => update({ websiteUrl: e.target.value })}
              className={inputClass}
            />
          </div>
        )}
      </div>

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className={buttonClasses("ghost", "md")}
        >
          Back
        </button>
        <button
          type="button"
          disabled={!canContinue}
          onClick={onNext}
          className={buttonClasses("primary", "md")}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
