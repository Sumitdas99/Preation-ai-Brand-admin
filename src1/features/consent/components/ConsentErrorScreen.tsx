import { useNavigate } from "react-router-dom";

interface Props {
  error: Error;
  onRetry: () => void;
  runId?: string;
}

export function ConsentErrorScreen({ error, onRetry, runId }: Props) {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1>Could not load consent specification</h1>
      <p>{error.message}</p>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
        <button type="button" onClick={onRetry}>
          Retry
        </button>
        <button
          type="button"
          onClick={() =>
            navigate(runId ? `/preflight/${runId}` : "/dashboard")
          }
        >
          {runId ? "Back to Pre-Flight" : "Back to dashboard"}
        </button>
      </div>
    </div>
  );
}
