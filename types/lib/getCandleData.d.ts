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
declare function getCandleData(market: string, date: string): Promise<CandleData | null>;
declare function getCandleDataRange(market: string, startDate: string, endDate: string): Promise<CandleData[]>;
export { getCandleData, getCandleDataRange };
//# sourceMappingURL=getCandleData.d.ts.map