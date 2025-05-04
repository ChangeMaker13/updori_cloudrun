interface sellsetting {
    name: string;
    pricesettings: Array<pricesetting>;
    timesetting: timesetting;
    shouldrepeat: boolean;
    createdtime: Date;
    taskId: string;
    default_setting: boolean;
}
interface pricesetting {
    amount: number;
    price: number;
}
interface timesetting {
    hour: number;
    minute: number;
}
export default sellsetting;
//# sourceMappingURL=sellsetting.interface.d.ts.map