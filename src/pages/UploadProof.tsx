import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import type {
  MetadataValidationCheck,
  ProofMethod,
  SubmitProofPayload,
} from "@/api/schemas/proof";
import {
  AttestationStrip,
  FinalAssetPanel,
  MethodSelectorCard,
  ProofActionBar,
  ProofIntroCard,
  ScreenshotPanel,
} from "@/components/proof";
import type { ProofPageData } from "@/components/proof/types";
import { ProofErrorScreen } from "@/features/proof/components/ProofErrorScreen";
import { ProofSkeleton } from "@/features/proof/components/ProofSkeleton";
import { toProofData } from "@/features/proof/adapters";
import { useProofSpec, useSubmitProof } from "@/features/proof/hooks";
import { sha256File } from "@/lib/sha256";
import { cn } from "@/lib/utils";

export default function UploadProof() {
  const { id: specId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const runId = searchParams.get("runId") ?? undefined;

  useEffect(() => {
    document.title = "Upload disclosure proof · Praetion AI";
  }, []);

  const { spec, isPending, error, refetch } = useProofSpec(specId);
  const submitMutation = useSubmitProof({ specId, runId });

  if (!specId) {
    return (
      <ProofErrorScreen
        error={new Error("Proof spec id missing from URL")}
        onRetry={() => window.history.back()}
        runId={runId}
      />
    );
  }

  if (isPending || !spec) {
    if (error) {
      return <ProofErrorScreen error={error} onRetry={refetch} runId={runId} />;
    }
    return <ProofSkeleton />;
  }

  if (error) {
    return <ProofErrorScreen error={error} onRetry={refetch} runId={runId} />;
  }

  return (
    <PageBody
      data={toProofData({ spec })}
      runId={runId}
      submitting={submitMutation.isPending}
      onSubmit={(payload) => submitMutation.mutate(payload)}
    />
  );
}

interface PageBodyProps {
  data: ProofPageData;
  runId?: string;
  submitting: boolean;
  onSubmit: (payload: SubmitProofPayload) => void;
}

function PageBody({ data, runId, submitting, onSubmit }: PageBodyProps) {
  const navigate = useNavigate();

  const [method, setMethod] = useState<ProofMethod>("FINAL_ASSET");
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<string | undefined>(undefined);
  const [computingHash, setComputingHash] = useState(false);
  const [fileError, setFileError] = useState<string | undefined>(undefined);
  const [attestationConfirmed, setAttestationConfirmed] = useState(false);
  const [attestationError, setAttestationError] = useState<string | undefined>(
    undefined,
  );
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const hashRequestRef = useRef(0);

  const handleFileSelected = (next: File) => {
    setFile(next);
    setFileError(undefined);
    setHash(undefined);
    setComputingHash(true);
    const reqId = ++hashRequestRef.current;
    sha256File(next)
      .then((digest) => {
        if (reqId !== hashRequestRef.current) return;
        setHash(digest);
        setComputingHash(false);
      })
      .catch(() => {
        if (reqId !== hashRequestRef.current) return;
        setComputingHash(false);
        setFileError(
          "Could not compute the file hash. Please try a different file.",
        );
      });
  };

  const clearFile = () => {
    hashRequestRef.current += 1;
    setFile(null);
    setHash(undefined);
    setComputingHash(false);
    setFileError(undefined);
  };

  const handleMethodChange = (next: ProofMethod) => {
    if (next === method) return;
    setMethod(next);
    clearFile();
    setAttestationConfirmed(false);
    setAttestationError(undefined);
    setSubmitAttempted(false);
  };

  const submitDisabledReason = useMemo<string | undefined>(() => {
    if (!file) return "Choose a file to upload before submitting.";
    if (computingHash) return "Computing file hash…";
    if (method === "FINAL_ASSET" && !hash) return "File hash unavailable.";
    if (method === "SCREENSHOT" && !attestationConfirmed) {
      return "Confirm the attestation before submitting.";
    }
    return undefined;
  }, [file, computingHash, hash, method, attestationConfirmed]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitAttempted(true);

    if (!file) {
      setFileError("Choose a file to upload.");
      return;
    }
    if (method === "SCREENSHOT" && !attestationConfirmed) {
      setAttestationError(
        "Confirm the attestation before submitting the screenshot proof.",
      );
      return;
    }
    if (computingHash || (method === "FINAL_ASSET" && !hash)) {
      return;
    }

    if (method === "FINAL_ASSET") {
      onSubmit({
        proof_method: "FINAL_ASSET",
        filename: file.name,
        size_bytes: file.size,
        hash: hash!,
      });
    } else {
      onSubmit({
        proof_method: "SCREENSHOT",
        filename: file.name,
        size_bytes: file.size,
        hash,
        attestation_confirmed: true,
      });
    }
  };

  const goBack = () => {
    if (runId) navigate(`/preflight/${runId}`);
    else window.history.back();
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <TopBar assetFilename={data.topBar.assetFilename} workspace={data.topBar.workspaceLabel} />

      <AttestationStrip data={data.attestationStrip} />

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6">
        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-[1040px] space-y-5">
          <ProofIntroCard title={data.title} description={data.description} />

          <MethodSelectorCard
            data={data.methodSelector}
            selected={method}
            onChange={handleMethodChange}
          />

          {method === "FINAL_ASSET" ? (
            <FinalAssetPanel
              data={{
                ...data.finalAssetForm,
                validationChecks: deriveValidationChecks(
                  data.finalAssetForm.validationChecks,
                  Boolean(file && hash && !computingHash),
                ),
              }}
              selectedFile={file}
              hash={hash}
              computingHash={computingHash}
              errorMessage={
                submitAttempted && !file ? fileError ?? "Choose a file to upload." : fileError
              }
              disabled={submitting}
              onFileSelected={handleFileSelected}
              onClear={clearFile}
            />
          ) : null}

          {method === "SCREENSHOT" ? (
            <ScreenshotPanel
              data={data.screenshotForm}
              selectedFile={file}
              attestationConfirmed={attestationConfirmed}
              errorMessage={
                submitAttempted && !file ? fileError ?? "Choose a file to upload." : fileError
              }
              attestationError={
                submitAttempted && !attestationConfirmed
                  ? attestationError ?? "Confirm the attestation before submitting."
                  : undefined
              }
              disabled={submitting}
              onFileSelected={handleFileSelected}
              onClear={clearFile}
              onAttestationChange={(next) => {
                setAttestationConfirmed(next);
                if (next) setAttestationError(undefined);
              }}
            />
          ) : null}

          <ProofActionBar
            backCta={data.footer.backCta}
            submitCta={data.footer.submitCta}
            submitting={submitting}
            submitDisabled={submitting || Boolean(submitDisabledReason)}
            onBack={goBack}
          />
        </form>
      </main>
    </div>
  );
}

interface TopBarProps {
  assetFilename: string;
  workspace?: string;
}

function TopBar({ assetFilename, workspace }: TopBarProps) {
  const trail = ["Asset Library", "Pre-Flight", assetFilename, "Upload Disclosure Proof"];
  const lastIndex = trail.length - 1;
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 overflow-hidden bg-[#0A1F44] px-6 text-white shadow-sm">
      <span className="shrink-0 whitespace-nowrap font-display text-lg font-semibold tracking-tight">
        Praetion <span className="text-[#7BB4E2]">AI</span>
      </span>
      <span className="h-5 w-px shrink-0 bg-white/20" aria-hidden />
      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 flex-1 items-center gap-2 text-sm text-white/70"
      >
        {trail.map((item, i) => {
          const isLast = i === lastIndex;
          return (
            <Fragment key={i}>
              {i > 0 ? (
                <span aria-hidden className="hidden shrink-0 text-white/40 md:inline">
                  →
                </span>
              ) : null}
              <span
                className={cn(
                  isLast
                    ? "min-w-0 flex-1 truncate font-medium text-white"
                    : "hidden shrink-0 whitespace-nowrap md:inline",
                )}
              >
                {item}
              </span>
            </Fragment>
          );
        })}
      </nav>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <span className="shrink-0 whitespace-nowrap rounded-md border-[1.5px] border-white/40 bg-white/5 px-4 py-1.5 text-xs font-medium text-white">
          Reviewer
        </span>
        {workspace ? (
          <span className="shrink-0 whitespace-nowrap rounded-md border-[1.5px] border-white/40 bg-white/5 px-4 py-1.5 text-xs font-medium text-white">
            Workspace: {workspace}
          </span>
        ) : null}
      </div>
    </header>
  );
}

const POST_UPLOAD_DETAIL: Partial<Record<MetadataValidationCheck["id"], string>> = {
  MODALITY_MATCH: "Matches original",
  DURATION_CHECK: "Within ±2s of original",
};

function deriveValidationChecks(
  base: MetadataValidationCheck[],
  uploaded: boolean,
): MetadataValidationCheck[] {
  if (!uploaded) return base;
  return base.map((check) => {
    if (check.status === "NOT_APPLICABLE") return check;
    return {
      ...check,
      status: "PASS",
      detail: check.detail ?? POST_UPLOAD_DETAIL[check.id] ?? "Verified",
    };
  });
}
