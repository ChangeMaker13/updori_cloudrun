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
import { getAccount } from "./getAccount.js";
import { getCurrentPrice } from "./getCurrentPrice.js";
import { calcMinPriceUnit } from "./calcMinPriceUnit.js";
import { SellCoinsParams } from "../types.js";
import { sellCoin } from "./sellcoin.js";
const queryEncode = qs.encode;

const server_url = "https://api.upbit.com";

export async function sellCoins(access_key: string, secret_key: string, sellCoinsParams: SellCoinsParams[]) {
  //console.log(sellCoinsParams);

  for (const sellCoinsParam of sellCoinsParams) {
    const { currency, priceSettings } = sellCoinsParam;
    const market = `KRW-${currency}`;

    // 보유중인 코인 정보 조회
    const account = await getAccount(access_key, secret_key);
    const parsedAccount = JSON.parse(account.body);
    const holdingInfo = parsedAccount.find((item: any) => item.currency === currency);

    if (!holdingInfo) {
      console.log(`${currency} 보유중인 코인이 없습니다.`);
      continue;
    }

    const currentBalance = holdingInfo.balance;

    // 코인 현재가 조회
    const currentPrice: number = await getCurrentPrice(market);
    const minPriceUnit = calcMinPriceUnit(currentPrice, market);
    //let sellPrice = currentPrice * (1 + price * 0.01);
    //console.log("sellPrice before", sellPrice);
    //sellPrice = Math.round(sellPrice / minPriceUnit) * minPriceUnit;

    for (const priceSetting of priceSettings) {
      await new Promise((resolve) => setTimeout(resolve, 300)); // 초당 요청수 제한을 회피하기 위해 주문 딜레이 추가
      const { amount, price } = priceSetting;
      const amountnum = currentBalance * (amount * 0.01);
      let pricenum = currentPrice * (1 + price * 0.01);
      pricenum = Math.round(pricenum / minPriceUnit) * minPriceUnit;

      const result = await sellCoin(access_key, secret_key, amountnum, pricenum, currency, market);

      console.log("result.response.statusCode", result.response.statusCode);

      if (result.response.statusCode === 201) {
        console.log(`${currency} 매도 완료`);
      } else {
        console.log(`${currency} 매도 실패`);
        console.log(result.body);
      }
    }
  }
}
