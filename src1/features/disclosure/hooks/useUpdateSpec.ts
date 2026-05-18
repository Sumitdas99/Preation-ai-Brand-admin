import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  DisclosureSpec,
  UpdateDisclosureSpecRequest,
} from "@/api/schemas/disclosure";
import { updateDisclosureSpec } from "@/api/endpoints/disclosure";
import { disclosureKeys } from "./queryKeys";

function showError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  toast.error(fallback, { description: message });
}

export function useUpdateSpec(specId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateDisclosureSpecRequest) => {
      if (!specId) return Promise.reject(new Error("specId missing"));
      return updateDisclosureSpec(specId, body);
    },
    onSuccess: (data: DisclosureSpec) => {
      if (specId) {
        qc.setQueryData(disclosureKeys.detail(specId), data);
      }
    },
    onError: (error) => showError(error, "Could not update disclosure spec"),
  });
}
