import { useState, useEffect } from "react";
import { Shield, Save, AlertTriangle, Loader2, ChevronDown, ChevronUp, Globe, Monitor, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select";
import { toastSuccess, toastError } from "@/utils/toast";
import { getBrand, updateBrand } from "@/api/brand";
import { useSelector } from "react-redux";
import { selectAuthUser } from "@/context/slice/authSlice";

// Special values for None / All (not sent to API)
const NONE_VALUE = "__none__";
const ALL_VALUE = "__all__";

// Workspace policy scope options (jurisdictions, platforms, packs) — None & All first, then real options
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

// System default thresholds (0-1 range)
const SYSTEM_DEFAULTS = {
  // Synthetic Content Detection
  synthetic_high_threshold: 0.90,
  synthetic_probable_threshold: 0.70,
  
  // Brand Suitability
  alcohol_block_threshold: 0.85,
  alcohol_flag_threshold: 0.65,
  minors_block_threshold: 0.85,
  minors_review_threshold: 0.70,
  violence_block_threshold: 0.80,
  violence_flag_threshold: 0.60,
  nudity_block_threshold: 0.75,
  nudity_flag_threshold: 0.50,
  hate_symbols_block_threshold: 0.70,
  hate_symbols_flag_threshold: 0.50,
  drugs_block_threshold: 0.80,
  drugs_flag_threshold: 0.60,
  
  // Consent & Likeness
  face_detection_confidence: 0.80,
  face_prominence_threshold: 0.60,
  synthetic_voice_threshold: 0.80,
  human_voice_prominence: 0.50,
  background_speech_threshold: 0.30,
  
  // Geo-Specific
  germany_synthetic_disclosure_threshold: 0.75,
  germany_minors_block_threshold: 0.80,
  france_minors_block_threshold: 0.80,
};

// Critical categories that cannot exceed 0.90
const CRITICAL_CATEGORIES = [
  "minors_block_threshold",
  "minors_review_threshold",
  "germany_minors_block_threshold",
  "france_minors_block_threshold",
];

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
  blockKey?: string; // For flag thresholds that need to be < block
  isCritical?: boolean;
}

interface PolicyCategory {
  name: string;
  description: string;
  settings: PolicySetting[];
  isOpen?: boolean;
}

