/* eslint-disable */
import dotenv from "dotenv";
dotenv.config();

import express, { NextFunction, Request, Response } from "express";
import { Server } from "node:http";
import { AddressInfo } from "node:net";
import process from "node:process";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}");

import admin from "firebase-admin";
admin.initializeApp({
  //credential: admin.credential.applicationDefault(),
  credential: admin.credential.cert(serviceAccount),
});

import request from "request";
import { v4 as uuidv4 } from "uuid";

import jwt from "jsonwebtoken";
const { sign } = jwt;

import crypto from "crypto";
import qs from "querystring";
import { getAccount } from "./lib/getAccount.js";
import { getCurrentPrice } from "./lib/getCurrentPrice.js";
import { calcMinPriceUnit } from "./lib/calcMinPriceUnit.js";
import { sellCoin } from "./lib/sellcoin.js";
import { sellCoins } from "./lib/sellcoins.js";
import { makeTask } from "./lib/cloudTask.js";
import { sellRoutine } from "./lib/sellRoutine.js";
const queryEncode = qs.encode;

const server_url = "https://api.upbit.com";

const cloud_run_url = process.env["NODE_ENV"] === "production" ? "https://updori-cloud-run-default-rtdb.firebaseio.com" : "http://localhost:8080";

const db = admin.firestore();

export const app = express();

// Request middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/api/verifytoken", async (req: Request, res: Response): Promise<void> => {
  const access_key = req.body.access_key;
  const secret_key = req.body.secret_key;

  try {
    const account = await getAccount(access_key, secret_key);
    if (account.response.statusCode === 200) {
      res.status(200).send({
        message: "valid key",
      });
    } else {
      res.status(401).send({
        message: "invalid key",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "internal server error: " + error,
    });
  }
});

app.post("/api/getaccount", async (req: Request, res: Response): Promise<void> => {
  const access_key = req.body.access_key;
  const secret_key = req.body.secret_key;

  try {
    const account = await getAccount(access_key, secret_key);
    if (account.response.statusCode === 200) {
      res.status(200).send(account.body);
    } else {
      res.status(401).send({
        message: "invalid key",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "internal server error: " + error,
    });
  }
});

app.post("/api/sellcoin", async (req: Request, res: Response): Promise<void> => {
  const access_key = req.body.access_key;
  const secret_key = req.body.secret_key;
  const amount = req.body.amount;
  const price = req.body.price;
  const currency = req.body.currency;
  const market = req.body.market;

  try {
    const result = await sellCoin(access_key, secret_key, amount, price, currency, market);
    res.status(result.response.statusCode).send(result.body);
  } catch (error) {
    res.status(500).send({
      message: "internal server error: " + error,
    });
  }
});

app.post("/api/sellcoins", async (req: Request, res: Response): Promise<void> => {
  const access_key = req.body.access_key;
  const secret_key = req.body.secret_key;
  const sellCoinsParams = req.body.sellCoinsParams;

  console.log(sellCoinsParams);

  sellCoins(access_key, secret_key, sellCoinsParams);

  res.status(200).send({
    message: "sell coins started",
  });
});

app.post("/api/makeTask", async (req: Request, res: Response): Promise<void> => {
  const funcName = req.body.funcName;
  const afterSeconds = req.body.afterSeconds;
  const payload = req.body.payload;

  try {
    await makeTask(funcName, afterSeconds, payload);
    res.status(200).send({
      message: "task created",
    });
  } catch (error) {
    res.status(500).send({
      message: "internal server error: " + error,
    });
  }
});

app.post("/api/sellRoutine", async (req: Request, res: Response): Promise<void> => {
  const access_key = req.body.access_key;
  const secret_key = req.body.secret_key;
  const sellSettingId = req.body.sellSettingId;

  //24시간 후 다시 실행
  const options = {
    method: "POST",
    url: cloud_run_url + "/api/makeTask",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    form: {
      funcName: "api/sellRoutine",
      afterSeconds: "86400",
      payload: req.body,
    },
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
  });

  try {
    await sellRoutine(db, access_key, secret_key, sellSettingId);
  } catch (error) {
    res.status(500).send({
      message: "internal server error: " + error,
    });
  }

  res.status(200).send({
    message: "sell routine started",
  });
});

app.post("/api/echo", (req: Request, res: Response): void => {
  const message = req.body.message;
  res.send({
    message: message,
  });
});

// Error middleware
app.use((req: Request, res: Response, next: NextFunction): void => {
  res.statusCode = 404;
  next(new Error("Not found"));
});

app.use((error: any, req: Request, res: Response, next: NextFunction): void => {
  if (res.headersSent) {
    console.log("headers already sent");
    return next(error);
  }
  const status = error.status || error.statusCode || 404;
  const errorMsg = error.message || String(error);
  console.error("error:", req.method, req.url, error.message || String(error));
  let result = errorMsg;
  if (req.url.startsWith("/api")) {
    res.contentType("application/json");
    result = JSON.stringify({
      ok: false,
      error: errorMsg,
    });
  }
  res.status(status).send(result);
});

let server: Server;
export async function start(port: number | string): Promise<Server> {
  console.log("Server starting...");
  return new Promise((resolve) => {
    server = app
      .listen(port, () => {
        const address = server.address() as AddressInfo;
        console.log(`Listening on http://localhost:${address.port}`);
        ["SIGTERM", "SIGINT"].forEach((signal): void => {
          process.on(signal, stop);
        });
        resolve(server);
      })
      .on("close", () => {
        console.log("Server connection closed");
      })
      .on("error", async (error) => {
        await stop(error);
      });
  });
}
export async function stop(signal?: string | Error): Promise<void> {
  if (signal instanceof Error) {
    process.exitCode = 1;
    console.error(`error: ${signal.message}`);
    console.log("stop (error)");
  } else {
    if (signal) {
      console.log(`stop (${signal})`);
    } else {
      console.log("stop");
    }
  }
  if (server) {
    try {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => {
          err ? reject(err) : resolve();
        });
      });
    } catch (error: any) {
      process.exitCode = 1;
      console.error(error.message);
    }
  }
  console.log("Server stopped");
}

// If this module is the main module, then start the server
if (import.meta.url.endsWith(process.argv[1]!)) {
  const port = process.env["PORT"] || "8080";
  await start(port);
}

// 서버 실행
const port = process.env["PORT"] || "8080";
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

////////////////////////////////functions////////////////////////////////

async function getOrderChanceInfo(
  access_key: string,
  secret_key: string,
  market: string,
): Promise<{ response: any; body: any }> {
  return new Promise((resolve, reject) => {
    const body = {
      market: market,
    };

    const query = queryEncode(body);

    const hash = crypto.createHash("sha512");
    const queryHash = hash.update(query, "utf-8").digest("hex");

    const payload = {
      access_key: access_key,
      nonce: uuidv4(),
      query_hash: queryHash,
      query_hash_alg: "SHA512",
    };

    const token = sign(payload, secret_key);

    const options = {
      method: "GET",
      url: server_url + "/v1/orders/chance?" + query,
      headers: { Authorization: `Bearer ${token}` },
      json: body,
    };

    request(options, (error, response, body) => {
      if (error) {
        reject(error);
      }
      resolve({
        response: response,
        body: body,
      });
    });
  });
}
