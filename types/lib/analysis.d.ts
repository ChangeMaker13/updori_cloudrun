import admin from "firebase-admin";
export declare function analysis(db: admin.firestore.Firestore, access_key: string, secret_key: string, start_date: string, end_date: string, start_price: number, end_price: number, user_path: string): Promise<{
    headers: string[];
    rows: ExcelRow[];
}>;
interface ExcelRow {
    date: string;
    symbol: string;
    percentages: {
        [key: string]: number | null;
    };
}
export declare function formatExcelData(analysisResult: any[], start_price: number, end_price: number): Promise<{
    headers: string[];
    rows: ExcelRow[];
}>;
export {};
//# sourceMappingURL=analysis.d.ts.map