export function mylog(message: string, level : "debug" | "production") {
    if(process.env.NODE_ENV === "production" && level === "debug") {
        return;
    }
    console.log(message);
}