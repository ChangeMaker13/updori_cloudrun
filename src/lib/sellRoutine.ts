/***
 * 특정 sell setting 에 대한 프로세스 시작
 *
 *
 * ****/

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
import { SellCoinsParams } from "../types";
const queryEncode = qs.encode;

import admin from "firebase-admin";

const server_url = "https://api.upbit.com";

export async function sellRoutine(
  db: admin.firestore.Firestore,
  access_key: string,
  secret_key: string,
  sellSettingId: string,
) {
  //const sellSetting = await db.collection("sellsetting").doc(sellSettingId).get();
  //const sellSettingData = sellSetting.data();
  //console.log(sellSettingData);
  console.log("stub code");
}
