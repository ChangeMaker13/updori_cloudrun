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
import { getAccount } from "./getAccount.js";
import { getCurrentPrice } from "./getCurrentPrice.js";
import { calcMinPriceUnit } from "./calcMinPriceUnit.js";
import { PriceSetting, SellCoinsParams } from "../types.js";
const queryEncode = qs.encode;

import admin from "firebase-admin";
import { cancelAskOrders } from "./cancelAskOrders.js";
import { sellCoins } from "./sellcoins.js";
import { log } from "./logger.js";

const server_url = "https://api.upbit.com";

export async function sellRoutine(
  db: admin.firestore.Firestore,
  access_key: string,
  secret_key: string,
  sellSettingPath: string,
) {
  //sell setting의 부모 doc(users)알아내기
  //console.log(sellSettingPath);
  const sellSettingRef = db.doc(sellSettingPath);
  const sellSetting = await sellSettingRef.get();
  const sellSettingData = sellSetting.data();

  //console.log(sellSettingData);

  if(!sellSettingData?.pricesettings) {
    console.log("no pricesettings");
    return;
  }

  //console.log("2");
  //console.log(sellSettingData?.pricesettings);
  const pricesettings : PriceSetting[] = sellSettingData?.pricesettings;
  //console.log(pricesettings);

  const parentDocRef = sellSettingRef.parent.parent;
  const parentDoc = await parentDocRef!.get();
  const parentDocData = parentDoc.data();
  //console.log(parentDocData);

  //해당 부모 doc의 subcollection에서 조회(sellsettingref가 일치하는 문서)
  const scheduledTaskSubcollectionRef = parentDocRef!.collection("scheduledtask");
  //console.log("scheduledTaskSubcollectionRef: ", scheduledTaskSubcollectionRef.path);

  const coins = await scheduledTaskSubcollectionRef.where("sellsettingref", "==", sellSettingRef).get();
  //const coins = await scheduledTaskSubcollectionRef.get();
  log(`주문 취소 확인 대상 코인 목록 Coins: ${coins.docs.map(doc => doc.data().currency)}`, "debug");

  //해당 코인들에 대해서 이미 걸려있는 모든 매도 주문 삭제
  try{
    const cancelResult = await cancelAskOrders(access_key, secret_key, coins.docs.map(doc => `KRW-${doc.data().currency}`));
    log(`기존주문 취소 결과: ${cancelResult.body}`, "production");
    await new Promise((resolve) => setTimeout(resolve, 3000)); // 3초 대기
  }
  catch(e){
    log(`Error while cancelling ask orders: ${e}`, "production");
    throw new Error("Error while cancelling ask orders");
  }

  const sellCoinsParams : SellCoinsParams[] = coins.docs.map(doc => ({
    currency: doc.data().currency,
    priceSettings: pricesettings
  }));

  //console.log("sellCoinsParams: ", sellCoinsParams);

  //해당 코인들에 대해서 sell coins 함수 실행
  await sellCoins(access_key, secret_key, sellCoinsParams);

  //작업이 끝났다면 반복 여부에 따라서 문서 삭제할지 말지 결정
  if (!sellSettingData?.shouldrepeat) {
    coins.docs.forEach(doc => {
      console.log("반복 설정 안함에 따라 삭제함: ", doc.ref.path);
      doc.ref.delete();
    });
  }

  log(`sellRoutine 성공적으로 완료됨`, "production");
}