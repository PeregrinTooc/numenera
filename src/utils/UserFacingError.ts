/**
 * An error whose message is meant for the user. It carries an i18n key rather
 * than text, so the storage layer stays free of translation and the display
 * site translates it (see describeError).
 */
export class UserFacingError extends Error {
  readonly cause?: unknown;

  constructor(
    readonly messageKey: string,
    options?: { cause?: unknown }
  ) {
    super(messageKey);
    this.name = "UserFacingError";
    this.cause = options?.cause;
  }
}
