import { AlertTriangle, Lock, Search, ServerCrash } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AuthError,
  ForbiddenError,
  NetworkError,
  NotFoundError,
  ServerError,
} from "@/api/errors";
import { Button } from "@/components/ui/button";

interface Props {
  error: Error;
  onRetry: () => void;
  onResetDemoAccess?: () => void;
}

export function PolicyThresholdsErrorScreen({
  error,
  onRetry,
  onResetDemoAccess,
}: Props) {
  const navigate = useNavigate();

  useEffect(() => {
    if (error instanceof AuthError) {
      const timeout = window.setTimeout(() => navigate("/login"), 1500);
      return () => window.clearTimeout(timeout);
    }
  }, [error, navigate]);

  const { icon: Icon, title, description } = errorPresentation(error);

  return (
    <div className="flex h-full flex-col items-center justify-center bg-background px-6 text-center">
      <Icon className="mb-4 h-10 w-10 text-muted-foreground" aria-hidden />
      <h1 className="mb-2 text-2xl font-semibold">{title}</h1>
      <p className="mb-6 max-w-prose text-sm text-muted-foreground">
        {description}
      </p>
      <div className="flex gap-3">
        {!(error instanceof AuthError) && <Button onClick={onRetry}>Retry</Button>}
        {error instanceof ForbiddenError && onResetDemoAccess ? (
          <Button variant="outline" onClick={onResetDemoAccess}>
            Reset Demo Access
          </Button>
        ) : null}
        <Button variant="outline" onClick={() => navigate("/settings")}>
          Back to Settings
        </Button>
      </div>
    </div>
  );
}

function errorPresentation(error: Error) {
  if (error instanceof AuthError) {
    return {
      icon: Lock,
      title: "Session expired",
      description: "Redirecting you to sign in again...",
    };
  }
  if (error instanceof ForbiddenError) {
    return {
      icon: Lock,
      title: "Brand Admin access required",
      description:
        "Policy Threshold Configuration is only available to Brand Admins.",
    };
  }
  if (error instanceof NotFoundError) {
    return {
      icon: Search,
      title: "Workspace settings not found",
      description: "The workspace policy settings could not be loaded.",
    };
  }
  if (error instanceof NetworkError) {
    return {
      icon: AlertTriangle,
      title: "Connection lost",
      description: "We could not reach the Praetion AI backend.",
    };
  }
  if (error instanceof ServerError) {
    return {
      icon: ServerCrash,
      title: "Server error",
      description: "Something went wrong while loading policy settings.",
    };
  }
  return {
    icon: AlertTriangle,
    title: "Something went wrong",
    description: error.message || "An unexpected error occurred.",
  };
}
