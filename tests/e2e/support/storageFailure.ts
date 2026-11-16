import type { StorageFailureDriver } from "./storageFailureDriver.js";

export class StorageFailureDsl {
  constructor(private storage: StorageFailureDriver) {}

  async storageIsFull(): Promise<void> {
    await this.storage.failWrites("QuotaExceededError");
  }

  async writesFail(): Promise<void> {
    await this.storage.failWrites("UnknownError");
  }

  async storageWorksAgain(): Promise<void> {
    await this.storage.restoreWrites();
  }
}
