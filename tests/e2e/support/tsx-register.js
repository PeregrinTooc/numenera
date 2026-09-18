// Registers tsx so Cucumber can load the TypeScript support code and step
// definitions as ESM. Must be listed first in the `import` array of
// cucumber.cjs — it cannot itself be TypeScript, because nothing would be
// registered yet to transpile it.
import { register } from "tsx/esm/api";

register();
