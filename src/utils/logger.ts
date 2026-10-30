/**
 * The app's logger. Diagnostic messages (debug, info) print only in dev
 * builds; warnings and errors always reach the console. Production code logs
 * through this instead of calling console directly (ESLint no-console).
 */
export const logger = {
  debug(...args: unknown[]): void {
    if (import.meta.env.DEV) console.debug(...args);
  },
  info(...args: unknown[]): void {
    if (import.meta.env.DEV) console.info(...args);
  },
  warn(...args: unknown[]): void {
    console.warn(...args);
  },
  error(...args: unknown[]): void {
    console.error(...args);
  },
};
