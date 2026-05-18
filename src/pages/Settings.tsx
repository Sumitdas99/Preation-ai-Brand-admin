import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toastSuccess, toastError, toastInfo } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { Edit, Save, X } from "lucide-react";
import { getProfile, updateProfile } from "@/api/auth";
import { useDispatch, useSelector } from "react-redux";
import { updateUserProfile, selectUserRole, selectAuthUser } from "@/context/slice/authSlice";
import { ContentReviewerIntegrations } from "@/components/settings/ContentReviewerIntegrations";

type SettingsTab = "profile" | "thresholds" | "suitability" | "geo" | "integrations" | "team" | "billing";

// Dynamic settings nav based on user role
const getSettingsNav = (userRole: string | null): Array<{ id: SettingsTab; label: string }> => {
  const nav = [
    { id: "profile" as SettingsTab, label: "Profile" },
  ];

  // Add Integrations tab for Content Reviewer
  if (userRole === "CONTENT_REVIEWER") {
    nav.push({ id: "integrations" as SettingsTab, label: "Integrations" });
  }

  return nav;
};

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") as SettingsTab | null;
  const [activeTab, setActiveTab] = useState<SettingsTab>(tabFromUrl || "profile");
  const [syntheticThreshold, setSyntheticThreshold] = useState([70]);
  const [alcoholThreshold, setAlcoholThreshold] = useState([50]);
  const [minorThreshold, setMinorThreshold] = useState([30]);
  const dispatch = useDispatch();
  const userRole = useSelector(selectUserRole);
  const user = useSelector(selectAuthUser);


  // Profile state
  const [profile, setProfile] = useState({
    email: "",
    firstName: "",
    lastName: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // Set active tab from URL parameter on mount
  useEffect(() => {
    if (tabFromUrl) {
      const validTabs = getSettingsNav(userRole).map(nav => nav.id);
      if (validTabs.includes(tabFromUrl)) {
        setActiveTab(tabFromUrl);
      }
    }
  }, [tabFromUrl, userRole]);

  // Fetch profile data
  useEffect(() => {
    if (activeTab === "profile") {
      fetchProfile();
    }
  }, [activeTab]);


  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const data = await getProfile();
      setProfile({
        email: data.email || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
      });
    } catch (error: any) {
      toastError(error.message || "Failed to load profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values
    fetchProfile();
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      await updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
      });

      // Update Redux store immediately to reflect changes in header
      dispatch(updateUserProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
      }));

      setIsEditing(false);
      toastSuccess("Your profile has been updated successfully.", "Profile Updated");
    } catch (error: any) {
      toastError(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    toastSuccess("Your detection thresholds have been updated successfully.", "Settings Saved");
  };

  const applyPreset = (preset: string) => {
    toastInfo("Thresholds updated to preset configuration.", `${preset} Applied`);
  };

  return (
    <div className="flex h-full bg-background space-y-4 p-6 animate-fade-in">
      {/* Left Sidebar */}
      <aside className="w-64 border border-border rounded-lg bg-card p-4">
        <h2 className="mb-4 px-3 text-lg font-semibold text-foreground">Settings</h2>
        <nav className="space-y-1">
          {getSettingsNav(userRole).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                activeTab === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {activeTab === "profile" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>
                    Manage your personal information
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={handleEdit} variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      size="sm"
                      disabled={isLoading}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {profileLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading profile...</div>
                </div>
              ) : (
                <>
                  {/* Email - Read Only */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>

                  {/* First Name */}
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={profile.firstName}
                      onChange={(e) =>
                        setProfile({ ...profile, firstName: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={profile.lastName}
                      onChange={(e) =>
                        setProfile({ ...profile, lastName: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "thresholds" && (
          <Card>
            <CardHeader>
              <CardTitle>Detection Thresholds</CardTitle>
              {/* <CardDescription>
                Configure threshold levels for content detection and flagging
              </CardDescription> */}
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Synthetic Content Detection */}
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap items-center">
                  <h3 className="text-base font-semibold text-foreground">
                    Synthetic Content Detection
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {"("}Assets above this threshold require AI disclosure{")"}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-success">Allow</span>
                    <span className="font-medium text-primary">{syntheticThreshold[0]}%</span>
                    <span className="text-danger">Block</span>
                  </div>
                  <Slider
                    value={syntheticThreshold}
                    onValueChange={setSyntheticThreshold}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span className="text-warning">Flag</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Alcohol Content */}
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap items-center">
                  <h3 className="text-base font-semibold text-foreground">Alcohol Content</h3>
                  <p className="text-sm text-muted-foreground">
                    {"("}Strictness for alcohol-related content{")"}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-success">Allow</span>
                    <span className="font-medium text-primary">{alcoholThreshold[0]}%</span>
                    <span className="text-danger">Block</span>
                  </div>
                  <Slider
                    value={alcoholThreshold}
                    onValueChange={setAlcoholThreshold}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span className="text-warning">Flag</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Minor Detection */}
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap items-center">
                  <h3 className="text-base font-semibold text-foreground">Minor Detection</h3>
                  <p className="text-sm text-muted-foreground">
                    {"("}Sensitivity for detecting individuals under 18{")"}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-success">Low</span>
                    <span className="font-medium text-primary">{minorThreshold[0]}%</span>
                    <span className="text-danger">High</span>
                  </div>
                  <Slider
                    value={minorThreshold}
                    onValueChange={setMinorThreshold}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span className="text-warning">Medium</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Geographic Presets */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-foreground">Geographic Presets</h3>
                  <p className="text-sm text-muted-foreground">
                    Apply regional compliance presets
                  </p>
                </div>
                <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto py-3 border-[hsl(217_91%_32%)]
    text-[hsl(217_91%_32%)]
    font-semibold
    bg-transparent

    /* REMOVE FOCUS STYLES */
    focus:outline-none
    focus-visible:outline-none
    focus:ring-0
    focus-visible:ring-0
    focus:ring-offset-0
    focus-visible:ring-offset-0
    focus:shadow-none
    focus-visible:shadow-none

    /* HOVER EFFECT */
    hover:bg-[hsl(217_91%_32%/0.08)]

    /* ACTIVE */
    active:translate-y-0
    active:scale-[0.98]

    transition-all
    duration-200
    ease-out"
                    onClick={() => applyPreset("EU Default")}
                  >
                    Apply EU Default
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-3 border-[hsl(217_91%_32%)]
    text-[hsl(217_91%_32%)]
    font-semibold
    bg-transparent

    /* REMOVE FOCUS STYLES */
    focus:outline-none
    focus-visible:outline-none
    focus:ring-0
    focus-visible:ring-0
    focus:ring-offset-0
    focus-visible:ring-offset-0
    focus:shadow-none
    focus-visible:shadow-none

    /* HOVER EFFECT */
    hover:bg-[hsl(217_91%_32%/0.08)]

    /* ACTIVE */
    active:translate-y-0
    active:scale-[0.98]

    transition-all
    duration-200
    ease-out"
                    onClick={() => applyPreset("Germany Strict")}
                  >
                    Apply Germany Strict
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-3 border-[hsl(217_91%_32%)]
    text-[hsl(217_91%_32%)]
    font-semibold
    bg-transparent

    /* REMOVE FOCUS STYLES */
    focus:outline-none
    focus-visible:outline-none
    focus:ring-0
    focus-visible:ring-0
    focus:ring-offset-0
    focus-visible:ring-offset-0
    focus:shadow-none
    focus-visible:shadow-none

    /* HOVER EFFECT */
    hover:bg-[hsl(217_91%_32%/0.08)]

    /* ACTIVE */
    active:translate-y-0
    active:scale-[0.98]

    transition-all
    duration-200
    ease-out"
                    onClick={() => applyPreset("France Beauty")}
                  >
                    Apply France Beauty
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-3 border-[hsl(217_91%_32%)]
    text-[hsl(217_91%_32%)]
    font-semibold
    bg-transparent

    /* REMOVE FOCUS STYLES */
    focus:outline-none
    focus-visible:outline-none
    focus:ring-0
    focus-visible:ring-0
    focus:ring-offset-0
    focus-visible:ring-offset-0
    focus:shadow-none
    focus-visible:shadow-none

    /* HOVER EFFECT */
    hover:bg-[hsl(217_91%_32%/0.08)]

    /* ACTIVE */
    active:translate-y-0
    active:scale-[0.98]

    transition-all
    duration-200
    ease-out"
                    onClick={() => applyPreset("Italy Fashion")}
                  >
                    Apply Italy Fashion
                  </Button>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} size="lg">
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "integrations" && userRole === "CONTENT_REVIEWER" && (
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>
                Connect Google Drive to import assets directly from your Drive
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user?.brandId ? (
                <ContentReviewerIntegrations brandId={user.brandId} />
              ) : (
                <div className="text-muted-foreground py-8 text-center">
                  No brand assigned. Please contact your administrator.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab !== "thresholds" && activeTab !== "profile" && activeTab !== "integrations" && (
          <Card>
            <CardHeader>
              <CardTitle>{getSettingsNav(userRole).find((n) => n.id === activeTab)?.label}</CardTitle>
              <CardDescription>This section is under construction</CardDescription>
            </CardHeader>
          </Card>
        )}
      </main>
    </div>
  );
}
