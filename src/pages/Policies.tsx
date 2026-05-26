import { useState, useEffect } from "react";
import { Save, AlertTriangle, Loader2, ChevronDown, ChevronUp, Globe, Monitor, Package, Sparkles, Eye, ShieldCheck, Info, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select";
import { toastSuccess, toastError } from "@/utils/toast";
import { getBrand, updateBrand } from "@/api/brand";
import { useSelector } from "react-redux";
import { selectAuthUser } from "@/context/slice/authSlice";
import { Skeleton } from "@/components/ui/skeleton";

// Special values for None / All (not sent to API)
const NONE_VALUE = "__none__";
const ALL_VALUE = "__all__";

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
const PLATFORM_OPTIONS: MultiSelectOption[] = [
  { value: NONE_VALUE, label: "None" },
  { value: ALL_VALUE, label: "All" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "FACEBOOK", label: "Facebook" },
];
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

// System default thresholds — matches backend defaults
const SYSTEM_DEFAULTS: Record<string, number> = {
  workspace_ai_threshold: 0.8,
  workspace_deepfake_threshold: 0.8,
  rpl_celebrity_threshold: 0.5,
  nudity_sexual_activity_block_threshold: 0.7,
  nudity_erotica_block_threshold: 0.6,
  violence_block_threshold: 0.8,
  weapons_block_threshold: 0.7,
  alcohol_block_threshold: 0.7,
  drugs_block_threshold: 0.6,
  gore_block_threshold: 0.7,
  gambling_block_threshold: 0.7,
};

interface PolicySetting {
  key: string;
  label: string;
  description: string;
  value: number;
  default: number;
  min: number;
  max: number;
  unit?: string;
  type?: "boolean" | "number";
  blockKey?: string;
  isCritical?: boolean;
}

interface PolicyCategory {
  name: string;
  description: string;
  settings: PolicySetting[];
  isOpen?: boolean;
}

const initializePolicyCategories = (brandData: any = null): PolicyCategory[] => {
  const getValue = (key: string): number => {
    if (brandData && brandData[key] !== null && brandData[key] !== undefined) {
      return brandData[key];
    }
    return SYSTEM_DEFAULTS[key] ?? 0.5;
  };

  return [
    {
      name: "Synthetic Content Detection",
      description: "AI-generated content and deepfake detection thresholds",
      isOpen: true,
      settings: [
        {
          key: "workspace_ai_threshold",
          label: "AI-generated — block threshold",
          description: "Block content when AI-generated confidence exceeds this threshold",
          value: getValue("workspace_ai_threshold"),
          default: SYSTEM_DEFAULTS.workspace_ai_threshold,
          min: 0,
          max: SYSTEM_DEFAULTS.workspace_ai_threshold,
          type: "number",
        },
        {
          key: "workspace_deepfake_threshold",
          label: "Deepfake — block threshold",
          description: "Block content when deepfake confidence exceeds this threshold",
          value: getValue("workspace_deepfake_threshold"),
          default: SYSTEM_DEFAULTS.workspace_deepfake_threshold,
          min: 0,
          max: SYSTEM_DEFAULTS.workspace_deepfake_threshold,
          type: "number",
        },
      ],
    },
    {
      name: "Celebrity Likeness Detection",
      description: "Celebrity and public figure likeness detection threshold",
      isOpen: true,
      settings: [
        {
          key: "rpl_celebrity_threshold",
          label: "Celebrity likeness — block threshold",
          description: "Block content when celebrity likeness confidence exceeds this threshold",
          value: getValue("rpl_celebrity_threshold"),
          default: SYSTEM_DEFAULTS.rpl_celebrity_threshold,
          min: 0,
          max: SYSTEM_DEFAULTS.rpl_celebrity_threshold,
          type: "number",
        },
      ],
    },
    {
      name: "Brand Suitability",
      description: "Content safety and appropriateness thresholds",
      isOpen: true,
      settings: [
        {
          key: "nudity_sexual_activity_block_threshold",
          label: "Nudity — sexual/display block",
          description: "Block content when nudity / sexual activity confidence exceeds this threshold",
          value: getValue("nudity_sexual_activity_block_threshold"),
          default: SYSTEM_DEFAULTS.nudity_sexual_activity_block_threshold,
          min: 0,
          max: SYSTEM_DEFAULTS.nudity_sexual_activity_block_threshold,
          type: "number",
        },
        {
          key: "nudity_erotica_block_threshold",
          label: "Nudity — erotica block",
          description: "Block content when erotica confidence exceeds this threshold",
          value: getValue("nudity_erotica_block_threshold"),
          default: SYSTEM_DEFAULTS.nudity_erotica_block_threshold,
          min: 0,
          max: SYSTEM_DEFAULTS.nudity_erotica_block_threshold,
          type: "number",
        },
        {
          key: "violence_block_threshold",
          label: "Violence block",
          description: "Block content when violence confidence exceeds this threshold",
          value: getValue("violence_block_threshold"),
          default: SYSTEM_DEFAULTS.violence_block_threshold,
          min: 0,
          max: SYSTEM_DEFAULTS.violence_block_threshold,
          type: "number",
        },
        {
          key: "weapons_block_threshold",
          label: "Weapons block",
          description: "Block content when weapons confidence exceeds this threshold",
          value: getValue("weapons_block_threshold"),
          default: SYSTEM_DEFAULTS.weapons_block_threshold,
          min: 0,
          max: SYSTEM_DEFAULTS.weapons_block_threshold,
          type: "number",
        },
        {
          key: "alcohol_block_threshold",
          label: "Alcohol block",
          description: "Block content when alcohol confidence exceeds this threshold",
          value: getValue("alcohol_block_threshold"),
          default: SYSTEM_DEFAULTS.alcohol_block_threshold,
          min: 0,
          max: SYSTEM_DEFAULTS.alcohol_block_threshold,
          type: "number",
        },
        {
          key: "drugs_block_threshold",
          label: "Drugs block",
          description: "Block content when drugs confidence exceeds this threshold",
          value: getValue("drugs_block_threshold"),
          default: SYSTEM_DEFAULTS.drugs_block_threshold,
          min: 0,
          max: SYSTEM_DEFAULTS.drugs_block_threshold,
          type: "number",
        },
        {
          key: "gore_block_threshold",
          label: "Gore block",
          description: "Block content when gore confidence exceeds this threshold",
          value: getValue("gore_block_threshold"),
          default: SYSTEM_DEFAULTS.gore_block_threshold,
          min: 0,
          max: SYSTEM_DEFAULTS.gore_block_threshold,
          type: "number",
        },
        {
          key: "gambling_block_threshold",
          label: "Gambling block",
          description: "Block content when gambling confidence exceeds this threshold",
          value: getValue("gambling_block_threshold"),
          default: SYSTEM_DEFAULTS.gambling_block_threshold,
          min: 0,
          max: SYSTEM_DEFAULTS.gambling_block_threshold,
          type: "number",
        },
      ],
    },
  ];
};

export default function Policies() {
  const [policies, setPolicies] = useState<PolicyCategory[]>(initializePolicyCategories());
  const [brand, setBrand] = useState<any>(null);
  const [isLoadingBrand, setIsLoadingBrand] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [workspaceScopeOpen, setWorkspaceScopeOpen] = useState(true);
  const [enabledJurisdictions, setEnabledJurisdictions] = useState<string[]>([]);
  const [enabledPlatforms, setEnabledPlatforms] = useState<string[]>([]);
  const [enabledPackIds, setEnabledPackIds] = useState<string[]>([]);
  const user = useSelector(selectAuthUser);
  const brandId = user?.brandId || user?.brand_id;

  useEffect(() => {
    if (brandId) {
      loadBrandData(brandId);
    } else {
      setPolicies(initializePolicyCategories());
      setBrand(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId]);

  const loadBrandData = async (id: string) => {
    setIsLoadingBrand(true);
    try {
      const brandData = await getBrand(id);
      setBrand(brandData);
      setPolicies(initializePolicyCategories(brandData));
      setEnabledJurisdictions(toStrList(brandData.enabled_jurisdictions));
      setEnabledPlatforms(toStrList(brandData.enabled_platforms));
      setEnabledPackIds(toStrList(brandData.enabled_pack_ids));
    } catch (error: any) {
      toastError(error.message || "Failed to load brand data");
      setPolicies(initializePolicyCategories());
    } finally {
      setIsLoadingBrand(false);
    }
  };

  // Validate against backend defaults (0–1 range only)
  const validateThreshold = (key: string, value: number): { isValid: boolean; error?: string } => {
    if (value < 0 || value > 1) {
      return { isValid: false, error: `${key} must be between 0.0 and 1.0` };
    }
    return { isValid: true };
  };

  const handleSliderChange = (categoryIndex: number, settingIndex: number, value: number[]) => {
    const updated = [...policies];
    const setting = updated[categoryIndex].settings[settingIndex];
    const newValue = value[0];

    if (setting.type === "number") {
      const validation = validateThreshold(setting.key, newValue);
      if (!validation.isValid) {
        toastError(validation.error || "Invalid threshold value");
        return;
      }
    }

    setting.value = newValue;
    setPolicies(updated);
  };

  const handleSave = async () => {
    if (!brandId) {
      toastError("Brand context missing", "No brand selected");
      return;
    }

    for (const category of policies) {
      for (const setting of category.settings) {
        if (setting.type === "number") {
          const validation = validateThreshold(setting.key, setting.value);
          if (!validation.isValid) {
            toastError(validation.error || `Invalid value for ${setting.label}`);
            return;
          }
        }
      }
    }

    setIsSaving(true);
    try {
      const payload: any = {};

      policies.forEach((category) => {
        category.settings.forEach((setting) => {
          payload[setting.key] = parseFloat(setting.value.toFixed(2));
        });
      });

      payload.enabled_jurisdictions = enabledJurisdictions.length ? enabledJurisdictions : null;
      payload.enabled_platforms = enabledPlatforms.length ? enabledPlatforms : null;
      payload.enabled_pack_ids = enabledPackIds.length ? enabledPackIds : null;

      await updateBrand(brandId, payload);

      toastSuccess(
        `Policy configurations for ${brand?.brand_name || "brand"} have been updated`,
        "Policies saved"
      );

      await loadBrandData(brandId);
    } catch (error: any) {
      toastError(error.message || "Failed to save policies");
    } finally {
      setIsSaving(false);
    }
  };

  const handleJurisdictionsChange = (next: string[]) => {
    if (next.includes(NONE_VALUE)) { setEnabledJurisdictions([]); return; }
    if (next.includes(ALL_VALUE)) { setEnabledJurisdictions(REAL_JURISDICTIONS); return; }
    setEnabledJurisdictions(next.filter((v) => v !== NONE_VALUE && v !== ALL_VALUE));
  };
  const handlePlatformsChange = (next: string[]) => {
    if (next.includes(NONE_VALUE)) { setEnabledPlatforms([]); return; }
    if (next.includes(ALL_VALUE)) { setEnabledPlatforms(REAL_PLATFORMS); return; }
    setEnabledPlatforms(next.filter((v) => v !== NONE_VALUE && v !== ALL_VALUE));
  };
  const handlePackIdsChange = (next: string[]) => {
    if (next.includes(NONE_VALUE)) { setEnabledPackIds([]); return; }
    if (next.includes(ALL_VALUE)) { setEnabledPackIds(REAL_PACK_IDS); return; }
    setEnabledPackIds(next.filter((v) => v !== NONE_VALUE && v !== ALL_VALUE));
  };

  const isDeviatingFromDefault = (setting: PolicySetting): boolean =>
    Math.abs(setting.value - setting.default) > 0.001;

  const isReducingStrictness = (setting: PolicySetting): boolean =>
    setting.value < setting.default;

  const formatValue = (value: number, type?: string): string => {
    if (type === "boolean") return value === 1 ? "Enabled" : "Disabled";
    return (value * 100).toFixed(0) + "%";
  };

  const formatDecimal = (value: number): string => value.toFixed(2);

  // Scope summary chips helper
  const scopeItems = [
    { label: "Jurisdictions", values: enabledJurisdictions, icon: Globe },
    { label: "Platforms", values: enabledPlatforms, icon: Monitor },
    { label: "Policy Packs", values: enabledPackIds, icon: Package },
  ];

  const isListEqual = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, index) => val === sortedB[index]);
  };

  const hasChanges = () => {
    if (!brand) return false;

    const originalJurisdictions = toStrList(brand.enabled_jurisdictions);
    const originalPlatforms = toStrList(brand.enabled_platforms);
    const originalPackIds = toStrList(brand.enabled_pack_ids);

    const jurisdictionsChanged = !isListEqual(enabledJurisdictions, originalJurisdictions);
    const platformsChanged = !isListEqual(enabledPlatforms, originalPlatforms);
    const packIdsChanged = !isListEqual(enabledPackIds, originalPackIds);

    const policyChanged = policies.some((category) =>
      category.settings.some((setting) => {
        const originalValue = brand[setting.key] !== null && brand[setting.key] !== undefined
          ? brand[setting.key]
          : SYSTEM_DEFAULTS[setting.key] ?? 0.5;
        return Math.abs(setting.value - originalValue) > 0.001;
      })
    );

    return jurisdictionsChanged || platformsChanged || packIdsChanged || policyChanged;
  };

  // Determine icon/colors per category name
  const getCategoryMeta = (name: string) => {
    switch (name) {
      case "Synthetic Content Detection":
        return {
          Icon: Sparkles,
          iconBg: "bg-violet-100 dark:bg-violet-900/30",
          iconColor: "text-violet-600 dark:text-violet-400",
        };
      case "Celebrity Likeness Detection":
        return {
          Icon: Star,
          iconBg: "bg-pink-100 dark:bg-pink-900/30",
          iconColor: "text-pink-600 dark:text-pink-400",
        };
      case "Brand Suitability":
      default:
        return {
          Icon: Eye,
          iconBg: "bg-sky-100 dark:bg-sky-900/30",
          iconColor: "text-sky-600 dark:text-sky-400",
        };
    }
  };

  return (
    <div className="space-y-5 p-4 md:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Policies</h1>
          <p className="mt-1 text-muted-foreground">Configure compliance policies and thresholds</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto lg:justify-end">
          <div className="w-full sm:w-64">
            <div className="flex h-9 items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm opacity-80 w-full">
              <span className="font-medium truncate" title={user?.brandName}>
                {user?.brandName || "Assigned Brand"}
              </span>
              <span className="text-xs text-muted-foreground ml-2 shrink-0">(Brand)</span>
            </div>
          </div>
          <Button
            className="bg-gradient-primary w-full sm:w-auto shrink-0"
            onClick={handleSave}
            disabled={!brandId || isSaving || isLoadingBrand || !hasChanges()}
          >
            {isSaving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
            ) : (
              <><Save className="mr-2 h-4 w-4" />Save Changes</>
            )}
          </Button>
        </div>
      </div>

      {isLoadingBrand && (
        <div className="space-y-5">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      )}

      {brand ? (
        <>
          {/* ── Workspace Policy Scope ─────────────────────────────────────── */}
          <Collapsible open={workspaceScopeOpen} onOpenChange={setWorkspaceScopeOpen}>
            <Card className="overflow-hidden border border-border/60 shadow-sm">
              <CollapsibleTrigger className="w-full text-left">
                <div className="flex items-center justify-between px-6 py-4 hover:bg-accent/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-base font-display">Workspace policy scope</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Limit which jurisdictions, platforms, and policy packs apply
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Collapsed summary chips */}
                    {!workspaceScopeOpen && (
                      <div className="hidden sm:flex items-center gap-2">
                        {scopeItems.map(({ label, values }) =>
                          values.length > 0 ? (
                            <span
                              key={label}
                              className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                            >
                              {values.length} {label}
                            </span>
                          ) : null
                        )}
                      </div>
                    )}
                    {workspaceScopeOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                {/* Subtle divider */}
                <div className="h-px bg-border/60 mx-6" />

                <div className="px-6 py-5 grid gap-6 sm:grid-cols-3">
                  {/* Jurisdictions */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
                        <Globe className="h-3.5 w-3.5 text-blue-500" />
                      </div>
                      <Label className="text-sm font-semibold">Jurisdictions</Label>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Regions for regulatory/geo packs (e.g. DE, FR, EU). Empty = all regions.
                    </p>
                    <MultiSelect
                      options={JURISDICTION_OPTIONS}
                      value={enabledJurisdictions}
                      onChange={handleJurisdictionsChange}
                      placeholder="All jurisdictions"
                    />
                    {enabledJurisdictions.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {enabledJurisdictions.slice(0, 4).map((v) => (
                          <span key={v} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                            {v}
                          </span>
                        ))}
                        {enabledJurisdictions.length > 4 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                            +{enabledJurisdictions.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Platforms */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
                        <Monitor className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                      <Label className="text-sm font-semibold">Platforms</Label>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Platform-specific packs to apply. Empty = all platforms.
                    </p>
                    <MultiSelect
                      options={PLATFORM_OPTIONS}
                      value={enabledPlatforms}
                      onChange={handlePlatformsChange}
                      placeholder="All platforms"
                    />
                    {enabledPlatforms.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {enabledPlatforms.slice(0, 4).map((v) => (
                          <span key={v} className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                            {v}
                          </span>
                        ))}
                        {enabledPlatforms.length > 4 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                            +{enabledPlatforms.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Policy Packs */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10">
                        <Package className="h-3.5 w-3.5 text-violet-500" />
                      </div>
                      <Label className="text-sm font-semibold">Policy Packs</Label>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Allowlist of pack IDs. Empty = auto-selected by context.
                    </p>
                    <MultiSelect
                      options={PACK_ID_OPTIONS}
                      value={enabledPackIds}
                      onChange={handlePackIdsChange}
                      placeholder="No filter (auto)"
                    />
                    {enabledPackIds.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {enabledPackIds.slice(0, 2).map((v) => (
                          <span key={v} className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium">
                            {v}
                          </span>
                        ))}
                        {enabledPackIds.length > 2 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                            +{enabledPackIds.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer hint */}
                <div className="mx-6 mb-5 flex items-center gap-2 rounded-lg bg-muted/50 border border-border/40 px-3 py-2.5">
                  <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <p className="text-[11px] text-muted-foreground">
                    Leave all fields empty to apply no filters — all jurisdictions, platforms, and packs will be active.
                  </p>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* ── Policy Categories ──────────────────────────────────────────── */}
          <div className="space-y-5">
            {policies.map((category, categoryIndex) => {
              const { Icon: CategoryIcon, iconBg, iconColor } = getCategoryMeta(category.name);

              return (
                <Collapsible
                  key={category.name}
                  open={category.isOpen}
                  onOpenChange={(open) => {
                    const updated = [...policies];
                    updated[categoryIndex].isOpen = open;
                    setPolicies(updated);
                  }}
                >
                  <Card className="card-shadow overflow-hidden border border-border/60 transition-shadow hover:shadow-lg">
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="cursor-pointer hover:bg-accent/40 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
                              <CategoryIcon className={`h-5 w-5 ${iconColor}`} />
                            </div>
                            <div className="text-left">
                              <CardTitle className="text-lg font-semibold font-display">{category.name}</CardTitle>
                              <CardDescription className="mt-0.5 text-[13px]">{category.description}</CardDescription>
                            </div>
                          </div>
                          {category.isOpen ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground transition-transform" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
                          )}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="grid gap-5 sm:grid-cols-2">
                          {category.settings.map((setting, settingIndex) => {
                            const isDeviating = isDeviatingFromDefault(setting);
                            const isReducing = isReducingStrictness(setting);

                            return (
                              <div
                                key={setting.key}
                                className="rounded-xl border border-border/50 bg-card p-4 space-y-3 transition-all hover:border-primary/30 hover:shadow-sm"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Label className="text-sm font-semibold">{setting.label}</Label>
                                      {isDeviating && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-medium">
                                          Custom
                                        </span>
                                      )}
                                      {isReducing && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-medium flex items-center gap-0.5">
                                          <AlertTriangle className="h-2.5 w-2.5" />
                                          Less Strict
                                        </span>
                                      )}
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{setting.description}</p>
                                  </div>
                                  <div className="flex flex-col items-end shrink-0">
                                    <span className="text-xl font-bold tabular-nums tracking-tight">{formatValue(setting.value, setting.type)}</span>
                                    <span className="text-[10px] text-muted-foreground">{formatDecimal(setting.value)}</span>
                                  </div>
                                </div>
                                <Slider
                                  value={[setting.value]}
                                  onValueChange={(value) => handleSliderChange(categoryIndex, settingIndex, value)}
                                  min={setting.min}
                                  max={setting.max}
                                  step={0.01}
                                  className="w-full"
                                />
                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                  <span>{formatDecimal(setting.min)}</span>
                                  <span className="font-medium">Default: {formatDecimal(setting.default)}</span>
                                  <span>{formatDecimal(setting.max)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>

          {/* ── Policy Changes Warning ─────────────────────────────────────── */}
          <div className="relative overflow-hidden rounded-xl border border-amber-200/70 dark:border-amber-800/50 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 p-5">
            {/* Decorative accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-400 rounded-l-xl" />

            <div className="pl-3 flex items-start gap-4">
              {/* Icon badge */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-700/50">
                <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-amber-900 dark:text-amber-200 text-sm">
                    Policy Changes Take Effect Immediately
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/70 dark:bg-amber-800/50 text-amber-700 dark:text-amber-300 font-medium tracking-wide uppercase">
                    Important
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-amber-800/80 dark:text-amber-300/70 leading-relaxed">
                  Changes to policies will affect all <strong className="font-semibold text-amber-900 dark:text-amber-200">new asset scans</strong>. Existing assets will not be re-evaluated unless manually re-scanned.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        !isLoadingBrand && (
          <Card className="border-border bg-muted/40">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground">No brand policy data available.</p>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}