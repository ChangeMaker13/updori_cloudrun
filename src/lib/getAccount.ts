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

export async function getAccount(access_key: string, secret_key: string): Promise<{ response: any; body: any }> {
  return new Promise((resolve, reject) => {
    const payload = {
      access_key: access_key,
      nonce: uuidv4(),
    };

    const token = sign(payload, secret_key);

    const options = {
      method: "GET",
      url: server_url + "/v1/accounts",
      headers: { Authorization: `Bearer ${token}` },
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
