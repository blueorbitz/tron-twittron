import { ArrowReturnRight } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';

declare global {
  interface Window {
    tronWeb: any;
  }

  interface TwittronContract {
    transferFund(handle: string): any;
    receiptList10(handle: string, startIndex: number): any;
    releaseFund(id: number, handle: string): any;
    handleAddress(handle: string): any;
    updateHandleAddress(handle: string, walletAddress: string): any;
  }
}

const contractAddress: string = process.env.CONTRACT_ADDRESS || '';
let contractHandler: TwittronContract | null = null;

export function twitterHandle(session): string {
  // @ts-ignore
  return session && session.user && session.user.twitterHandle;
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
    && window.tronWeb.defaultAddress.base58
    && window.tronWeb.solidityNode.host === 'https://api.nileex.io';
}

export async function setContract() {
  contractHandler = await window.tronWeb.contract().at(contractAddress);
}

export async function transferFund(handle: string, amount: number): Promise<[string, any]> {
  if (contractHandler == null)
    await setContract();

  return await contractHandler?.transferFund(handle)
    .send({
      feeLimit: 100_000_000,
      callValue: window.tronWeb.toSun(amount),
      shouldPollResponse: true,
      keepTxID: true,
    });
}

export async function releaseFund(recieptId: number, handle: string): Promise<string> {
  if (contractHandler == null)
    await setContract();

  return await contractHandler?.releaseFund(recieptId, handle)
    .send({
      feeLimit: 100_000_000,
      shouldPollResponse: false,
    });
}

export async function handleAddress(handle: string): Promise<string> {
  if (contractHandler == null)
    await setContract();

  return await contractHandler?.handleAddress(handle)
    .call();
}

export async function updateHandleAddress(handle: string, walletAddress: string): Promise<any> {
  if (contractHandler == null)
    await setContract();

  return await contractHandler?.updateHandleAddress(handle, walletAddress)
    .send({
      feeLimit: 100_000_000,
      shouldPollResponse: false,
    }, process.env.OWNER_PRIVATE_KEY);
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

export function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
  toast.success('Text copied to clipboard');
}

export function extractErrorMessage(error) {
  let message: string = '';
  typeof error === 'string'
    ? message = error
    : message = error.message || error.error;
  return message;
}