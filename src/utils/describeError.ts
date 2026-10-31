import { t } from "@/i18n/index";
import { UserFacingError } from "@/utils/UserFacingError";

/**
 * Translated, user-presentable text for a caught error. Errors that are not
 * UserFacingErrors get a generic message; their details belong in the console.
 */
export function describeError(error: unknown): string {
  if (error instanceof UserFacingError) {
    return t(error.messageKey);
  }
  return t("errors.unexpected");
}
