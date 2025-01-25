
export async function getKoreanNames() {
    const response = await fetch("https://api.upbit.com/v1/market/all");
    const data = await response.json();

    return data;
}
