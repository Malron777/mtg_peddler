"use client";

import { useCreateCollection } from "@/app/lib/hooks/collection/use-collections-data.hook";
import { useBulkImport } from "@/app/lib/hooks/scryfall/use-scryfall.hook";
import { parseBulkImportText } from "@/app/lib/utils/bulk-import-parser";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  FileText,
  Plus,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Step = "basic" | "import" | "review";

interface CollectionForm {
  name: string;
  description: string;
  isPublic: boolean;
  importMethod: "manual" | "text";
  importData?: string;
}

export default function CreateCollectionPage() {
  const router = useRouter();
  const {
    createCollection,
    loading: createLoading,
    error: createError,
  } = useCreateCollection();
  const {
    bulkImport,
    loading: bulkImportLoading,
    error: bulkImportError,
  } = useBulkImport();

  const [currentStep, setCurrentStep] = useState<Step>("basic");
  const [formData, setFormData] = useState<CollectionForm>({
    name: "",
    description: "",
    isPublic: true,
    importMethod: "manual",
  });

  const steps = [
    { key: "basic", label: "Basic Info", icon: Check },
    { key: "import", label: "Import Method", icon: Upload },
    { key: "review", label: "Review & Create", icon: Check },
  ];

  const handleInputChange = (field: keyof CollectionForm, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    const stepOrder: Step[] = ["basic", "import", "review"];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const stepOrder: Step[] = ["basic", "import", "review"];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleCreateCollection = async () => {
    try {
      // Create the collection first
      const collection = await createCollection({
        name: formData.name,
        description: formData.description,
        isPublic: formData.isPublic,
      });

      if (!collection) {
        throw new Error(createError || "Failed to create collection");
      }

      // If we have import data, try to bulk import
      if (formData.importMethod === "text" && formData.importData?.trim()) {
        try {
          const items = parseBulkImportText(formData.importData);

          // Attempt bulk import - if it fails, we still redirect to the collection
          await bulkImport(collection.id, items);
        } catch (bulkError) {
          console.warn(
            "Bulk import failed, but collection was created:",
            bulkError
          );
          // Continue to redirect even if bulk import fails
        }
      }

      // Redirect to the collection page
      router.push(`/collections/${collection.id}`);
    } catch (error) {
      console.error("Failed to create collection:", error);
      // Error handling is managed by the hook
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case "basic":
        return formData.name.trim().length > 0;
      case "import":
        // If text import is selected, require import data
        if (formData.importMethod === "text") {
          return (formData.importData?.trim().length ?? 0) > 0;
        }
        return true;
      case "review":
        return formData.name.trim().length > 0;
      default:
        return false;
    }
  };

  const isLoading = createLoading || bulkImportLoading;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/collections">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Collections
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Create Collection
            </h1>
            <p className="text-slate-600">
              Build your Magic: The Gathering card collection
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.key;
              const isCompleted =
                steps.indexOf(step) <
                steps.indexOf(steps.find((s) => s.key === currentStep)!);

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
                  {index < steps.length - 1 && (
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
          {currentStep === "basic" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Collection Details
                </h2>
                <p className="text-slate-600 mb-6">
                  Give your collection a name and description. You can always
                  edit these later.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Collection Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Modern Staples, Commander Collection"
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
                    placeholder="Describe your collection (optional)"
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Visibility</Label>
                  <div className="mt-2 space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="visibility"
                        checked={formData.isPublic}
                        onChange={() => handleInputChange("isPublic", true)}
                        className="mr-3"
                      />
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-green-600" />
                        <span className="text-slate-700">Public</span>
                        <Badge variant="secondary" className="ml-2">
                          Recommended
                        </Badge>
                      </div>
                    </label>
                    <p className="text-sm text-slate-500 ml-6">
                      Other users can see and trade with your collection
                    </p>

                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="visibility"
                        checked={!formData.isPublic}
                        onChange={() => handleInputChange("isPublic", false)}
                        className="mr-3"
                      />
                      <div className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-700">Private</span>
                      </div>
                    </label>
                    <p className="text-sm text-slate-500 ml-6">
                      Only you can see this collection
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === "import" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Import Method
                </h2>
                <p className="text-slate-600 mb-6">
                  Choose how you'd like to add cards to your collection. You can
                  always add more cards later.
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-start p-4 border border-slate-200 rounded-lg hover:border-olive-300 cursor-pointer">
                  <input
                    type="radio"
                    name="importMethod"
                    checked={formData.importMethod === "manual"}
                    onChange={() => handleInputChange("importMethod", "manual")}
                    className="mr-3 mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Plus className="h-5 w-5 text-olive-600" />
                      <span className="font-medium text-slate-900">
                        Add Cards Manually
                      </span>
                      <Badge variant="secondary">Recommended</Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      Start with an empty collection and add cards one by one
                    </p>
                  </div>
                </label>

                <label className="flex items-start p-4 border border-slate-200 rounded-lg hover:border-olive-300 cursor-pointer">
                  <input
                    type="radio"
                    name="importMethod"
                    checked={formData.importMethod === "text"}
                    onChange={() => handleInputChange("importMethod", "text")}
                    className="mr-3 mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-slate-900">
                        Paste Card List
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      Paste a list of card names from another source
                    </p>
                  </div>
                </label>
              </div>

              {/* Text Import Input */}
              {formData.importMethod === "text" && (
                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                  <div>
                    <Label htmlFor="importData">Card List</Label>
                    <Textarea
                      id="importData"
                      value={formData.importData || ""}
                      onChange={(e) =>
                        handleInputChange("importData", e.target.value)
                      }
                      placeholder="Enter cards in the format:&#10;2x Lightning Bolt&#10;1x Black Lotus&#10;3 Counterspell"
                      className="mt-2 min-h-[120px]"
                    />
                    <p className="text-sm text-slate-600 mt-2">
                      Format: quantity (optional "x") card name, one per line
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === "review" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Review & Create
                </h2>
                <p className="text-slate-600 mb-6">
                  Review your collection details before creating it.
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="font-medium text-slate-900">
                    Collection Name
                  </h3>
                  <p className="text-slate-600">{formData.name}</p>
                </div>

                {formData.description && (
                  <div>
                    <h3 className="font-medium text-slate-900">Description</h3>
                    <p className="text-slate-600">{formData.description}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-medium text-slate-900">Visibility</h3>
                  <p className="text-slate-600">
                    {formData.isPublic ? "Public" : "Private"}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-slate-900">Import Method</h3>
                  <p className="text-slate-600">
                    {formData.importMethod === "manual" && "Add cards manually"}
                    {formData.importMethod === "text" && "Paste card list"}
                  </p>
                  {formData.importMethod === "text" && formData.importData && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-slate-700 mb-1">
                        Cards to Import:
                      </h4>
                      <div className="bg-slate-100 rounded p-3 text-sm text-slate-600 max-h-32 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">
                          {formData.importData}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {(createError || bulkImportError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    {createError && <p>{createError}</p>}
                    {bulkImportError && (
                      <p>Bulk import failed: {bulkImportError}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === "basic"}
            >
              Back
            </Button>

            {currentStep === "review" ? (
              <Button
                onClick={handleCreateCollection}
                disabled={isLoading}
                className="bg-olive-600 hover:bg-olive-700 text-white"
              >
                {isLoading ? "Creating..." : "Create Collection"}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
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
