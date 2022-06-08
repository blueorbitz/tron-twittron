declare global {
  interface Window {
    tronWeb: any;
  }

  interface TwittronContract {
    transferFund(handle: string): any;
    receiptList10(handle: string, startIndex: number): any;
    releaseFund(id: number, handle: string): any;
  }
}

const contractAddress: string = process.env.CONTRACT_ADDRESS || '';
let contractHandler: TwittronContract | null = null;

export function twitterId(session): string {
  // @ts-ignore
  return session && session.user && session.user.twitterId;
}

export function walletAddress(): string {
  if (typeof window !== "undefined" && window.tronWeb)
    return window.tronWeb.defaultAddress.base58;
  else
    return '';
}

export function isTronWebConnected(): boolean {
  return typeof window !== "undefined"
    && window.tronWeb
    && window.tronWeb.defaultAddress.base58;
}

export async function setContract() {
  contractHandler = await window.tronWeb.contract().at(contractAddress);
}

export async function transferFund(handle: string, amount: number): Promise<void> {
  if (contractHandler == null)
    await setContract();

  await contractHandler?.transferFund(handle)
    .send({
      feeLimit: 100_000_000,
      callValue: window.tronWeb.toSun(amount),
      shouldPollResponse: true
    });
}

export function timeSince(date) {
  // @ts-ignore
  let seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " years";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes";
  }
  return Math.floor(seconds) + " seconds";
}