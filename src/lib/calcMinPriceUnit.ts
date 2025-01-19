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
      market == "ADA-KRW" ||
      market == "ALGO-KRW" ||
      market == "BLUR-KRW" ||
      market == "CELO-KRW" ||
      market == "ELF-KRW" ||
      market == "EOS-KRW" ||
      market == "GRS-KRW" ||
      market == "GRT-KRW" ||
      market == "ICX-KRW" ||
      market == "MANA-KRW" ||
      market == "MINA-KRW" ||
      market == "POL-KRW" ||
      market == "SAND-KRW" ||
      market == "SEI-KRW" ||
      market == "STG-KRW" ||
      market == "TRX-KRW"
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
