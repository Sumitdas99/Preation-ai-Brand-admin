import { z, type ZodTypeAny } from "zod";
import { API_BASE_URL, IS_DEV, USE_MSW } from "@/lib/env";
import { fromStatus, NetworkError, SchemaError } from "./errors";
import { getLegalScenario } from "./legalScenario";
import { getMockScenario } from "./mockScenario";

// When MSW is active, use empty base so requests go to same-origin (localhost:5173)
// and the Service Worker can intercept them. Otherwise use the real API base URL.
const BASE_URL = USE_MSW ? "" : API_BASE_URL;

const DEFAULT_TIMEOUT_MS = 15_000;

interface RequestOptions<TSchema extends ZodTypeAny | undefined = undefined> {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  schema?: TSchema;
  signal?: AbortSignal;
  timeoutMs?: number;
  headers?: Record<string, string>;
}

type Parsed<TSchema extends ZodTypeAny | undefined> = TSchema extends ZodTypeAny
  ? z.infer<TSchema>
  : unknown;

function buildHeaders(
  body: unknown,
  extra: Record<string, string> | undefined,
): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...extra,
  };
  if (body !== undefined && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const token = typeof window !== "undefined"
    ? window.localStorage?.getItem("praetion.auth.token")
    : null;
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (USE_MSW) {
    headers["x-mock-scenario"] = getMockScenario();
    headers["x-legal-scenario"] = getLegalScenario();
  }

  return headers;
}

async function parseJsonSafely(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function request<TSchema extends ZodTypeAny | undefined = undefined>(
  path: string,
  options: RequestOptions<TSchema> = {},
): Promise<Parsed<TSchema>> {
  const {
    method = "GET",
    body,
    schema,
    signal,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    headers: extraHeaders,
  } = options;

  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  const combinedSignal = linkSignals(controller.signal, signal);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: buildHeaders(body, extraHeaders),
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
      signal: combinedSignal,
      credentials: "include",
    });
  } catch (err) {
    if ((err as Error)?.name === "AbortError") {
      throw new NetworkError("Request timed out or was aborted", url, err);
    }
    throw new NetworkError(
      err instanceof Error ? err.message : "Network request failed",
      url,
      err,
    );
  } finally {
    window.clearTimeout(timeoutId);
  }

  const correlationId =
    response.headers.get("x-correlation-id") ??
    response.headers.get("x-request-id") ??
    undefined;

  if (!response.ok) {
    const errorBody = await parseJsonSafely(response);
    throw fromStatus(response.status, {
      url,
      body: errorBody,
      correlationId,
    });
  }

  if (response.status === 204) {
    return undefined as Parsed<TSchema>;
  }

  const payload = await parseJsonSafely(response);

  if (!schema) {
    return payload as Parsed<TSchema>;
  }

  const result = schema.safeParse(payload);
  if (!result.success) {
    if (IS_DEV) {
      console.error("[api] schema mismatch", {
        url,
        issues: result.error.issues,
        payload,
      });
    }
    throw new SchemaError({
      url,
      status: response.status,
      issues: result.error.issues,
      body: payload,
    });
  }
  return result.data as Parsed<TSchema>;
}

function linkSignals(a: AbortSignal, b: AbortSignal | undefined): AbortSignal {
  if (!b) return a;
  if (a.aborted) return a;
  if (b.aborted) return b;
  const controller = new AbortController();
  const onAbortA = () => controller.abort(a.reason);
  const onAbortB = () => controller.abort(b.reason);
  a.addEventListener("abort", onAbortA, { once: true });
  b.addEventListener("abort", onAbortB, { once: true });
  return controller.signal;
}

export const apiClient = {
  get: <TSchema extends ZodTypeAny>(
    path: string,
    schema: TSchema,
    init: Omit<RequestOptions<TSchema>, "method" | "body" | "schema"> = {},
  ) => request(path, { ...init, method: "GET", schema }),

  post: <TSchema extends ZodTypeAny>(
    path: string,
    body: unknown,
    schema: TSchema,
    init: Omit<RequestOptions<TSchema>, "method" | "body" | "schema"> = {},
  ) => request(path, { ...init, method: "POST", body, schema }),

  postVoid: (
    path: string,
    body: unknown,
    init: Omit<RequestOptions, "method" | "body" | "schema"> = {},
  ) => request(path, { ...init, method: "POST", body }),
};
