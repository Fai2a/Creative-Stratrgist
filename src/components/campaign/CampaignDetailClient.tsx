"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2, PencilLine, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Campaign } from "@/lib/campaign";
import CampaignBriefCard from "@/components/CampaignBriefCard";
import CampaignEditForm, {
  type CampaignEditableFields,
} from "@/components/campaign/CampaignEditForm";
import { buttonClasses, cardClass } from "@/lib/ui";

export default function CampaignDetailClient({
  campaign: initialCampaign,
}: {
  campaign: Campaign;
}) {
  const router = useRouter();
  const [campaign, setCampaign] = useState(initialCampaign);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  function extractErrorMessage(err: unknown, fallback: string): string {
    if (err instanceof Error) return err.message;
    if (err && typeof err === "object" && "message" in err) {
      return String((err as { message: unknown }).message);
    }
    return fallback;
  }

  async function handleSaveEdit(fields: CampaignEditableFields) {
    setSaving(true);
    setSaveError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("campaigns")
        .update(fields)
        .eq("id", campaign.id)
        .select()
        .single();
      if (error) throw error;

      setCampaign(data as Campaign);
      setMode("view");
      // The Ad Content and Competitor Analysis panels are separate
      // components that received their own `campaign` prop from the server
      // - refresh so they pick up the edited fields too, not just this card.
      router.refresh();
    } catch (err) {
      setSaveError(extractErrorMessage(err, "Failed to save changes."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDuplicate() {
    setDuplicating(true);
    setActionError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to duplicate a campaign.");

      const { data, error } = await supabase
        .from("campaigns")
        .insert({
          user_id: user.id,
          mode: campaign.mode,
          product_name: `${campaign.product_name} (copy)`,
          raw_description: campaign.raw_description,
          chosen_description: campaign.chosen_description,
          usp: campaign.usp,
          industry: campaign.industry,
          product_image_url: campaign.product_image_url,
          website_url: campaign.website_url,
          price: campaign.price,
          age_min: campaign.age_min,
          age_max: campaign.age_max,
          gender: campaign.gender,
          location: campaign.location,
          goal: campaign.goal,
          campaign_length_days: campaign.campaign_length_days,
          user_budget_cap: campaign.user_budget_cap,
          budget_range_total: campaign.budget_range_total,
          daily_spend_range: campaign.daily_spend_range,
          platform_split: campaign.platform_split,
          mode_recommendation: campaign.mode_recommendation,
          budget_reasoning: campaign.budget_reasoning,
          budget_warning: campaign.budget_warning,
          status: campaign.status,
        })
        .select()
        .single();
      if (error) throw error;

      router.push(`/dashboard/${(data as Campaign).id}`);
    } catch (err) {
      setActionError(extractErrorMessage(err, "Failed to duplicate campaign."));
      setDuplicating(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setActionError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", campaign.id);
      if (error) throw error;

      router.push("/dashboard");
    } catch (err) {
      setActionError(extractErrorMessage(err, "Failed to delete campaign."));
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  if (mode === "edit") {
    return (
      <div className={`${cardClass} p-6 sm:p-8`}>
        <h2 className="text-xl font-semibold tracking-tight mb-6">
          Edit campaign
        </h2>
        <CampaignEditForm
          campaign={campaign}
          onSave={handleSaveEdit}
          onCancel={() => setMode("view")}
          saving={saving}
          error={saveError}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <CampaignBriefCard campaign={campaign} />

      {actionError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {actionError}
        </p>
      )}

      {confirmingDelete ? (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex-wrap">
          <p className="text-sm text-red-700 flex-1 min-w-0">
            Delete this campaign and all its ad content and competitor
            analysis? This can&apos;t be undone.
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className={buttonClasses("outline", "sm")}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className={buttonClasses("danger", "sm")}
            >
              {deleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              {deleting ? "Deleting..." : "Yes, delete"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={buttonClasses("outline", "sm")}
          >
            <PencilLine className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={handleDuplicate}
            disabled={duplicating}
            className={buttonClasses("outline", "sm")}
          >
            {duplicating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {duplicating ? "Duplicating..." : "Duplicate"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className={buttonClasses("danger", "sm")}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
