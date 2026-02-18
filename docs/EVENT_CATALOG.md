# Event Catalog

This document catalogs all completion events emitted by the application. These events are primarily used for testing to create deterministic, race-condition-free tests.

## Event Naming Convention

All events follow this pattern:

- `{operation}-started`: Operation has begun
- `{operation}-completed`: Operation finished successfully
- `{operation}-error`: Operation failed with error

## Core Services

### AutoSaveService

**save-requested**

- Emitted when: Auto-save is triggered
- Detail: `{ timestamp: number }`
- Use case: Tests can wait for this to know save was initiated

**save-completed**

- Emitted when: Character successfully saved to storage
- Detail: `{ timestamp: number }`
- Use case: Wait for save completion before making assertions

**save-error**

- Emitted when: Save operation fails
- Detail: `{ error: string, timestamp: number }`
- Use case: Test error handling paths

### VersionHistoryService

**squash-started**

- Emitted when: Timer expires and squashing begins
- Detail: `{}`
- Use case: Know when squashing process starts

**squash-completed**

- Emitted when: Buffered changes successfully squashed into version
- Detail: `{}`
- Use case: Wait for version creation before checking version count

**squash-error**

- Emitted when: Squash operation fails
- Detail: `{ error: string }`
- Use case: Test error handling

**undo-started**

- Emitted when: Buffer undo operation begins
- Detail: `{}`
- Use case: Know when undo starts

**undo-completed**

- Emitted when: Buffer undo completes
- Detail: `{}`
- Use case: Wait for undo to finish before checking character state

**redo-started**

- Emitted when: Buffer redo operation begins
- Detail: `{}`
- Use case: Know when redo starts

**redo-completed**

- Emitted when: Buffer redo completes
- Detail: `{}`
- Use case: Wait for redo to finish before checking character state

## Storage Operations

### Character Storage

**character-loaded**

- Emitted when: Character data loaded from storage
- Detail: `{ source: 'localStorage' | 'indexedDB' }`
- Use case: Wait for initial load before interacting with UI

**character-saved**

- Emitted when: Character saved to storage
- Detail: `{ source: 'localStorage' | 'indexedDB' }`
- Use case: Confirm save completed

**character-updated**

- Emitted when: Character state changes (any field edited)
- Detail: `{ field?: string }`
- Use case: React to character changes

### Version History Storage

**version-created**

- Emitted when: New version saved to IndexedDB
- Detail: `{ versionId: string, description: string }`
- Use case: Confirm version was created

**version-loaded**

- Emitted when: Version loaded from IndexedDB
- Detail: `{ versionId: string }`
- Use case: Wait for version data to be loaded

**versions-loaded**

- Emitted when: All versions loaded from IndexedDB
- Detail: `{ count: number }`
- Use case: Wait for version list to populate

## UI Operations

### Version Navigation

**version-nav-started**

- Emitted when: Version navigation begins (backward/forward)
- Detail: `{ direction: 'backward' | 'forward', fromVersion: number, toVersion: number }`
- Use case: Track navigation flow

**version-nav-completed**

- Emitted when: Version navigation completes and UI updated
- Detail: `{ currentVersion: number, totalVersions: number }`
- Use case: Wait for navigation to complete before assertions

**version-restored**

- Emitted when: Old version restored as new latest version
- Detail: `{ versionId: string, newVersionId: string }`
- Use case: Confirm restore operation completed

### Modal Operations

**modal-opened**

- Emitted when: Edit modal opened
- Detail: `{ modalType: 'field' | 'card', field?: string }`
- Use case: Wait for modal to be fully rendered

**modal-closed**

- Emitted when: Modal closed (confirm or cancel)
- Detail: `{ modalType: 'field' | 'card', action: 'confirm' | 'cancel' }`
- Use case: Wait for modal to fully close

**field-edited**

- Emitted when: Field edit confirmed
- Detail: `{ field: string, oldValue: unknown, newValue: unknown }`
- Use case: Track field changes

### Card Operations

**card-added**

- Emitted when: Card added to collection
- Detail: `{ cardType: string, cardId: string }`
- Use case: Wait for card to be added before counting

**card-deleted**

- Emitted when: Card deleted from collection
- Detail: `{ cardType: string, cardId: string }`
- Use case: Wait for card deletion before counting

**card-edited**

- Emitted when: Card edited
- Detail: `{ cardType: string, cardId: string }`
- Use case: Wait for edit to complete

## Timer Events

**test-timer-scheduled**

- Emitted when: TestTimer schedules a new timer (test mode only)
- Detail: `{ handle: number }`
- Use case: Track pending timers in tests

## Usage in Tests

### Waiting for Single Event

```typescript
// Wait for save to complete
await page.evaluate(() => {
  return new Promise<void>((resolve) => {
    window.addEventListener("save-completed", () => resolve(), { once: true });
  });
});
```

### Waiting for Event with Timeout

```typescript
// Using the waitForEvent helper
import { waitForEvent } from "@/utils/completionNotifier";

const event = await page.evaluate(() => waitForEvent("squash-completed", 5000));
```

### Waiting for Multiple Events in Sequence

```typescript
// Wait for squash start, then completion
await page.evaluate(async () => {
  await waitForEvent("squash-started");
  await waitForEvent("squash-completed");
});
```

### Triggering Timer and Waiting

```typescript
// Trigger timer and wait for squash
await page.evaluate(() => {
  return new Promise<void>((resolve) => {
    window.addEventListener("squash-completed", () => resolve(), { once: true });
    setTimeout(() => {
      const testTimer = (window as any).__testTimer;
      if (testTimer) testTimer.triggerAll();
    }, 0);
  });
});
```

## Adding New Events

When adding new events to the codebase:

1. Use `CompletionNotifier` for new async operations:

   ```typescript
   import { CompletionNotifier } from "@/utils/completionNotifier";

   async function myOperation() {
     const notifier = new CompletionNotifier("my-operation");
     notifier.start();
     try {
       // ... do work
       notifier.complete();
     } catch (error) {
       notifier.error(error);
     }
   }
   ```

2. Document the new event in this catalog
3. Update relevant test steps to wait for the event
4. Add the event to TypeScript types if using strict event typing

## Event Best Practices

1. **Always emit completion events** for async operations
2. **Include error events** for failure cases
3. **Provide meaningful detail objects** with context
4. **Use consistent naming** following the convention
5. **Clean up listeners** using `{ once: true }` or explicit cleanup
6. **Test both success and error paths** in tests
7. **Don't rely on timing** - always wait for events
