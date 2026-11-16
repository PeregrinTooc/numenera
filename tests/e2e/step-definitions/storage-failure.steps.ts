import { Given, When, Then } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world.js";

Given("the browser storage is full", async function (this: CustomWorld) {
  await this.storageFailure.storageIsFull();
});

Given("writing to the browser storage fails", async function (this: CustomWorld) {
  await this.storageFailure.writesFail();
});

When("the browser storage works again", async function (this: CustomWorld) {
  await this.storageFailure.storageWorksAgain();
});

Then("the save indicator should report that storage is full", async function (this: CustomWorld) {
  await this.saveIndicator.expectReportsStorageFull();
});

Then(
  "the save indicator should report that changes could not be saved",
  async function (this: CustomWorld) {
    await this.saveIndicator.expectReportsSaveFailed();
  }
);

Then("the save indicator should not report a storage problem", async function (this: CustomWorld) {
  await this.saveIndicator.expectNoStorageProblem();
});

Then(
  "the save indicator should not contain {string}",
  async function (this: CustomWorld, text: string) {
    await this.saveIndicator.expectDoesNotShow(text);
  }
);

Then("the save indicator should be inside the viewport", async function (this: CustomWorld) {
  await this.saveIndicator.expectInsideViewport();
});
