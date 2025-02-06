import axios from "axios";
import { mylog } from "./logger.js";
import admin from "firebase-admin";
import { getCandleData } from "./getCandleData.js";
import { getKoreanNames } from "./getKoreanNames.js";

export async function analysis(
    db : admin.firestore.Firestore,
    access_key: string,
    secret_key: string,
    start_date: string,
    end_date: string,
    start_price: number,
    end_price: number,
    user_path: string
  ) {
    const result: any[] = [];

    const koreanNames = await getKoreanNames();
    const koreanNamesMap = new Map(koreanNames.map((item: any) => [item.market, item.korean_name]));

    try {
        //users/history 컬렉션에서 logtime을 이용해 최근 6개월 간의 데이터를 가져온다

        const history = await db.doc(user_path).collection("history").orderBy("logtime", "desc").limit(180).get();

        for(const doc of history.docs) {
            const data = doc.data();
            const currencies = data.currencies;
            const logtime = data.logtime;
            const logtimeDate = new Date(logtime._seconds * 1000);
            const formattedLogtime = `${logtimeDate.getFullYear()}-${(logtimeDate.getMonth() + 1).toString().padStart(2, '0')}-${logtimeDate.getDate().toString().padStart(2, '0')}`;
            //console.log(currencies, formattedLogtime);

            const logtimeYear = logtimeDate.getFullYear();
            const logtimeMonth = logtimeDate.getMonth() + 1;
            const logtimeDay = logtimeDate.getDate();

            const startDate = new Date(start_date);
            const endDate = new Date(end_date);

            const startYear = startDate.getFullYear();
            const startMonth = startDate.getMonth() + 1;
            const startDay = startDate.getDate();

            const endYear = endDate.getFullYear();
            const endMonth = endDate.getMonth() + 1;
            const endDay = endDate.getDate();

            const isWithinRange = (logtimeYear > startYear || (logtimeYear === startYear && (logtimeMonth > startMonth || (logtimeMonth === startMonth && logtimeDay >= startDay)))) &&
                                  (logtimeYear < endYear || (logtimeYear === endYear && (logtimeMonth < endMonth || (logtimeMonth === endMonth && logtimeDay <= endDay))));

            if (!isWithinRange) {
                continue;
            }

            for (const currency of currencies) {
                //console.log(`Currency: ${currency}`);
                if(currency === "KRW") {
                    continue;
                }
                const candleData = await getCandleData(`KRW-${currency}`, formattedLogtime);  

                if(candleData === null) {
                    continue;
                }

                const openPrice = candleData.opening_price;
                const highPrice = candleData.high_price;
                const priceIncrease = ((highPrice - openPrice) / openPrice) * 100;
                
                result.push({
                    month: logtimeDate.getMonth() + 1,
                    day: logtimeDate.getDate(),

                    symbol: currency,
                    name: koreanNamesMap.get(`KRW-${currency}`) || currency,
                    percentage: Math.floor(priceIncrease)
                });

                
            }
        }
        const excelData = await formatExcelData(result, Number(start_price), Number(end_price));
        //console.log(JSON.stringify(excelData, null, 2));

        return excelData;

    } catch (error) {
      mylog(`분석 중 오류 발생: ${error}`, "production");
      throw new Error("분석 중 오류가 발생했습니다");
    }
  }

  interface ExcelRow {
    date: string;
    symbol: string;
    percentages: { [key: string]: number | null };
  }
  
  export async function formatExcelData(
    analysisResult: any[], 
    start_price: number, 
    end_price: number
  ) {
    // 데이터를 날짜와 심볼로 그룹화
    const groupedData = analysisResult.reduce((acc: { [key: string]: { [key: string]: Set<number> } }, curr) => {
      const dateKey = `${curr.month}월${curr.day}일`;
      const symbolKey = curr.name;
      
      if (!acc[dateKey]) {
        acc[dateKey] = {};
      }
      if (!acc[dateKey][symbolKey]) {
        acc[dateKey][symbolKey] = new Set();
      }
      
      acc[dateKey][symbolKey].add(curr.percentage);
      return acc;
    }, {});
  
    // 동적으로 헤더 생성
    const headers = ['날짜', '종목'];
    for (let i = start_price; i <= end_price; i++) {
      headers.push(`${i}%`);
    }
    
    const excelData = {
      headers,
      rows: [] as ExcelRow[]
    };
  
    // 그룹화된 데이터를 행 데이터로 변환
    Object.entries(groupedData).forEach(([date, symbols]) => {
      Object.entries(symbols).forEach(([symbol, percentages]) => {
        const row: ExcelRow = {
          date,
          symbol,
          percentages: {}
        };

        const high = Math.max(...percentages);
  
        // start_price부터 end_price까지 퍼센트 데이터 구성
        for (let i = start_price; i <= end_price; i++) {
          const key = `${i}%`;
          row.percentages[key] = i <= high ? i : null;
        }

        excelData.rows.push(row);
      });
    });

    // 날짜를 역순으로 재정렬
    excelData.rows.sort((a, b) => {
      const dateA = new Date(a.date.replace('월', '-').replace('일', ''));
      const dateB = new Date(b.date.replace('월', '-').replace('일', ''));
      return dateA.getTime() - dateB.getTime();
    });


    // 합계 행 추가
    const totalRow: ExcelRow = {
      date: '합계',
      symbol: '',
      percentages: {}
    };

    // 각 퍼센트 열에 대한 합계 계산
    for (let i = start_price; i <= end_price; i++) {
      const key = `${i}%`;
      totalRow.percentages[key] = excelData.rows.reduce((sum, row) => {
        const value = row.percentages[key];
        const parsedValue = typeof value === 'string' ? parseFloat(value) : value;
        return sum + (parsedValue || 0);
      }, 0);
    }

    excelData.rows.push(totalRow);

    //console.log(excelData);
  
    return excelData;
  }