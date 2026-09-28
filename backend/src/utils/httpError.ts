import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

export type ErrorCode = keyof typeof ERROR_CODES;

export class HttpError extends Error {
  status: number;
  code: ErrorCode;
  detail?: unknown;

  constructor(code: ErrorCode, status = 400, detail?: unknown) {
    super(ERROR_MESSAGES[code]);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}

// Service layer wraps its own business failures.
export const serviceError = (code: ErrorCode, status = 400, detail?: unknown) => new HttpError(code, status, detail);

// Controller layer wraps unexpected failures coming out of services instead of swallowing them globally.
export const controllerError = (cause: unknown) =>
  cause instanceof HttpError ? cause : new HttpError("CONTROLLER_ERROR", 500, { cause: String(cause) });
