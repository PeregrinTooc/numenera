/**
 * Window globals that E2E steps and hooks install inside the browser page for
 * later assertions. Declared once here so no step needs to cast `window`.
 * App-owned test hooks (`__testStorage`, `__testTimer`, ...) are declared in
 * src/main.ts.
 */
export {};

declare global {
  interface Window {
    __saveCount?: number;
    __saveObserver?: MutationObserver;
    _lastWrittenData?: string;
    _exportedData?: string;
    _cancelFilePicker?: boolean;
    _saveDialogShown?: boolean;
    _saveDialogCallCount?: number;
    _suggestedFilename?: string;
    _downloadFilename?: string;
    _downloadData?: string;
  }
}
