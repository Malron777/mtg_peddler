"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  CheckCircle,
  DollarSign,
  Heart,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface WantListForm {
  name: string;
  description: string;
  priority: "high" | "medium" | "low";
  budget: number;
  maxPricePerCard: number;
  conditionPreferences: string[];
  importData?: string;
}

export default function CreateWantListPage() {
  const [formData, setFormData] = useState<WantListForm>({
    name: "",
    description: "",
    priority: "medium",
    budget: 0,
    maxPricePerCard: 0,
    conditionPreferences: ["nm", "lp"],
    importData: "",
  });

  const [currentStep, setCurrentStep] = useState<
    "details" | "budget" | "preferences" | "import"
  >("details");

  const handleInputChange = (field: keyof WantListForm, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConditionToggle = (condition: string) => {
    setFormData((prev) => ({
      ...prev,
      conditionPreferences: prev.conditionPreferences.includes(condition)
        ? prev.conditionPreferences.filter((c) => c !== condition)
        : [...prev.conditionPreferences, condition],
    }));
  };

  const handleCreateWantList = () => {
    // TODO: Implement want list creation
    console.log("Creating want list:", formData);
  };

  const isFormValid = () => {
    return formData.name.trim().length > 0 && formData.budget > 0;
  };

  const conditionOptions = [
    { key: "nm", label: "Near Mint", description: "Perfect condition" },
    { key: "lp", label: "Lightly Played", description: "Minor wear" },
    { key: "mp", label: "Moderately Played", description: "Moderate wear" },
    { key: "hp", label: "Heavily Played", description: "Significant wear" },
    { key: "dmg", label: "Damaged", description: "Major damage" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/wants">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Want Lists
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Create Want List
            </h1>
            <p className="text-slate-600">
              Create a list of cards you're looking for
            </p>
          </div>
        </div>

        {/* Step Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { key: "details", label: "Details", icon: Heart },
              { key: "budget", label: "Budget", icon: DollarSign },
              { key: "preferences", label: "Preferences", icon: Target },
              { key: "import", label: "Import", icon: CheckCircle },
            ].map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.key;
              const isCompleted =
                ["details", "budget", "preferences", "import"].indexOf(
                  step.key
                ) <
                ["details", "budget", "preferences", "import"].indexOf(
                  currentStep
                );

              return (
                <div key={step.key} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isActive
                        ? "border-olive-600 bg-olive-600 text-white"
                        : isCompleted
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-slate-300 bg-white text-slate-400"
                    }`}
                  >
                    <StepIcon className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <div
                      className={`text-sm font-medium ${
                        isActive
                          ? "text-olive-600"
                          : isCompleted
                          ? "text-green-600"
                          : "text-slate-500"
                      }`}
                    >
                      {step.label}
                    </div>
                  </div>
                  {index < 3 && (
                    <div
                      className={`w-16 h-0.5 mx-4 ${
                        isCompleted ? "bg-green-500" : "bg-slate-300"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <Card className="p-8">
          {currentStep === "details" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Want List Details
                </h2>
                <p className="text-slate-600 mb-6">
                  Give your want list a name and description to help others
                  understand what you're looking for.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Want List Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Modern Burn Deck, Commander Staples"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Describe what you're looking for (optional)"
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Priority Level</Label>
                  <div className="mt-2 space-y-2">
                    {[
                      {
                        key: "high",
                        label: "High Priority",
                        description: "Actively looking for these cards",
                      },
                      {
                        key: "medium",
                        label: "Medium Priority",
                        description: "Would like to acquire these cards",
                      },
                      {
                        key: "low",
                        label: "Low Priority",
                        description: "Nice to have cards",
                      },
                    ].map((priority) => (
                      <label key={priority.key} className="flex items-start">
                        <input
                          type="radio"
                          name="priority"
                          checked={formData.priority === priority.key}
                          onChange={() =>
                            handleInputChange("priority", priority.key)
                          }
                          className="mr-3 mt-1"
                        />
                        <div>
                          <div className="font-medium text-slate-700">
                            {priority.label}
                          </div>
                          <div className="text-sm text-slate-500">
                            {priority.description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === "budget" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Budget Settings
                </h2>
                <p className="text-slate-600 mb-6">
                  Set your budget preferences to help sellers understand your
                  price range.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="budget">Total Budget *</Label>
                  <div className="mt-1 relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="budget"
                      type="number"
                      value={formData.budget}
                      onChange={(e) =>
                        handleInputChange(
                          "budget",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0.00"
                      className="pl-10"
                    />
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Maximum amount you're willing to spend on this want list
                  </p>
                </div>

                <div>
                  <Label htmlFor="maxPricePerCard">Max Price Per Card</Label>
                  <div className="mt-1 relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="maxPricePerCard"
                      type="number"
                      value={formData.maxPricePerCard}
                      onChange={(e) =>
                        handleInputChange(
                          "maxPricePerCard",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0.00"
                      className="pl-10"
                    />
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Maximum price you're willing to pay for any single card
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === "preferences" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Condition Preferences
                </h2>
                <p className="text-slate-600 mb-6">
                  Select the card conditions you're willing to accept.
                </p>
              </div>

              <div className="space-y-3">
                {conditionOptions.map((condition) => (
                  <label
                    key={condition.key}
                    className="flex items-start p-3 border border-slate-200 rounded-lg hover:border-olive-300 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.conditionPreferences.includes(
                        condition.key
                      )}
                      onChange={() => handleConditionToggle(condition.key)}
                      className="mr-3 mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-700">
                        {condition.label}
                      </div>
                      <div className="text-sm text-slate-500">
                        {condition.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {currentStep === "import" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Import Card List
                </h2>
                <p className="text-slate-600 mb-6">
                  Paste a list of card names you're looking for. One card per
                  line.
                </p>
              </div>

              <div>
                <Label htmlFor="importData">Card List</Label>
                <Textarea
                  id="importData"
                  value={formData.importData}
                  onChange={(e) =>
                    handleInputChange("importData", e.target.value)
                  }
                  placeholder="Lightning Bolt&#10;Chain Lightning&#10;Lava Spike&#10;..."
                  className="mt-1"
                  rows={8}
                />
                <p className="text-sm text-slate-500 mt-1">
                  Enter one card name per line. You can also add quantities like
                  "Lightning Bolt x4"
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => {
                const steps = ["details", "budget", "preferences", "import"];
                const currentIndex = steps.indexOf(currentStep);
                if (currentIndex > 0) {
                  setCurrentStep(steps[currentIndex - 1] as any);
                }
              }}
              disabled={currentStep === "details"}
            >
              Back
            </Button>

            {currentStep === "import" ? (
              <Button
                onClick={handleCreateWantList}
                disabled={!isFormValid()}
                className="bg-olive-600 hover:bg-olive-700 text-white"
              >
                Create Want List
              </Button>
            ) : (
              <Button
                onClick={() => {
                  const steps = ["details", "budget", "preferences", "import"];
                  const currentIndex = steps.indexOf(currentStep);
                  if (currentIndex < steps.length - 1) {
                    setCurrentStep(steps[currentIndex + 1] as any);
                  }
                }}
                disabled={currentStep === "details" && !formData.name.trim()}
                className="bg-olive-600 hover:bg-olive-700 text-white"
              >
                Next
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
