import { expect, test } from "@jest/globals";

import { getPackageName } from "./util.js";

test("", () => {
  const name = getPackageName();
  expect(name).toBe("cloud-run-app");
});
