"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  INITIAL_WIZARD_STATE,
  type Campaign,
  type WizardState,
} from "@/lib/campaign";
import Stepper from "@/components/wizard/Stepper";
import ModeStep from "@/components/wizard/ModeStep";
import ProductStep from "@/components/wizard/ProductStep";
import AudienceStep from "@/components/wizard/AudienceStep";
import DescriptionStep from "@/components/wizard/DescriptionStep";
import BudgetStep from "@/components/wizard/BudgetStep";
import SummaryStep from "@/components/wizard/SummaryStep";

export default function WizardClient() {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<WizardState>(INITIAL_WIZARD_STATE);
  const [savedCampaign, setSavedCampaign] = useState<Campaign | null>(null);
  const [approving, setApproving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function update(patch: Partial<WizardState>) {
    setState((prev) => ({ ...prev, ...patch }));
  }

  async function handleApproveBudget() {
    if (!state.budgetResult || !state.mode) return;
    setApproving(true);
    setSaveError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to save a campaign.");

      const { data, error } = await supabase
        .from("campaigns")
        .insert({
          user_id: user.id,
          mode: state.mode,
          product_name: state.productName,
          raw_description: state.rawDescription || null,
          chosen_description: state.chosenDescription,
          usp: state.usp,
          industry: state.industry,
          product_image_url: state.productImageUrl,
          website_url: state.websiteUrl || null,
          price: state.price ? Number(state.price) : null,
          age_min: state.ageMin,
          age_max: state.ageMax,
          gender: state.gender,
          location: state.location,
          goal: state.goal,
          campaign_length_days: state.campaignLengthDays,
          user_budget_cap: state.userBudgetCap
            ? Number(state.userBudgetCap)
            : null,
          budget_range_total: state.budgetResult.budget_range_total,
          daily_spend_range: state.budgetResult.daily_spend_range,
          platform_split: state.budgetResult.platform_split,
          mode_recommendation: state.budgetResult.mode_recommendation,
          budget_reasoning: state.budgetResult.reasoning,
          budget_warning: state.budgetResult.warning,
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;

      setSavedCampaign(data as Campaign);
      setStep(6);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save campaign.",
      );
    } finally {
      setApproving(false);
    }
  }

  function handleStartNew() {
    setState(INITIAL_WIZARD_STATE);
    setSavedCampaign(null);
    setStep(1);
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Stepper current={step} />

      {saveError && (
        <p className="text-sm text-red-600 mb-4 text-center">{saveError}</p>
      )}

      {step === 1 && (
        <ModeStep
          mode={state.mode}
          onChange={(mode) => update({ mode })}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <ProductStep
          state={state}
          update={update}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <AudienceStep
          state={state}
          update={update}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <DescriptionStep
          state={state}
          update={update}
          onNext={() => setStep(5)}
          onBack={() => setStep(3)}
        />
      )}

      {step === 5 && (
        <BudgetStep
          state={state}
          update={update}
          onApprove={handleApproveBudget}
          onBack={() => setStep(4)}
          approving={approving}
        />
      )}

      {step === 6 && savedCampaign && (
        <SummaryStep campaign={savedCampaign} onStartNew={handleStartNew} />
      )}
    </div>
  );
}
