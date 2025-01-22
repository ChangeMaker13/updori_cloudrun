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
import { log } from "./logger.js";
const queryEncode = qs.encode;

const server_url = "https://api.upbit.com";

//주어진 코인 리스트들의 매도 주문을 일괄 취소합니다
export async function cancelAskOrders(
  access_key: string,
  secret_key: string,
  markets: string[],
): Promise<{ response: any; body: any }> {
  return new Promise(async (resolve, reject) => {
    const params = {
        pairs: markets.join(","),
        cancel_side : "ask"
    }

    log(`주문 취소 확인 대상 코인 목록 Params: ${JSON.stringify(params)}`, "production");

    const query = querystring.unescape(querystring.encode(params))

    const hash = crypto.createHash('sha512')
    const queryHash = hash.update(query, 'utf-8').digest('hex')

    const payload = {
        access_key: access_key,
        nonce: uuidv4(),
        query_hash: queryHash,
        query_hash_alg: 'SHA512',
    }

    const token = sign(payload, secret_key)

    const options = {
        method: "DELETE",
        url: server_url + "/v1/orders/open",
        headers: {Authorization: `Bearer ${token}`},
        qs: params
    }

    request(options, (error, response, body) => {
        if (error) throw new Error(error)
        resolve({
            response: response,
            body: body
        })
    })
  });
}

