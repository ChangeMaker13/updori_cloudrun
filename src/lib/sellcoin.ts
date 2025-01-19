/* eslint-disable */
import express, { NextFunction, Request, Response } from "express";
import { Server } from "node:http";
import { AddressInfo } from "node:net";
import process from "node:process";

import request from "request";
import { v4 as uuidv4 } from "uuid";

import jwt from "jsonwebtoken";
const { sign } = jwt;

import crypto from "crypto";
import qs from "querystring";
import { getAccount } from "./getAccount";
import { getCurrentPrice } from "./getCurrentPrice";
import { calcMinPriceUnit } from "./calcMinPriceUnit";
const queryEncode = qs.encode;

const server_url = "https://api.upbit.com";

export async function sellCoin(
  access_key: string,
  secret_key: string,
  amountnum: number, // 퍼센트가 아닌 숫자
  pricenum: number, // 퍼센트가 아닌 숫자
  currency: string,
  market: string,
): Promise<{ response: any; body: any }> {
  return new Promise(async (resolve, reject) => {
    // 보유중인 코인 정보 조회
    //const account = await getAccount(access_key, secret_key);
    //const parsedAccount = JSON.parse(account.body);
    //const holdingInfo = parsedAccount.find((item: any) => item.currency === currency);
    //
    //const sellVolume = holdingInfo.balance * (amount * 0.01);

    // 코인 현재가 조회
    //const currentPrice: number = await getCurrentPrice(market);
    //
    //let sellPrice = currentPrice * (1 + price * 0.01);
    //console.log("sellPrice before", sellPrice);
    //const minPriceUnit = calcMinPriceUnit(sellPrice, market);
    //sellPrice = Math.round(sellPrice / minPriceUnit) * minPriceUnit;
    //
    //console.log("sellPrice after", sellPrice);

    const body = {
      market: market,
      side: "ask",
      volume: amountnum.toString(),
      price: pricenum.toString(),
      ord_type: "limit",
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
      method: "POST",
      url: server_url + "/v1/orders",
      headers: { Authorization: `Bearer ${token}` },
      json: body,
    };

    request(options, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        resolve({
          response: response,
          body: body,
        });
      }
    });
  });
}
