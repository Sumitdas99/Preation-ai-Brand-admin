import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateBrand } from "@/api/brand";
import { toastSuccess, toastError } from "@/utils/toast";
import { Loader2, Save } from "lucide-react";

interface GeneralTabProps {
    brand: any; // Using any for now, ideally strictly typed
    onUpdate: () => void;
}

export function GeneralTab({ brand, onUpdate }: GeneralTabProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        brandName: brand.brand_name,
        description: brand.description || "",
        synthetic_threshold: brand.synthetic_threshold,
        suitability_threshold: brand.suitability_threshold,
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const cleanNumber = (val: any) => {
        if (val === "" || val === null || val === undefined) return null;
        return parseFloat(val);
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // 1. Update basic details
            // 2. Update thresholds
            const payload: any = {
                brand_name: formData.brandName,
                description: formData.description || undefined,
                synthetic_threshold: cleanNumber(formData.synthetic_threshold),
                suitability_threshold: cleanNumber(formData.suitability_threshold),
            };

            await updateBrand(brand.brand_id, payload);

            toastSuccess("Brand settings have been updated.", "Changes Saved");

            onUpdate(); // Refresh parent
        } catch (error: any) {
            toastError(error.message || "Failed to update settings");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-2xl">
            {/* Basic Details */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Brand Name</Label>
                        <Input
                            id="name"
                            value={formData.brandName}
                            onChange={(e) => handleChange("brandName", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>
            </div>

            <div className="border-t pt-8 space-y-4">
                <h3 className="text-lg font-medium">Compliance Thresholds</h3>
                <p className="text-sm text-muted-foreground">
                    Set the default confidence thresholds for AI compliance checks in this brand.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="synthetic">Synthetic Content Threshold (0.0 - 1.0)</Label>
                        <Input
                            id="synthetic"
                            type="number"
                            step="0.01"
                            min="0" max="1"
                            value={formData.synthetic_threshold ?? ""}
                            onChange={(e) => handleChange("synthetic_threshold", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="suitability">Suitability Threshold (0.0 - 1.0)</Label>
                        <Input
                            id="suitability"
                            type="number"
                            step="0.01"
                            min="0" max="1"
                            value={formData.suitability_threshold ?? ""}
                            onChange={(e) => handleChange("suitability_threshold", e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
