import { ApiError } from "../api/request";
import { ERROR_MESSAGES } from "../constants/errorMessages";

/** 把后端业务错误转成可展示文案，并展开未处理备件编码。 */
export const describeApiError = (err: unknown): { message: string; codes: string[] } => {
  const codes = new Set<string>();
  if (err instanceof ApiError) {
    const details = err.details as
      | { pending_part_codes?: string[]; insufficient_part_codes?: string[]; unresolved_part_codes?: string[] }
      | undefined;
    details?.pending_part_codes?.forEach((code) => codes.add(code));
    details?.insufficient_part_codes?.forEach((code) => codes.add(code));
    if (codes.size === 0) details?.unresolved_part_codes?.forEach((code) => codes.add(code));
    return {
      message: ERROR_MESSAGES[err.code as keyof typeof ERROR_MESSAGES] ?? err.message,
      codes: [...codes]
    };
  }
  return { message: err instanceof Error ? err.message : String(err), codes: [] };
};
