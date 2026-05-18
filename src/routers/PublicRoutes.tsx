import { RouteObject } from "react-router-dom";
import Login from "../pages/Login";
import SuperAdminLogin from "../pages/SuperAdminLogin";
import Landing from "../pages/Landing";
import SSOCallback from "../pages/auth/SSOCallback";
import CreateBrand from "../pages/auth/CreateBrand";
import TestBrand from "../pages/auth/TestBrand";
import DebugSSO from "../pages/auth/DebugSSO";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VerifyOtp from "../pages/auth/VerifyOtp";
import ResetPassword from "../pages/auth/ResetPassword";
import AcceptInvitation from "../pages/auth/AcceptInvitation";
import ForceChangePassword from "../pages/auth/ForceChangePassword";

const publicRoutes: RouteObject[] = [
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  // {
  //   path: "/super-admin/login",
  //   element: <SuperAdminLogin />,
  // },
  // {
  //   path: "/super-admin/forgot-password",
  //   element: <ForgotPassword />,
  // },
  {
    path: "/auth/google/callback",
    element: <SSOCallback />,
  },
  {
    path: "/auth/microsoft/callback",
    element: <SSOCallback />,
  },
  {
    path: "/auth/create-brand",
    element: <CreateBrand />,
  },
  {
    path: "/create-brand",
    element: <CreateBrand />,
  },
  {
    path: "/test-brand",
    element: <TestBrand />,
  },
  {
    path: "/debug-sso",
    element: <DebugSSO />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/verify-otp",
    element: <VerifyOtp />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/invitations/accept",
    element: <AcceptInvitation />,
  },
  {
    path: "/force-change-password",
    element: <ForceChangePassword />,
  },
];

export default publicRoutes;
