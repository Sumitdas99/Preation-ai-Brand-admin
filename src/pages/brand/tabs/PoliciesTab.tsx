import { useState, useEffect } from "react";
import { Shield, Save, AlertTriangle, Loader2, Globe, Monitor, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select";
import { toastSuccess, toastError } from "@/utils/toast";
import { updateBrand } from "@/api/brand";

const NONE_VALUE = "__none__";
const ALL_VALUE = "__all__";

/** Jurisdictions — None & All first, then real options. Empty = no filter. */
const JURISDICTION_OPTIONS: MultiSelectOption[] = [
    { value: NONE_VALUE, label: "None" },
    { value: ALL_VALUE, label: "All" },
    { value: "EU", label: "EU" },
    { value: "DE", label: "Germany (DE)" },
    { value: "FR", label: "France (FR)" },
    { value: "IT", label: "Italy (IT)" },
    { value: "ES", label: "Spain (ES)" },
    { value: "UK", label: "United Kingdom (UK)" },
    { value: "US", label: "United States (US)" },
    { value: "CA", label: "Canada (CA)" },
];

/** Platforms — None & All first. */
const PLATFORM_OPTIONS: MultiSelectOption[] = [
    { value: NONE_VALUE, label: "None" },
    { value: ALL_VALUE, label: "All" },
    { value: "INSTAGRAM", label: "Instagram" },
    { value: "TIKTOK", label: "TikTok" },
    { value: "YOUTUBE", label: "YouTube" },
    { value: "FACEBOOK", label: "Facebook" },
];

/** Policy pack IDs — None & All first. */
const PACK_ID_OPTIONS: MultiSelectOption[] = [
    { value: NONE_VALUE, label: "None" },
    { value: ALL_VALUE, label: "All" },
    { value: "EU_AI_ACT_ART50", label: "EU AI Act Article 50" },
    { value: "EU_DE_OVERLAY", label: "Germany overlay" },
    { value: "EU_FR_OVERLAY", label: "France overlay" },
    { value: "EU_IT_OVERLAY", label: "Italy overlay" },
    { value: "EU_ES_OVERLAY", label: "Spain overlay" },
    { value: "INSTAGRAM_RULES", label: "Instagram rules" },
    { value: "YOUTUBE_RULES", label: "YouTube rules" },
    { value: "TIKTOK_RULES", label: "TikTok rules" },
    { value: "FACEBOOK_RULES", label: "Facebook rules" },
];

const REAL_JURISDICTIONS = JURISDICTION_OPTIONS.filter((o) => o.value !== NONE_VALUE && o.value !== ALL_VALUE).map((o) => o.value);
const REAL_PLATFORMS = PLATFORM_OPTIONS.filter((o) => o.value !== NONE_VALUE && o.value !== ALL_VALUE).map((o) => o.value);
const REAL_PACK_IDS = PACK_ID_OPTIONS.filter((o) => o.value !== NONE_VALUE && o.value !== ALL_VALUE).map((o) => o.value);

function toStrList(v: unknown): string[] {
    if (Array.isArray(v)) return v.map((x) => String(x)).filter(Boolean);
    return [];
}

interface PoliciesTabProps {
    brand: any;
    onUpdate: () => void;
}

export function PoliciesTab({ brand, onUpdate }: PoliciesTabProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Workspace/brand policy scope (Spec 2.7) — from getBrand, saved via updateBrand
    const [enabledJurisdictions, setEnabledJurisdictions] = useState<string[]>([]);
    const [enabledPlatforms, setEnabledPlatforms] = useState<string[]>([]);
    const [enabledPackIds, setEnabledPackIds] = useState<string[]>([]);

    // Initialize policies from workspace data
    const [policies, setPolicies] = useState([
        {
            name: "Synthetic Content Detection",
            description: "Thresholds for synthetic media detection",
            settings: [
                {
                    key: "synthetic_threshold",
                    label: "Synthetic Confidence Threshold",
                    description: "Block assets above this confidence level",
                    value: brand?.synthetic_threshold ? Math.round(brand.synthetic_threshold * 100) : 85,
                    min: 0,
                    max: 100,
                    unit: "%",
                },
            ],
        },
        {
            name: "Brand Suitability",
            description: "Content safety and appropriateness checks",
            settings: [
                {
                    key: "alcohol_threshold",
                    label: "Alcohol Detection Threshold",
                    description: "Flag content above this confidence level",
                    value: 70,
                    min: 0,
                    max: 100,
                    unit: "%",
                },
                {
                    key: "minors_threshold",
                    label: "Minors Detection Threshold",
                    description: "Strict threshold for under-18 detection",
                    value: 50,
                    min: 0,
                    max: 100,
                    unit: "%",
                },
                {
                    key: "violence_threshold",
                    label: "Violence Detection Threshold",
                    description: "Block violent content above this level",
                    value: 60,
                    min: 0,
                    max: 100,
                    unit: "%",
                },
            ],
        },
        {
            name: "Geo-Specific Rules",
            description: "Regulatory requirements by geography",
            settings: [
                {
                    key: "germany_strict",
                    label: "Germany (Strictest)",
                    description: "EU AI Act Article 50 compliance",
                    value: true,
                    type: "boolean",
                },
                {
                    key: "france_beauty",
                    label: "France Beauty Standards",
                    description: "Stricter rules for beauty/minor combinations",
                    value: true,
                    type: "boolean",
                },
            ],
        },
    ]);

    // Update policies when brand changes
    useEffect(() => {
        if (brand) {
            setPolicies((prev) => {
                const updated = [...prev];
                const syntheticIndex = updated.findIndex((cat) => cat.name === "Synthetic Content Detection");
                if (syntheticIndex !== -1 && brand.synthetic_threshold !== undefined) {
                    updated[syntheticIndex].settings[0].value = Math.round(brand.synthetic_threshold * 100);
                }
                return updated;
            });
            setEnabledJurisdictions(toStrList(brand.enabled_jurisdictions));
            setEnabledPlatforms(toStrList(brand.enabled_platforms));
            setEnabledPackIds(toStrList(brand.enabled_pack_ids));
        }
    }, [brand]);

    const handleJurisdictionsChange = (next: string[]) => {
        if (next.includes(NONE_VALUE)) {
            setEnabledJurisdictions([]);
            return;
        }
        if (next.includes(ALL_VALUE)) {
            setEnabledJurisdictions(REAL_JURISDICTIONS);
            return;
        }
        setEnabledJurisdictions(next.filter((v) => v !== NONE_VALUE && v !== ALL_VALUE));
    };
    const handlePlatformsChange = (next: string[]) => {
        if (next.includes(NONE_VALUE)) {
            setEnabledPlatforms([]);
            return;
        }
        if (next.includes(ALL_VALUE)) {
            setEnabledPlatforms(REAL_PLATFORMS);
            return;
        }
        setEnabledPlatforms(next.filter((v) => v !== NONE_VALUE && v !== ALL_VALUE));
    };
    const handlePackIdsChange = (next: string[]) => {
        if (next.includes(NONE_VALUE)) {
            setEnabledPackIds([]);
            return;
        }
        if (next.includes(ALL_VALUE)) {
            setEnabledPackIds(REAL_PACK_IDS);
            return;
        }
        setEnabledPackIds(next.filter((v) => v !== NONE_VALUE && v !== ALL_VALUE));
    };

    const handleSliderChange = (categoryIndex: number, settingIndex: number, value: number[]) => {
        const updated = [...policies];
        updated[categoryIndex].settings[settingIndex].value = value[0];
        setPolicies(updated);
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Extract synthetic_threshold from policies and convert back to 0-1 range
            const syntheticCategory = policies.find((cat) => cat.name === "Synthetic Content Detection");
            const syntheticThreshold = syntheticCategory?.settings[0]?.value
                ? (syntheticCategory.settings[0].value as number) / 100
                : brand?.synthetic_threshold;

            const payload: any = {
                synthetic_threshold: syntheticThreshold,
                enabled_jurisdictions: enabledJurisdictions.length ? enabledJurisdictions : null,
                enabled_platforms: enabledPlatforms.length ? enabledPlatforms : null,
                enabled_pack_ids: enabledPackIds.length ? enabledPackIds : null,
            };

            await updateBrand(brand.brand_id, payload);

            toastSuccess("Your policy configurations have been updated", "Policies saved");

            onUpdate(); // Refresh brand data
        } catch (error: any) {
            toastError(error.message || "Failed to save policies");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Workspace policy scope (Spec 2.7) — jurisdictions, platforms, packs */}
            <Card className="card-shadow">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light">
                            <Globe className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-display">Workspace policy scope</CardTitle>
                            <CardDescription className="mt-1">
                                Limit which jurisdictions, platforms, and policy packs apply. Leave empty for no filter (all apply).
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-base font-medium flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Enabled jurisdictions
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Regions to apply regulatory/geo packs (e.g. DE, FR, EU). Empty = all regions.
                        </p>
                        <MultiSelect
                            options={JURISDICTION_OPTIONS}
                            value={enabledJurisdictions}
                            onChange={handleJurisdictionsChange}
                            placeholder="All jurisdictions"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-base font-medium flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            Enabled platforms
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Platforms to apply platform-specific packs. Empty = all platforms.
                        </p>
                        <MultiSelect
                            options={PLATFORM_OPTIONS}
                            value={enabledPlatforms}
                            onChange={handlePlatformsChange}
                            placeholder="All platforms"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-base font-medium flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Enabled policy packs
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Allowlist of policy pack IDs. Empty = no filter (selector chooses packs by context).
                        </p>
                        <MultiSelect
                            options={PACK_ID_OPTIONS}
                            value={enabledPackIds}
                            onChange={handlePackIdsChange}
                            placeholder="No filter (auto by context)"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Policy Categories */}
            <div className="space-y-4">
                {policies.map((category, categoryIndex) => (
                    <Card key={category.name} className="card-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light">
                                    <Shield className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-display">{category.name}</CardTitle>
                                    <CardDescription className="mt-1">{category.description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {category.settings.map((setting, settingIndex) => (
                                <div key={setting.key} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="text-base font-medium">{setting.label}</Label>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {setting.description}
                                            </p>
                                        </div>
                                        {setting.type === "boolean" ? (
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={setting.value as boolean}
                                                    onCheckedChange={(checked) => {
                                                        const updated = [...policies];
                                                        updated[categoryIndex].settings[settingIndex].value = checked;
                                                        setPolicies(updated);
                                                    }}
                                                />
                                                <span className="text-sm">
                                                    {setting.value ? "Enabled" : "Disabled"}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold">
                                                    {setting.value}
                                                    {setting.unit}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {setting.type !== "boolean" && (
                                        <Slider
                                            value={[setting.value as number]}
                                            onValueChange={(value) =>
                                                handleSliderChange(categoryIndex, settingIndex, value)
                                            }
                                            min={setting.min}
                                            max={setting.max}
                                            step={1}
                                            className="w-full"
                                        />
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Warning */}
            <Card className="border-warning bg-warning-light/10">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-warning" />
                        <div>
                            <h4 className="font-medium text-warning">Policy Changes</h4>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Changes to policies will affect all new asset scans. Existing assets will not be
                                re-evaluated unless manually re-scanned.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isLoading} className="bg-gradient-primary">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                </Button>
            </div>
        </div>
    );
}

