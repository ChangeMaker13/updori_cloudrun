export type OrderParams = {
  amount: number;
  price: number;
};

export type SellCoinsParams = {
  currency: string; // 화폐 단위(BTC, ETH, KRW 등)
  priceSettings: PriceSetting[];
};

export type PriceSetting = {
  amount: number; // 화폐 단위(BTC, ETH, KRW 등)
  price: number; // 판매 가격(10이면 현재 시세의 10% 높은 가격으로 판매)
};
