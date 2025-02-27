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
const queryEncode = qs.encode;

const server_url = "https://api.upbit.com";

export async function getCurrentPrices(markets: string): Promise<{ [key: string]: number }> {
  return new Promise((resolve, reject) => {
    const options = {
      method: "GET",
      url: server_url + "/v1/ticker",
      qs: { markets: markets },
    };

    request(options, (error, response, body) => {
      if (error) {
        reject(error);
      }
      const parsedBody = JSON.parse(body);
      //console.log(parsedBody);
      //console.log(response.statusCode);

      if(response.statusCode === 404) {
        //console.log("Currency not found");
        reject(new Error("Currency not found"));
        return;
      }

      const currentPrices: { [key: string]: number } = {};
      for (const item of parsedBody) {
        currentPrices[item.market] = item.trade_price;
      }
      resolve(currentPrices);
    });
  });
}
