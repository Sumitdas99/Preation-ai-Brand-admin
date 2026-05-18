import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Lock, Search, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AuthError,
  ForbiddenError,
  NetworkError,
  NotFoundError,
  ServerError,
} from "@/api/errors";

interface Props {
  error: Error;
  onRetry: () => void;
  runId?: string;
}

export function SuitabilityErrorScreen({ error, onRetry, runId }: Props) {
  const navigate = useNavigate();

  useEffect(() => {
    if (error instanceof AuthError) {
      const timeout = window.setTimeout(() => navigate("/login"), 1500);
      return () => window.clearTimeout(timeout);
    }
  }, [error, navigate]);

  const { icon: Icon, title, description } = errorPresentation(error);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <Icon className="mb-4 h-10 w-10 text-muted-foreground" aria-hidden />
      <h1 className="mb-2 text-2xl font-semibold">{title}</h1>
      <p className="mb-6 max-w-prose text-sm text-muted-foreground">
        {description}
      </p>
      <div className="flex gap-3">
        {!(error instanceof AuthError) && (
          <Button onClick={onRetry}>Retry</Button>
        )}
        {runId ? (
          <Button
            variant="outline"
            onClick={() => navigate(`/preflight/${runId}`)}
          >
            Back to Pre-Flight
          </Button>
        ) : (
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back to dashboard
          </Button>
        )}
      </div>
    </div>
  );
}

function errorPresentation(error: Error) {
  if (error instanceof AuthError) {
    return {
      icon: Lock,
      title: "Session expired",
      description: "Redirecting you to sign in again…",
    };
  }
  if (error instanceof ForbiddenError) {
    return {
      icon: Lock,
      title: "You don't have access to brand suitability for this asset",
      description:
        "Ask a Reviewer or Legal approver on this workspace to share access.",
    };
  }
  if (error instanceof NotFoundError) {
    return {
      icon: Search,
      title: "Suitability results not found",
      description:
        "This run may not have produced suitability results yet, or the link is incorrect.",
    };
  }
  if (error instanceof NetworkError) {
    return {
      icon: AlertTriangle,
      title: "Connection lost",
      description:
        "We couldn't reach the Praetion AI backend. Check your connection and retry.",
    };
  }
  if (error instanceof ServerError) {
    return {
      icon: ServerCrash,
      title: "Server error",
      description:
        "Something went wrong on our side. The incident has been logged — retry in a moment.",
    };
  }
  return {
    icon: AlertTriangle,
    title: "Something went wrong",
    description: error.message || "An unexpected error occurred.",
  };
}
