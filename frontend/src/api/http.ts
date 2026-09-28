import { useSessionStore } from "../stores/SessionStore";
import { ERROR_MESSAGES } from "../constants/errorMessages";

export interface ApiErrorDetail {
  part_code?: string;
  required_quantity?: number;
  remaining_quantity?: number;
  pending_approval_codes?: string[];
  insufficient_codes?: string[];
  unresolved_codes?: string[];
  reused_first_result?: boolean;
  [key: string]: unknown;
}

export class ApiError extends Error {
  code: string;
  status: number;
  detail?: ApiErrorDetail;

  constructor(code: string, status: number, message: string, detail?: ApiErrorDetail) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.detail = detail;
  }
}

// Every request carries the dev auth role so backend RBAC and button visibility agree.
export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let role = "DISPATCHER";
  try {
    role = useSessionStore().role;
  } catch {
    // Pinia may not be active in isolated tests; fall back to the dispatcher role.
  }
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", "x-role": role, ...(init.headers ?? {}) }
  });
  if (!res.ok) {
    let body: { code?: string; message?: string; detail?: ApiErrorDetail } = {};
    try {
      body = await res.json();
    } catch {
      // Non-JSON error response keeps the generic message below.
    }
    const code = body.code ?? "CONTROLLER_ERROR";
    const fallback = ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES] ?? body.message ?? "请求失败";
    throw new ApiError(code, res.status, body.message ?? fallback, body.detail);
  }
  return (await res.json()) as T;
}

export const postJson = <T>(path: string, payload: unknown = {}) =>
  request<T>(path, { method: "POST", body: JSON.stringify(payload) });
