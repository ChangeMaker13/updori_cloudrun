//미체결 주문이 있는지 확인해보고 있으면 true, 없으면 false를 반환하는 함수
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
import querystring from "querystring";
import { mylog } from "./logger.js";
import { getCurrentPrices } from "./getCurrentPrices.js";
const queryEncode = qs.encode;

const server_url = "https://api.upbit.com";

export async function checkOpenOrder(access_key: string, secret_key: string, market: string): Promise<boolean> {
  try {
    const states = ['wait', 'watch'];
    const non_array_body = {
      market: market,
    };
    const array_body = {
      states: states,
    };
    const body = {
      ...non_array_body,
      ...array_body
    };

    const states_query = states.map(state => `states[]=${state}`).join('&');
    const query = queryEncode(non_array_body) + '&' + states_query;

    const hash = crypto.createHash('sha512');
    const queryHash = hash.update(query, 'utf-8').digest('hex');

    const payload = {
      access_key: access_key,
      nonce: uuidv4(),
      query_hash: queryHash,
      query_hash_alg: 'SHA512',
    };

    const token = sign(payload, secret_key);

    const options = {
      method: "GET", 
      url: server_url + "/v1/orders/open?" + query,
      headers: {Authorization: `Bearer ${token}`},
      json: body
    };

    return new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if (error) {
          mylog(`체결되지 않은 주문 조회 중 에러 발생: ${error}`, "production");
          reject(error);
        }
        
        // 미체결 주문이 있으면 true, 없으면 false 반환
        mylog(`미체결 주문 조회 결과: ${JSON.stringify(body)}`, "debug");
        resolve(body && body.length > 0);
      });
    });

  } catch (error) {
    mylog(`체결되지 않은 주문 조회 중 에러 발생: ${error}`, "production");
    throw error;
  }
}