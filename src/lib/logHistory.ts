import jwt from "jsonwebtoken";
const { sign } = jwt;

import qs from "querystring";
const queryEncode = qs.encode;

import admin from "firebase-admin";
import { getAccount } from "./getAccount.js";

const server_url = "https://api.upbit.com";

/**
 * 보유 코인과 scheduledtask를 비교하여 자동 스케줄링하는 함수
 * 1. 보유하지 않은 코인의 스케줄 태스크 삭제
 * 2. 보유 중인 코인 중 스케줄 태스크에 없는 코인을 기본 설정으로 추가
 */
async function autoScheduleCoins(
  db: admin.firestore.Firestore, 
  user_path: string, 
  currencies: string[]
) {
  try {
    // 사용자의 scheduledtask 컬렉션 참조
    const scheduledTaskRef = db.doc(user_path).collection("scheduledtask");
    
    // 1. 보유하지 않은 코인의 스케줄 태스크 삭제
    const scheduledTasks = await scheduledTaskRef.get();
    
    // 삭제할 작업 배열
    const deletePromises: Promise<admin.firestore.WriteResult>[] = [];
    
    scheduledTasks.forEach(doc => {
      const scheduledCurrency = doc.data().currency;
      // 현재 보유 중이지 않은 코인이면 삭제
      if (!currencies.includes(scheduledCurrency)) {
        console.log(`삭제: 보유하지 않은 코인 ${scheduledCurrency}의 예약 작업`);
        deletePromises.push(doc.ref.delete());
      }
    });
    
    // 일괄 삭제 실행
    await Promise.all(deletePromises);
    
    // 2. default_setting이 true인 sellsetting 찾기
    const sellSettingsRef = db.doc(user_path).collection("sellsetting");
    const defaultSettingQuery = await sellSettingsRef.where("default_setting", "==", true).get();
    
    // default_setting이 없으면 함수 종료
    if (defaultSettingQuery.empty) {
      console.log("기본 설정(default_setting=true)이 없습니다.");
      return;
    }
    
    // 첫 번째 기본 설정 문서 가져오기
    const defaultSettingDoc = defaultSettingQuery.docs[0];
    
    // 3. 이미 스케줄된 코인 목록 가져오기
    const scheduledCurrencies: string[] = [];
    scheduledTasks.forEach(doc => {
      scheduledCurrencies.push(doc.data().currency);
    });
    
    // 4. 보유 중인 코인 중 스케줄되지 않은 코인에 대해 새 작업 추가
    const addPromises: Promise<admin.firestore.DocumentReference>[] = [];
    
    for (const currency of currencies) {
      // 이미 스케줄된 코인은 건너뛰기
      if (scheduledCurrencies.includes(currency)) continue;
      
      // KRW는 예약에서 제외 (한국 원화)
      if (currency === "KRW") continue;
      
      console.log(`추가: 보유 중인 코인 ${currency}에 기본 설정으로 예약 작업 생성`);
      
      // 새 scheduledtask 추가
      addPromises.push(
        scheduledTaskRef.add({
          currency: currency,
          sellsettingref: defaultSettingDoc.ref,
        })
      );
    }
    
    // 일괄 추가 실행
    await Promise.all(addPromises);
    
    console.log("자동 예약 설정이 완료되었습니다.");
    return true;
  } catch (error) {
    console.error("자동 예약 설정 중 오류 발생:", error);
    throw new Error("autoScheduleCoins error: " + error);
  }
}

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
          const existingCurrencies = history.docs[0].data().currencies;
          const newCurrencies = hist.currencies.filter(currency => !existingCurrencies.includes(currency));
          await db.doc(user_path).collection("history").doc(history.docs[0].id).update({
            logtime : startTime,
            currencies : [...existingCurrencies, ...newCurrencies]
          });
        }
        else{
          await db.doc(user_path).collection("history").add({
            logtime : startTime,
            currencies : hist.currencies
          });
        }
        
        // 자동 예약 기능 실행
        await autoScheduleCoins(db, user_path, hist.currencies);
    
        return true;
      } catch (error) {
        throw new Error("logHistory error: " + error);
      }
}
