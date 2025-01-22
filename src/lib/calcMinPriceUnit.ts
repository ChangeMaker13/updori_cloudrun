export function calcMinPriceUnit(price: number, market: string): number {
  if (price >= 2000000) {
    return 1000;
  }
  if (price >= 1000000) {
    return 500;
  }
  if (price >= 500000) {
    return 100;
  }
  if (price >= 100000) {
    return 50;
  }
  if (price >= 10000) {
    return 10;
  }
  if (price >= 1000) {
    return 1;
  }
  if (price >= 100) {
    if (
      market == "KRW-ADA" ||
      market == "KRW-ALGO" ||
      market == "KRW-BLUR" ||
      market == "KRW-CELO" ||
      market == "KRW-ELF" ||
      market == "KRW-EOS" ||
      market == "KRW-GRS" ||
      market == "KRW-GRT" ||
      market == "KRW-ICX" ||
      market == "KRW-MANA" ||
      market == "KRW-MINA" ||
      market == "KRW-POL" ||
      market == "KRW-SAND" ||
      market == "KRW-SEI" ||
      market == "KRW-STG" ||
      market == "KRW-TRX"
    ) {
      return 1;
    }
    return 0.1;
  }
  if (price >= 10) {
    return 0.01;
  }
  if (price >= 1) {
    return 0.001;
  }
  if (price >= 0.1) {
    return 0.0001;
  }
  if (price >= 0.01) {
    return 0.00001;
  }
  if (price >= 0.001) {
    return 0.000001;
  }
  if (price >= 0.0001) {
    return 0.0000001;
  }

  return 1;
}
