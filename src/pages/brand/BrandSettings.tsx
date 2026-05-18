import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { GeneralTab } from "./tabs/GeneralTab";
import { IntegrationsTab } from "./tabs/IntegrationsTab";
import { PoliciesTab } from "./tabs/PoliciesTab";
import { getBrand } from "@/api/brand";
import { toastError } from "@/utils/toast";

export default function BrandSettings() {
    const { id } = useParams<{ id: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [brand, setBrand] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const currentTab = searchParams.get("tab") || "general";

    const fetchBrandDetails = async () => {
        if (!id) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const data = await getBrand(id);
            setBrand(data);
        } catch (error: any) {
            toastError(error.message || "Failed to load brand details");
            navigate("/settings"); // Fallback
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBrandDetails();
    }, [id]);

    const handleTabChange = (value: string) => {
        setSearchParams({ tab: value });
    };

    if (isLoading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // No brand id in URL or failed to load — redirect to main settings
    if (!id || !brand) {
        navigate("/settings", { replace: true });
        return null;
    }

    return (
        <div className="container py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Brand Settings</h1>
                    <p className="text-muted-foreground">
                        Manage configuration for <span className="font-medium text-foreground">{brand.brand_name}</span>
                    </p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
                <div className="border-b">
                    <TabsList className="bg-transparent p-0 h-auto">
                        <TabsTrigger
                            value="general"
                            className="rounded-none border-b-2 border-transparent px-4 py-2 text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                        >
                            General
                        </TabsTrigger>
                        <TabsTrigger
                            value="integrations"
                            className="rounded-none border-b-2 border-transparent px-4 py-2 text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                        >
                            Integrations
                        </TabsTrigger>
                        <TabsTrigger
                            value="policies"
                            className="rounded-none border-b-2 border-transparent px-4 py-2 text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                        >
                            Policies
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Tab Content */}
                <TabsContent value="general" className="space-y-6">
                    <GeneralTab brand={brand} onUpdate={fetchBrandDetails} />
                </TabsContent>

                <TabsContent value="integrations" className="space-y-6">
                    <IntegrationsTab
                        brandId={brand.brand_id}
                        integrations={{
                            google_drive_enabled: brand.google_drive_enabled || false,
                            google_drive_connected: (brand.google_drive_connected || brand.google_drive_enabled) || false,
                            sharepoint_enabled: brand.sharepoint_enabled || false,

                            google_drive_connected_by_role: brand.google_drive_connected_by_role,
                            google_drive_connected_by_user_id: brand.google_drive_connected_by_user_id,
                        }}
                        onRefresh={fetchBrandDetails}
                    />
                </TabsContent>

                <TabsContent value="policies" className="space-y-6">
                    <PoliciesTab brand={brand} onUpdate={fetchBrandDetails} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
