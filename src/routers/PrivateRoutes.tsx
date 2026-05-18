import { RouteObject } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import Dashboard from "../pages/Dashboard";
import Upload from "../pages/Upload";
import Assets from "../pages/Assets";
import AssetReview from "../pages/AssetReview";
import DisclosureSpec from "../pages/DisclosureSpec";
import Consent from "../pages/Consent";
import PreFlightApproval from "../pages/PreFlightApproval";
import UploadProof from "../pages/UploadProof";
import SuitabilityResults from "../pages/SuitabilityResults";
import SuitabilityCategoryDetail from "../pages/SuitabilityCategoryDetail";
import PolicyThresholds from "../pages/PolicyThresholds";
import LegalDashboard from "../pages/LegalDashboard";
import EvidencePackPreviewPage from "../pages/EvidencePackPreview";
import BillingDashboard from "../pages/BillingDashboard";
import SuperAdminBrandPacks from "../pages/SuperAdminBrandPacks";
import SuperAdminBrandPackOnboard from "../pages/SuperAdminBrandPackOnboard";
import Violations from "../pages/Violations";
import Team from "../pages/Team";
import Settings from "../pages/Settings";
import SuperAdmin from "../pages/SuperAdmin";
import EvidencePacks from "../pages/EvidencePacks";
import Approvals from "../pages/Approvals";
import Billing from "../pages/Billing";
import Integrations from "../pages/Integrations";
import Policies from "../pages/Policies";
import AuditLog from "../pages/AuditLog";
import BrandAdminRequests from "../pages/admin/BrandAdminRequests";
import UserManagement from "../pages/UserManagement";

import BrandGoogleCallback from "../pages/brand/BrandGoogleCallback";
import BrandMicrosoftCallback from "../pages/brand/BrandMicrosoftCallback";
import BrandSettings from "../pages/brand/BrandSettings";

const privateRoutes: RouteObject[] = [
  {
    path: "/preflight/:id",
    element: <PreFlightApproval />,
  },
  {
    path: "/disclosure/:id",
    element: <DisclosureSpec />,
  },
  {
    path: "/consent/:id",
    element: <Consent />,
  },
  {
    path: "/proof/:id",
    element: <UploadProof />,
  },
  {
    path: "/settings/policy-thresholds",
    element: <PolicyThresholds />,
  },
  {
    path: "/suitability/:runId/results",
    element: <SuitabilityResults />,
  },
  {
    path: "/suitability/:runId/category/:categoryKey",
    element: <SuitabilityCategoryDetail />,
  },
  {
    path: "/approvals",
    element: <LegalDashboard />,
  },
  {
    path: "/evidence/:packId/preview",
    element: <EvidencePackPreviewPage />,
  },
  {
    path: "/super-admin/brand-packs/new",
    element: <SuperAdminBrandPackOnboard />,
  },
  {
    path: "/super-admin/brand-packs/:brandId",
    element: <SuperAdminBrandPacks />,
  },
  {
    path: "/super-admin/brand-packs",
    element: <SuperAdminBrandPacks />,
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/upload",
        element: <Upload />,
      },
      {
        path: "/assets",
        element: <Assets />,
      },
      {
        path: "/assets/:id",
        element: <AssetReview />,
      },
      {
        path: "/violations",
        element: <Violations />,
      },
      {
        path: "/evidence",
        element: <EvidencePacks />,
      },
      {
        path: "/team",
        element: <Team />,
      },
      {
        path: "/billing",
        element: <BillingDashboard />,
      },
      {
        path: "/integrations",
        element: <Integrations />,
      },
      {
        path: "/policies",
        element: <Policies />,
      },
      {
        path: "/audit",
        element: <AuditLog />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "/super-admin",
        element: <SuperAdmin />,
      },
      {
        path: "/super-admin/brand-admin-requests",
        element: <BrandAdminRequests />,
      },
      {
        path: "/super-admin/user-management",
        element: <UserManagement />,
      },
      {
        path: "/brands/google/callback",
        element: <BrandGoogleCallback />,
      },
      {
        path: "/brands/microsoft/callback",
        element: <BrandMicrosoftCallback />,
      },
      {
        path: "/brands/settings",
        element: <BrandSettings />,
      },
    ],
  },
];

export default privateRoutes;

