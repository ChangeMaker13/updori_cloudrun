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
import { mylog } from "./logger.js";
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
    //let sellPrice = currentPrice * (1 + price * 0.01);
    //console.log("sellPrice before", sellPrice);
    //sellPrice = Math.round(sellPrice / minPriceUnit) * minPriceUnit;

    let availableBalance = currentBalance;
    mylog(`${availableBalance} 주문가능`, "debug");

    for (const priceSetting of priceSettings) {
      await new Promise((resolve) => setTimeout(resolve, 300)); // 초당 요청수 제한을 회피하기 위해 주문 딜레이 추가
      const { amount, price } = priceSetting;
      let amountnum = currentBalance * (amount * 0.01);
      mylog(`${amountnum} 주문시도, ${availableBalance} 주문가능`, "debug");
      if(availableBalance < amountnum){
        amountnum = availableBalance;
      }
      let pricenum = currentPrice * (1 + price * 0.01);
      const minPriceUnit = calcMinPriceUnit(pricenum, market);
      pricenum = Math.floor(pricenum / minPriceUnit) * minPriceUnit;

      const result = await sellCoin(access_key, secret_key, amountnum, pricenum, currency, market);

      console.log("result.response.statusCode", result.response.statusCode);

      if (result.response.statusCode === 201) {
        console.log(`${currency} 매도 완료`);
        availableBalance -= amountnum;
      } else {
        console.log(`${currency} 매도 실패`);
        mylog(`수량 : ${amountnum}, 가격 : ${pricenum}, 계산된 최소단위 : ${minPriceUnit}`, "production");
        console.log(result.body);
      }
    }
  }
}
