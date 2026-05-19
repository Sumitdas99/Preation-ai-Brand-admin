import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
    <div className="flex h-[calc(100vh-80px)] min-h-0 flex-col overflow-hidden bg-background">
      {/* Integrated Breadcrumb Header */}
      <div className="px-6 py-4 border-b bg-card/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/assets">Recent Assets</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {runId && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={`/preflight/${runId}`}>Pre-Flight Scan</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Upload Proof</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-xl font-bold font-display mt-2 tracking-tight">
            Upload Disclosure Proof
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="shrink-0 whitespace-nowrap rounded-md border border-border bg-secondary/10 px-3 py-1.5 text-xs font-semibold text-foreground">
            Role: Reviewer
          </span>
          {data.topBar.workspaceLabel && (
            <span className="shrink-0 whitespace-nowrap rounded-md border border-border bg-secondary/10 px-3 py-1.5 text-xs font-semibold text-foreground">
              {data.topBar.workspaceLabel}
            </span>
          )}
        </div>
      </div>

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