// Initialize policy categories structure
const initializePolicyCategories = (brandData: any = null): PolicyCategory[] => {
  const getValue = (key: string, defaultValue: number): number => {
    if (brandData && brandData[key] !== null && brandData[key] !== undefined) {
      return brandData[key];
    }
    return defaultValue;
  };

  return [
    {
      name: "Synthetic Content Detection",
      description: "Thresholds for synthetic media detection",
      isOpen: true,
      settings: [
        {
          key: "synthetic_high_threshold",
          label: "High Confidence Synthetic ≥",
          description: "If confidence > 0.9 → Require disclosure",
          value: getValue("synthetic_high_threshold", SYSTEM_DEFAULTS.synthetic_high_threshold),
          default: SYSTEM_DEFAULTS.synthetic_high_threshold,
          min: 0,
          max: 1,
          type: "number",
        },
        {
          key: "synthetic_probable_threshold",
          label: "Probable Synthetic ≥",
          description: "If confidence between 0.7–0.9 → Flag for review",
          value: getValue("synthetic_probable_threshold", SYSTEM_DEFAULTS.synthetic_probable_threshold),
          default: SYSTEM_DEFAULTS.synthetic_probable_threshold,
          min: 0,
          max: 1,
          type: "number",
        },
      ],
    },
    {
      name: "Brand Suitability",
      description: "Content safety and appropriateness checks",
      isOpen: true,
      settings: [
        {
          key: "alcohol_block_threshold",
          label: "Alcohol - Block ≥",
          description: "Block content above this confidence level",
          value: getValue("alcohol_block_threshold", SYSTEM_DEFAULTS.alcohol_block_threshold),
          default: SYSTEM_DEFAULTS.alcohol_block_threshold,
          min: 0,
          max: 1,
          type: "number",
        },
        {
          key: "alcohol_flag_threshold",
          label: "Alcohol - Flag ≥",
          description: "Flag content above this confidence level",
          value: getValue("alcohol_flag_threshold", SYSTEM_DEFAULTS.alcohol_flag_threshold),
          default: SYSTEM_DEFAULTS.alcohol_flag_threshold,
          min: 0,
          max: 1,
          type: "number",
          blockKey: "alcohol_block_threshold",
        },
        {
          key: "minors_block_threshold",
          label: "Minors - Block ≥",
          description: "Block content above this confidence level",
          value: getValue("minors_block_threshold", SYSTEM_DEFAULTS.minors_block_threshold),
          default: SYSTEM_DEFAULTS.minors_block_threshold,
          min: 0,
          max: 0.90, // Critical category limit
          type: "number",
          isCritical: true,
        },
        {
          key: "minors_review_threshold",
          label: "Minors - Review ≥",
          description: "Review content above this confidence level",
          value: getValue("minors_review_threshold", SYSTEM_DEFAULTS.minors_review_threshold),
          default: SYSTEM_DEFAULTS.minors_review_threshold,
          min: 0,
          max: 0.90, // Critical category limit
          type: "number",
          blockKey: "minors_block_threshold",
          isCritical: true,
        },
        {
          key: "violence_block_threshold",
          label: "Violence - Block ≥",
          description: "Block content above this confidence level",
          value: getValue("violence_block_threshold", SYSTEM_DEFAULTS.violence_block_threshold),
          default: SYSTEM_DEFAULTS.violence_block_threshold,
          min: 0,
          max: 1,
          type: "number",
        },
        {
          key: "violence_flag_threshold",
          label: "Violence - Flag ≥",
          description: "Flag content above this confidence level",
          value: getValue("violence_flag_threshold", SYSTEM_DEFAULTS.violence_flag_threshold),
          default: SYSTEM_DEFAULTS.violence_flag_threshold,
          min: 0,
          max: 1,
          type: "number",
          blockKey: "violence_block_threshold",
        },
        {
          key: "nudity_block_threshold",
          label: "Nudity - Block ≥",
          description: "Block content above this confidence level",
          value: getValue("nudity_block_threshold", SYSTEM_DEFAULTS.nudity_block_threshold),
          default: SYSTEM_DEFAULTS.nudity_block_threshold,
          min: 0,
          max: 1,
          type: "number",
        },
        {
          key: "nudity_flag_threshold",
          label: "Nudity - Flag ≥",
          description: "Flag content above this confidence level",
          value: getValue("nudity_flag_threshold", SYSTEM_DEFAULTS.nudity_flag_threshold),
          default: SYSTEM_DEFAULTS.nudity_flag_threshold,
          min: 0,
          max: 1,
          type: "number",
          blockKey: "nudity_block_threshold",
        },
        {
          key: "hate_symbols_block_threshold",
          label: "Hate Symbols - Block ≥",
          description: "Block content above this confidence level",
          value: getValue("hate_symbols_block_threshold", SYSTEM_DEFAULTS.hate_symbols_block_threshold),
          default: SYSTEM_DEFAULTS.hate_symbols_block_threshold,
          min: 0,
          max: 1,
          type: "number",
        },
        {
          key: "hate_symbols_flag_threshold",
          label: "Hate Symbols - Flag ≥",
          description: "Flag content above this confidence level",
          value: getValue("hate_symbols_flag_threshold", SYSTEM_DEFAULTS.hate_symbols_flag_threshold),
          default: SYSTEM_DEFAULTS.hate_symbols_flag_threshold,
          min: 0,
          max: 1,
          type: "number",
          blockKey: "hate_symbols_block_threshold",
        },
        {
          key: "drugs_block_threshold",
          label: "Drugs - Block ≥",
          description: "Block content above this confidence level",
          value: getValue("drugs_block_threshold", SYSTEM_DEFAULTS.drugs_block_threshold),
          default: SYSTEM_DEFAULTS.drugs_block_threshold,
          min: 0,
          max: 1,
          type: "number",
        },
        {
          key: "drugs_flag_threshold",
          label: "Drugs - Flag ≥",
          description: "Flag content above this confidence level",
          value: getValue("drugs_flag_threshold", SYSTEM_DEFAULTS.drugs_flag_threshold),
          default: SYSTEM_DEFAULTS.drugs_flag_threshold,
          min: 0,
          max: 1,
          type: "number",
          blockKey: "drugs_block_threshold",
        },
      ],
    },
    {
      name: "Consent & Likeness Controls",
      description: "Thresholds for face and voice detection requiring consent",
      isOpen: true,
      settings: [
        {
          key: "face_detection_confidence",
          label: "Face Detection Confidence",
          description: "If face confidence ≥ 0.80 AND prominence ≥ 0.60 → Consent required",
          value: getValue("face_detection_confidence", SYSTEM_DEFAULTS.face_detection_confidence),
          default: SYSTEM_DEFAULTS.face_detection_confidence,
          min: 0,
          max: 1,
          type: "number",
        },
        {
          key: "face_prominence_threshold",
          label: "Face Prominence Threshold",
          description: "Minimum face prominence to require consent",
          value: getValue("face_prominence_threshold", SYSTEM_DEFAULTS.face_prominence_threshold),
          default: SYSTEM_DEFAULTS.face_prominence_threshold,
          min: 0,
          max: 1,
          type: "number",
        },
        {
          key: "synthetic_voice_threshold",
          label: "Synthetic Voice Threshold",
          description: "If synthetic voice ≥ 0.80 → Disclosure mandatory",
          value: getValue("synthetic_voice_threshold", SYSTEM_DEFAULTS.synthetic_voice_threshold),
          default: SYSTEM_DEFAULTS.synthetic_voice_threshold,
          min: 0,
          max: 1,
          type: "number",
        },
        {
          key: "human_voice_prominence",
          label: "Human Voice Prominence",
          description: "Threshold for human voice detection",
          value: getValue("human_voice_prominence", SYSTEM_DEFAULTS.human_voice_prominence),
          default: SYSTEM_DEFAULTS.human_voice_prominence,
          min: 0,
          max: 1,
          type: "number",
        },
        {
          key: "background_speech_threshold",
          label: "Background Speech Threshold",
          description: "Threshold for background speech detection",
          value: getValue("background_speech_threshold", SYSTEM_DEFAULTS.background_speech_threshold),
          default: SYSTEM_DEFAULTS.background_speech_threshold,
          min: 0,
          max: 1,
          type: "number",
        },
      ],
    },
    {
      name: "Geo-Specific Rules",
      description: "Regulatory requirements by geography",
      isOpen: true,
      settings: [
        {
          key: "germany_strict_enabled",
          label: "Germany (Strictest)",
          description: "EU AI Act Article 50 compliance",
          value: brandData && typeof brandData["germany_strict_enabled"] === "boolean"
            ? (brandData["germany_strict_enabled"] ? 1 : 0)
            : 0,
          default: 0,
          min: 0,
          max: 1,
          type: "boolean",
        },
        {
          key: "france_beauty_enabled",
          label: "France Beauty Standards",
          description: "Stricter rules for beauty/minor combinations",
          value: brandData && typeof brandData["france_beauty_enabled"] === "boolean"
            ? (brandData["france_beauty_enabled"] ? 1 : 0)
            : 0,
          default: 0,
          min: 0,
          max: 1,
          type: "boolean",
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

  // Load brand data on mount or when brandId changes
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

  const validateThreshold = (key: string, value: number): { isValid: boolean; error?: string } => {
    // Check bounds
    if (value < 0 || value > 1) {
      return { isValid: false, error: `${key} must be between 0.0 and 1.0` };
    }

    // Check critical category limit
    if (CRITICAL_CATEGORIES.includes(key) && value > 0.90) {
      return { isValid: false, error: `${key} cannot exceed 0.90 for critical categories` };
    }

    return { isValid: true };
  };

  const validateBlockFlagPair = (
    blockKey: string,
    flagKey: string,
    blockValue: number,
    flagValue: number
  ): { isValid: boolean; error?: string } => {
    if (blockValue <= flagValue) {
      return { isValid: false, error: `${blockKey} must be greater than ${flagKey}` };
    }
    return { isValid: true };
  };

  const validateSyntheticHighProbable = (categories: PolicyCategory[]): { isValid: boolean; error?: string } => {
    let high: number | null = null;
    let probable: number | null = null;
    for (const cat of categories) {
      for (const s of cat.settings) {
        if (s.key === "synthetic_high_threshold") high = s.value;
        if (s.key === "synthetic_probable_threshold") probable = s.value;
      }
    }
    if (high != null && probable != null && high <= probable) {
      return { isValid: false, error: "High confidence synthetic must be greater than Probable synthetic" };
    }
    return { isValid: true };
  };

  const handleSliderChange = (categoryIndex: number, settingIndex: number, value: number[]) => {
    const updated = [...policies];
    const setting = updated[categoryIndex].settings[settingIndex];
    const newValue = value[0];

    // Validate threshold
    if (setting.type === "number") {
      const validation = validateThreshold(setting.key, newValue);
      if (!validation.isValid) {
        toastError(validation.error || "Invalid threshold value");
        return;
      }

      // Validate block/flag pair if applicable
      if (setting.blockKey) {
        const blockSetting = updated[categoryIndex].settings.find((s) => s.key === setting.blockKey);
        if (blockSetting) {
          // This is a flag/review threshold, validate it's less than block
          if (setting.key.includes("flag") || setting.key.includes("review")) {
            const blockValue = blockSetting.value;
            const flagValue = newValue;
            const pairValidation = validateBlockFlagPair(setting.blockKey, setting.key, blockValue, flagValue);
            if (!pairValidation.isValid) {
              toastError(pairValidation.error || "Block threshold must be greater than flag threshold");
              return;
            }
          }
          // If this is a block threshold, validate all related flags
          else if (setting.key.includes("block")) {
            const flagSettings = updated[categoryIndex].settings.filter(
              (s) => s.blockKey === setting.key && (s.key.includes("flag") || s.key.includes("review"))
            );
            for (const flagSetting of flagSettings) {
              const pairValidation = validateBlockFlagPair(setting.key, flagSetting.key, newValue, flagSetting.value);
              if (!pairValidation.isValid) {
                toastError(pairValidation.error || "Block threshold must be greater than flag threshold");
                return;
              }
            }
          }
        }
      }

      // Validate synthetic_high > synthetic_probable
      if (setting.key === "synthetic_high_threshold" || setting.key === "synthetic_probable_threshold") {
        const prev = setting.value;
        setting.value = newValue;
        const synValidation = validateSyntheticHighProbable(updated);
        if (!synValidation.isValid) {
          setting.value = prev;
          toastError(synValidation.error || "High confidence must be greater than Probable");
          return;
        }
      }
    }

    setting.value = newValue;
    setPolicies(updated);
  };

  const handleToggleChange = (categoryIndex: number, settingIndex: number, checked: boolean) => {
    const updated = [...policies];
    updated[categoryIndex].settings[settingIndex].value = checked ? 1 : 0;
    setPolicies(updated);
  };

  const handleSave = async () => {
    if (!brandId) {
      toastError("Brand context missing", "No brand selected");
      return;
    }

    // Validate synthetic_high > synthetic_probable
    const synValidation = validateSyntheticHighProbable(policies);
    if (!synValidation.isValid) {
      toastError(synValidation.error || "High confidence synthetic must be greater than Probable synthetic");
      return;
    }

    // Validate all thresholds before saving
    for (const category of policies) {
      for (const setting of category.settings) {
        if (setting.type === "number") {
          const validation = validateThreshold(setting.key, setting.value);
          if (!validation.isValid) {
            toastError(validation.error || `Invalid value for ${setting.label}`);
            return;
          }

          // Validate block/flag pairs
          if (setting.blockKey) {
            const blockSetting = category.settings.find((s) => s.key === setting.blockKey);
            if (blockSetting) {
              // This is a flag/review threshold, validate it's less than block
              if (setting.key.includes("flag") || setting.key.includes("review")) {
                const blockValue = blockSetting.value;
                const flagValue = setting.value;
                const pairValidation = validateBlockFlagPair(setting.blockKey, setting.key, blockValue, flagValue);
                if (!pairValidation.isValid) {
                  toastError(pairValidation.error || `Block threshold must be greater than flag threshold for ${setting.label}`);
                  return;
                }
              }
            }
          }
        }
      }
    }

    setIsSaving(true);
    try {
      const payload: any = {};

      // Extract all threshold values
      policies.forEach((category) => {
        category.settings.forEach((setting) => {
          if (setting.type === "boolean") {
            payload[setting.key] = setting.value === 1;
          } else {
            payload[setting.key] = parseFloat(setting.value.toFixed(2));
          }
        });
      });

      // Workspace policy scope (jurisdictions, platforms, packs)
      payload.enabled_jurisdictions = enabledJurisdictions.length ? enabledJurisdictions : null;
      payload.enabled_platforms = enabledPlatforms.length ? enabledPlatforms : null;
      payload.enabled_pack_ids = enabledPackIds.length ? enabledPackIds : null;

      await updateBrand(brandId, payload);

      toastSuccess(
        `Policy configurations for ${brand?.brand_name || "brand"} have been updated`,
        "Policies saved"
      );

      // Reload brand data to reflect changes
      await loadBrandData(brandId);
    } catch (error: any) {
      toastError(error.message || "Failed to save policies");
    } finally {
      setIsSaving(false);
    }
  };

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

  const isDeviatingFromDefault = (setting: PolicySetting): boolean => {
    return Math.abs(setting.value - setting.default) > 0.001;
  };

  const isReducingStrictness = (setting: PolicySetting): boolean => {
    // Check if threshold is being lowered (reducing strictness)
    return setting.value < setting.default;
  };

  const formatValue = (value: number, type?: string): string => {
    if (type === "boolean") {
      return value === 1 ? "Enabled" : "Disabled";
    }
    return (value * 100).toFixed(0) + "%";
  };

  const formatDecimal = (value: number): string => {
    return value.toFixed(2);
  };

  return (
    <div className="space-y-4 p-4 md:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Policies</h1>
          <p className="mt-1 text-muted-foreground">Configure compliance policies and thresholds</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto lg:justify-end">
          <div className="w-full sm:w-64">
            {/* Brand Display */}
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
            disabled={!brandId || isSaving || isLoadingBrand}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoadingBrand && brandId && (
        <Card className="border-primary bg-primary-light/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading brand policy data...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workspace policy scope */}
      <Collapsible open={workspaceScopeOpen} onOpenChange={setWorkspaceScopeOpen}>
        <Card className="card-shadow">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
              <div className="flex items-center justify-between">
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
                {workspaceScopeOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
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
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Policy Categories */}
      <div className="space-y-4">
        {policies.map((category, categoryIndex) => (
          <Collapsible
            key={category.name}
            open={category.isOpen}
            onOpenChange={(open) => {
              const updated = [...policies];
              updated[categoryIndex].isOpen = open;
              setPolicies(updated);
            }}
          >
            <Card className="card-shadow">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-display">{category.name}</CardTitle>
                        <CardDescription className="mt-1">{category.description}</CardDescription>
                      </div>
                    </div>
                    {category.isOpen ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-6">
                  {category.settings.map((setting, settingIndex) => {
                    const isDeviating = isDeviatingFromDefault(setting);
                    const isReducing = isReducingStrictness(setting);

                    return (
                      <div key={setting.key} className="space-y-3 border-b pb-4 last:border-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Label className="text-base font-medium">{setting.label}</Label>
                              {isDeviating && (
                                <span className="text-xs px-2 py-0.5 rounded bg-warning-light text-warning">
                                  Custom
                                </span>
                              )}
                              {isReducing && (
                                <span className="text-xs px-2 py-0.5 rounded bg-danger-light text-danger flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  Less Strict
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{setting.description}</p>
                            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                              <span>
                                Current: <span className="font-medium">{formatDecimal(setting.value)}</span>
                              </span>
                              {isDeviating && (
                                <span>
                                  Default: <span className="font-medium">{formatDecimal(setting.default)}</span>
                                </span>
                              )}
                            </div>
                          </div>
                          {setting.type === "boolean" ? (
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={setting.value === 1}
                                onCheckedChange={(checked) =>
                                  handleToggleChange(categoryIndex, settingIndex, checked)
                                }
                              />
                              <span className="text-sm min-w-[70px]">
                                {setting.value === 1 ? "Enabled" : "Disabled"}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 min-w-[80px] justify-end">
                              <span className="text-lg font-bold">{formatValue(setting.value, setting.type)}</span>
                            </div>
                          )}
                        </div>
                        {setting.type === "number" && (
                          <div className="space-y-2">
                            <Slider
                              value={[setting.value]}
                              onValueChange={(value) =>
                                handleSliderChange(categoryIndex, settingIndex, value)
                              }
                              min={setting.min}
                              max={setting.max}
                              step={0.01}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{formatDecimal(setting.min)}</span>
                              <span>Default: {formatDecimal(setting.default)}</span>
                              <span>{formatDecimal(setting.max)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      {/* Warning */}
      <Card className="border-warning bg-warning-light/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-warning">Policy Changes</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Changes to policies will affect all new asset scans. Existing assets will not be re-evaluated
                unless manually re-scanned. Critical categories (minors) cannot exceed a threshold of 0.90.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
