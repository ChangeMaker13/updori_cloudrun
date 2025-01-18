import { env } from "node:process";

/**
 * Returns the package name if the process was started with npm (or if the
 * environment variable `npm_package_name` has been manually set).
 * @param {bool} shouldThrow Set to true if the function should throw.
 * @return {string} The package name or an empty string if shouldThrow is false.
 * @throws Error if `npm_package_name` isn't set (either set this manually or
 * use npm (`npm start|test`) when starting the process. See
 * [package.json vars](https://docs.npmjs.com/cli/v10/using-npm/scripts#packagejson-vars).
 */
export function getPackageName(shouldThrow = false): string {
  const name = env["npm_package_name"] || "";
  if (!name && shouldThrow) {
    throw new Error(
      "npm_package_name not set (start process with npm or set environment explicitly)",
    );
  }
  return name;
}
