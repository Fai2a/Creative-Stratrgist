"use client";

import { useState } from "react";
import { Loader2, Save, X } from "lucide-react";
import { GENDER_OPTIONS, GOAL_OPTIONS, type Campaign, type Gender } from "@/lib/campaign";
import { buttonClasses, inputClass, labelClass } from "@/lib/ui";

export interface CampaignEditableFields {
  product_name: string;
  industry: string;
  usp: string;
  chosen_description: string;
  price: number | null;
  website_url: string | null;
  age_min: number;
  age_max: number;
  gender: Gender;
  location: string;
  goal: string;
  campaign_length_days: number;
  user_budget_cap: number | null;
}

export default function CampaignEditForm({
  campaign,
  onSave,
  onCancel,
  saving,
  error,
}: {
  campaign: Campaign;
  onSave: (fields: CampaignEditableFields) => void;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
}) {
  const [productName, setProductName] = useState(campaign.product_name);
  const [industry, setIndustry] = useState(campaign.industry);
  const [usp, setUsp] = useState(campaign.usp);
  const [chosenDescription, setChosenDescription] = useState(
    campaign.chosen_description,
  );
  const [price, setPrice] = useState(campaign.price?.toString() ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(campaign.website_url ?? "");
  const [ageMin, setAgeMin] = useState(campaign.age_min);
  const [ageMax, setAgeMax] = useState(campaign.age_max);
  const [gender, setGender] = useState<Gender>(campaign.gender);
  const [location, setLocation] = useState(campaign.location);
  const [goal, setGoal] = useState(campaign.goal);
  const [campaignLengthDays, setCampaignLengthDays] = useState(
    campaign.campaign_length_days,
  );
  const [userBudgetCap, setUserBudgetCap] = useState(
    campaign.user_budget_cap?.toString() ?? "",
  );

  const canSave =
    productName.trim() &&
    industry.trim() &&
    usp.trim() &&
    chosenDescription.trim() &&
    location.trim() &&
    ageMax >= ageMin;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      product_name: productName.trim(),
      industry: industry.trim(),
      usp: usp.trim(),
      chosen_description: chosenDescription.trim(),
      price: price.trim() ? Number(price) : null,
      website_url: websiteUrl.trim() || null,
      age_min: ageMin,
      age_max: ageMax,
      gender,
      location: location.trim(),
      goal,
      campaign_length_days: campaignLengthDays,
      user_budget_cap: userBudgetCap.trim() ? Number(userBudgetCap) : null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Product name*</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Industry*</label>
          <input
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Unique selling point (USP)*</label>
        <input
          type="text"
          value={usp}
          onChange={(e) => setUsp(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Description*</label>
        <textarea
          rows={3}
          value={chosenDescription}
          onChange={(e) => setChosenDescription(e.target.value)}
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
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Website (optional)</label>
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="h-px bg-border" />

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Minimum age</label>
          <input
            type="number"
            min={13}
            max={99}
            value={ageMin}
            onChange={(e) => setAgeMin(Number(e.target.value))}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Maximum age</label>
          <input
            type="number"
            min={13}
            max={99}
            value={ageMax}
            onChange={(e) => setAgeMax(Number(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Gender</label>
        <div className="inline-flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setGender(opt.value)}
              className={`px-3.5 py-1.5 rounded-full border text-sm transition ${
                gender === opt.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-neutral-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="h-px bg-border" />

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Goal</label>
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className={inputClass}
          >
            {GOAL_OPTIONS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Campaign length (days)</label>
          <input
            type="number"
            min={1}
            value={campaignLengthDays}
            onChange={(e) => setCampaignLengthDays(Number(e.target.value))}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Budget cap (optional)</label>
          <input
            type="number"
            min={0}
            value={userBudgetCap}
            onChange={(e) => setUserBudgetCap(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        The budget plan itself (ranges and platform split) isn&apos;t edited
        here - go to the Budget step in a new campaign to regenerate one.
      </p>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className={buttonClasses("outline", "md")}
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSave || saving}
          className={buttonClasses("primary", "md")}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}
