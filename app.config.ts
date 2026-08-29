import type { ApplicationRegistry } from "./src/kit/shared/config";
import { brainflip } from "./src/app/app.config";

/**
 * The applications this repository can build. Add more with the
 * crumb-new-application skill.
 */
export const registry: ApplicationRegistry = {
  default: "brainflip",
  applications: { brainflip },
};
