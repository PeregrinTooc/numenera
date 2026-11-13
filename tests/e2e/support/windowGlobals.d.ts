/**
 * Window globals that E2E steps and hooks install inside the browser page for
 * later assertions. Declared once here so no step needs to cast `window`.
 * App-owned test hooks (`__testStorage`, `__testTimer`, ...) are declared in
 * src/main.ts.
 */
/** A section slide the app started (see section-slide.steps.ts). */
export interface SectionSlideRecord {
  sectionId: string;
  /** The transform the slide starts from. */
  from: string;
  finished: boolean;
}

declare global {
  interface Window {
    __sectionSlides?: SectionSlideRecord[];
    __saveCount?: number;
    __restoreStorageWrites?: () => void;
    __saveObserver?: MutationObserver;
    _lastWrittenData?: string;
    _exportedData?: string;
    _cancelFilePicker?: boolean;
    _saveDialogShown?: boolean;
    _saveDialogCallCount?: number;
    _writeCount?: number;
    _suggestedFilename?: string;
    _downloadFilename?: string;
    _downloadData?: string;
  }
}
