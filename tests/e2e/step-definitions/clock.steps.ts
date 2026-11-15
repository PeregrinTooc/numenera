import { When } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world.js";

const MS_PER_MINUTE = 60_000;

When("{int} minute(s) pass", async function (this: CustomWorld, minutes: number) {
  await this.clock.advance(minutes * MS_PER_MINUTE);
});
