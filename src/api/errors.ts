export class ApiError extends Error {
  public readonly status: number;
  public readonly url: string;
  public readonly body: unknown;
  public readonly correlationId?: string;

  constructor(
    message: string,
    opts: {
      status: number;
      url: string;
      body?: unknown;
      correlationId?: string;
    },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = opts.status;
    this.url = opts.url;
    this.body = opts.body;
    this.correlationId = opts.correlationId;
  }
}

export class AuthError extends ApiError {
  constructor(opts: ConstructorParameters<typeof ApiError>[1]) {
    super("Authentication required", opts);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(opts: ConstructorParameters<typeof ApiError>[1]) {
    super("You do not have permission to perform this action", opts);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends ApiError {
  constructor(opts: ConstructorParameters<typeof ApiError>[1]) {
    super("Resource not found", opts);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends ApiError {
  constructor(opts: ConstructorParameters<typeof ApiError>[1]) {
    super("Conflict with current resource state", opts);
    this.name = "ConflictError";
  }
}

export class ValidationError extends ApiError {
  constructor(opts: ConstructorParameters<typeof ApiError>[1]) {
    super("Request failed validation", opts);
    this.name = "ValidationError";
  }
}

export class ServerError extends ApiError {
  constructor(opts: ConstructorParameters<typeof ApiError>[1]) {
    super("Server error", opts);
    this.name = "ServerError";
  }
}

export class NetworkError extends ApiError {
  constructor(message: string, url: string, cause?: unknown) {
    super(message, { status: 0, url, body: cause });
    this.name = "NetworkError";
  }
}

export class SchemaError extends ApiError {
  public readonly issues: unknown;

  constructor(opts: {
    url: string;
    status: number;
    issues: unknown;
    body?: unknown;
  }) {
    super("Response did not match expected schema", {
      status: opts.status,
      url: opts.url,
      body: opts.body,
    });
    this.name = "SchemaError";
    this.issues = opts.issues;
  }
}

export function fromStatus(
  status: number,
  opts: Omit<ConstructorParameters<typeof ApiError>[1], "status">,
): ApiError {
  const base = { ...opts, status };
  if (status === 401) return new AuthError(base);
  if (status === 403) return new ForbiddenError(base);
  if (status === 404) return new NotFoundError(base);
  if (status === 409) return new ConflictError(base);
  if (status === 422) return new ValidationError(base);
  if (status >= 500) return new ServerError(base);
  return new ApiError(`Request failed with status ${status}`, base);
}
