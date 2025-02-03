
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
    
        // 이미 해당 날짜에 로그 기록이 있는지 확인
        const now = new Date();
        const twelveHoursAgo = new Date(now.getTime() - (12 * 60 * 60 * 1000));
        const history = await db.doc(user_path).collection("history")
          .where("logtime", ">=", twelveHoursAgo)
          .where("logtime", "<=", now)
          .get();
    
        if(history.size > 0){
          await db.doc(user_path).collection("history").doc(history.docs[0].id).update({
            logtime : hist.logtime,
            currencies : hist.currencies
          });
        }
        else{
          await db.doc(user_path).collection("history").add({
            logtime : hist.logtime,
            currencies : hist.currencies
          });
        }
    
        return true;
      } catch (error) {
        throw new Error("logHistory error: " + error);
      }
}
