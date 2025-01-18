import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import { Server } from "node:http";
import { AddressInfo } from "node:net";
import { env, stdout } from "node:process";
import supertest from "supertest";

/**
 * This module can be used for smoke tests (a small subset of full integration
 * or end-to-end tests) when you just want to quickly determine that the app
 * is basically performing as expected.
 *
 * If `SERVICE_URL` is NOT set:
 *   - the server will be started on localhost for testing
 *   - the port will be chosen at random unless `PORT` is also set
 *
 * Otherwise, if `SERVICE_URL` IS set:
 *   - the smoke tests will be run for app deployed at `SERVICE_URL`.
 *   - `PORT` environment variable is ignored (however, port is not ignored
 *      if specified as part of `SERVICE_URL`)
 */

import { app, start, stop } from "../src/app.js";

const url = env["SERVICE_URL"];
const port = process.env["PORT"] || "0";

let server: Server;
let request: supertest.SuperTest<supertest.Test>;
const headers: any = {};
const description = url
  ? `Remote smoke tests for: ${url}`
  : `Local smoke tests ${port === "0" ? "" : `on port ${port}`}`;

beforeAll(async () => {
  if (!url) {
    server = await start(port);
    request = supertest(app);
    const address = server.address() as AddressInfo;
    stdout.write(`Service URL: http://localhost:${address.port}\n`);
  } else {
    request = supertest(url);
    // For some reason, supertest isn't setting the user-agent
    // In any case, setting to "smoke-test" looks nice in the logs
    headers["User-Agent"] = "smoke-test";
    stdout.write(`Service URL: ${url}\n`);
  }
});

afterAll(async () => {
  if (server) {
    await stop();
  }
});

describe(description, () => {
  test("HEAD /", async () => {
    const route = "/";
    await request.head(route).set(headers).expect(200);
  });
  test("GET /", async () => {
    const route = "/";
    const res = await request.get(route).set(headers).expect(200);
    expect(res.text).toBe("ok");
  });
  test("GET /api/ping", async () => {
    const route = "/api/ping";
    const res = await request.get(route).set(headers).expect(200);
    expect(res.body.message).toBe("ok");
  });
  test("POST /api/echo", async () => {
    const route = "/api/echo";
    const message = {
      message: "hello",
    };
    const res = await request
      .post(route)
      .set(headers)
      .send(message)
      .expect(200);
    expect(res.body.message).toBe("hello");
  });
});
