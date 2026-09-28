import { ERROR_CODES } from "../constants/errorCodes";

export class BusinessError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(code: string, message: string, status = 400, details?: unknown) {
    super(message);
    this.name = "BusinessError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const businessError = (code: keyof typeof ERROR_CODES, message: string, status = 400, details?: unknown) =>
  new BusinessError(ERROR_CODES[code], message, status, details);
