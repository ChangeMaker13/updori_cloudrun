
import jwt from "jsonwebtoken";
const { sign } = jwt;

import qs from "querystring";
const queryEncode = qs.encode;

import admin from "firebase-admin";
import { getAccount } from "./getAccount.js";

const server_url = "https://api.upbit.com";

export async function logHistory(db : admin.firestore.Firestore, access_key : string, secret_key : string, user_path : string){
    try {
        // 현재 시간과 보유중인 코인 리스트 가져오기
        const account = await getAccount(access_key, secret_key);
    
        const hist = {
          logtime : new Date(),
          currencies : [] as string[]
        }
    
        const parsedAccount = JSON.parse(account.body);
    
        for(const currency of parsedAccount){
          hist.currencies.push(currency.currency);
        }
    
        console.log(hist);
    
        // 현재 시간 기준으로 오늘의 오전 9시와 내일 오전 9시 계산
        // 현재 시간을 한국 시간으로 변환
        const now = new Date();
        const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC to KST

        // 한국 시간 기준 오늘의 오전 9시와 내일 오전 9시 계산
        const today9am = new Date(kstNow);
        today9am.setUTCHours(0, 0, 0, 0); // KST 09:00 = UTC 00:00
        
        const tomorrow9am = new Date(kstNow);
        tomorrow9am.setDate(tomorrow9am.getDate() + 1);
        tomorrow9am.setUTCHours(0, 0, 0, 0); // KST 09:00 = UTC 00:00

        // 현재 한국 시간이 오전 9시 이전이면 어제 9시부터 오늘 9시까지
        // 현재 한국 시간이 오전 9시 이후면 오늘 9시부터 내일 9시까지
        const startTime = kstNow.getHours() < 9 ? 
            new Date(today9am.getTime() - 24 * 60 * 60 * 1000) : today9am;
        const endTime = kstNow.getHours() < 9 ? today9am : tomorrow9am;

        // 해당 기간 내의 기록 확인
        const history = await db.doc(user_path).collection("history")
          .where("logtime", ">=", startTime)
          .where("logtime", "<=", endTime)
          .get();

        if(history.size > 0){
          await db.doc(user_path).collection("history").doc(history.docs[0].id).update({
            logtime : startTime,
            currencies : hist.currencies
          });
        }
        else{
          await db.doc(user_path).collection("history").add({
            logtime : startTime,
            currencies : hist.currencies
          });
        }
    
        return true;
      } catch (error) {
        throw new Error("logHistory error: " + error);
      }
}
