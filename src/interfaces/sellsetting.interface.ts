//users/sellsetting
interface sellsetting {
    name: string;
    pricesettings: Array<pricesetting>;
    timesetting: timesetting;
    shouldrepeat: boolean;
    createdtime: Date;
    taskId: string;
    default_setting: boolean;
}

// pricesetting 타입도 필요합니다
interface pricesetting {
    amount : number;
    price : number;
}

// timesetting 타입도 필요합니다
interface timesetting {
    hour : number;
    minute : number;
}

export default sellsetting;