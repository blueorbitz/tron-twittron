declare global {
  interface Window { tronWeb: any; }
}

export function isTronWebConnected() {
  return typeof window !== "undefined"
    && window.tronWeb
    && window.tronWeb.defaultAddress.base58;
}
