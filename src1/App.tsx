import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import SuperAdmin from "./pages/SuperAdmin";
import Team from "./pages/Team";
import Violations from "./pages/Violations";
import Assets from "./pages/Assets";
import AssetReview from "./pages/AssetReview";
import Settings from "./pages/Settings";
import PolicyThresholds from "./pages/PolicyThresholds";
import Consent from "./pages/Consent";
import DisclosureSpec from "./pages/DisclosureSpec";
import PreFlightApproval from "./pages/PreFlightApproval";
import UploadProof from "./pages/UploadProof";
import SuitabilityResults from "./pages/SuitabilityResults";
import SuitabilityCategoryDetail from "./pages/SuitabilityCategoryDetail";
import LegalDashboard from "./pages/LegalDashboard";
import EvidencePackPreviewPage from "./pages/EvidencePackPreview";
import BillingDashboard from "./pages/BillingDashboard";
import SuperAdminBrandPacks from "./pages/SuperAdminBrandPacks";
import SuperAdminBrandPackOnboard from "./pages/SuperAdminBrandPackOnboard";
import { AppLayout } from "./components/layout/AppLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/preflight/:id" element={<PreFlightApproval />} />
          <Route path="/disclosure/:id" element={<DisclosureSpec />} />
          <Route path="/consent/:id" element={<Consent />} />
          <Route path="/proof/:id" element={<UploadProof />} />
          <Route
            path="/settings/policy-thresholds"
            element={<PolicyThresholds />}
          />
          <Route
            path="/suitability/:runId/results"
            element={<SuitabilityResults />}
          />
          <Route
            path="/suitability/:runId/category/:categoryKey"
            element={<SuitabilityCategoryDetail />}
          />
          <Route path="/approvals" element={<LegalDashboard />} />
          <Route
            path="/evidence/:packId/preview"
            element={<EvidencePackPreviewPage />}
          />
          <Route
            path="/super-admin/brand-packs/new"
            element={<SuperAdminBrandPackOnboard />}
          />
          <Route
            path="/super-admin/brand-packs/:brandId"
            element={<SuperAdminBrandPacks />}
          />
          <Route
            path="/super-admin/brand-packs"
            element={<SuperAdminBrandPacks />}
          />
          <Route path="/billing" element={<BillingDashboard />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/assets/:id" element={<AssetReview />} />
            <Route path="/violations" element={<Violations />} />
            <Route path="/evidence" element={<Dashboard />} />
            <Route path="/team" element={<Team />} />
            <Route path="/integrations" element={<Dashboard />} />
            <Route path="/policies" element={<Dashboard />} />
            <Route path="/audit" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/super-admin" element={<SuperAdmin />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
