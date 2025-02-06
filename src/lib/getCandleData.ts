import axios from "axios";
import { mylog } from "./logger.js";
import admin from "firebase-admin";

interface CandleData {
    market: string;
    candle_date_time_utc: string;
    candle_date_time_kst: string;
    opening_price: number;
    high_price: number;
    low_price: number;
    trade_price: number;
    timestamp: number;
    candle_acc_trade_price: number;
    candle_acc_trade_volume: number;
    prev_closing_price: number;
    change_price: number;
    change_rate: number;
}

// 캔들 데이터 캐시를 위한 Map
const candleCache = new Map<string, CandleData[]>();

async function getCandleData(
    market: string,
    date: string, // 'YYYY-MM-DD' 형식
): Promise<CandleData | null> {
    // 캐시 키 생성
    const cacheKey = `${market}-${date}`;
    
    // 캐시된 데이터 확인
    const cachedData = candleCache.get(market);
    if (cachedData) {
        const foundCandle = cachedData.find(candle => 
            candle.candle_date_time_utc.startsWith(date)
        );
        if (foundCandle) {
            return foundCandle;
        }
    }

    try {
        // 50ms 유예
        await new Promise(resolve => setTimeout(resolve, 100));

        // API 요청
        const response = await axios.get('https://api.upbit.com/v1/candles/days', {
            params: {
                'market': market,
                'to': `${date} 09:00:00`,
                'count': 100
            }
        });

        // API 응답 데이터 처리
        const candleData = response.data[0];
        
        // 캐시 업데이트
        if (!candleCache.has(market)) {
            candleCache.set(market, []);
        }
        candleCache.get(market)?.push(candleData);

        // 캐시 크기 제한 (예: 최대 1000개)
        if (candleCache.get(market)!.length > 1000) {
            candleCache.get(market)?.shift();
        }

        return candleData;
    } catch (error) {
        mylog(`캔들 데이터 조회 중 오류 발생: ${error}`, "production");
        return null;
    }
}

// 여러 날짜의 캔들 데이터를 한 번에 조회하는 함수
async function getCandleDataRange(
    market: string,
    startDate: string, // 'YYYY-MM-DD' 형식
    endDate: string    // 'YYYY-MM-DD' 형식
): Promise<CandleData[]> {
    try {
        const daysDiff = Math.ceil(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) 
            / (1000 * 60 * 60 * 24)
        );

        const response = await axios.get('https://api.upbit.com/v1/candles/days', {
            params: {
                'market': market,
                'to': `${endDate} 09:00:00`,
                'count': daysDiff + 1

            }
        });

        const candleData = response.data;
        
        // 캐시 업데이트
        if (!candleCache.has(market)) {
            candleCache.set(market, []);
        }
        candleCache.set(market, [...(candleCache.get(market) || []), ...candleData]);

        // 캐시 크기 제한
        if (candleCache.get(market)!.length > 1000) {
            const excess = candleCache.get(market)!.length - 1000;
            candleCache.get(market)?.splice(0, excess);
        }

        return candleData;
    } catch (error) {
        mylog(`캔들 데이터 범위 조회 중 오류 발생: ${error}`, "production");
        return [];
    }
}

// 사용 예시:
/*
// 단일 날짜 조회
const candleData = await getCandleData('KRW-BTC', '2024-02-06');

// 날짜 범위 조회
const candleDataRange = await getCandleDataRange('KRW-BTC', '2024-02-01', '2024-02-06');
*/

export { getCandleData, getCandleDataRange };