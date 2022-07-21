import { ArrowReturnRight } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';

declare global {
  interface Window {
    tronWeb: any;
  }

  interface TwittronContract {
    transferTrx(handle: string): any;
    transferTrc20(handle: string, contractAddress: string, amount: number): any;
    receiptList10(handle: string, startIndex: number): any;
    releaseFund(id: number, handle: string): any;
    handleAddress(handle: string): any;
    updateHandleAddress(handle: string, walletAddress: string): any;
  }
}

const contractAddress: string = process.env.CONTRACT_ADDRESS || '';
const solidityNode: string = process.env.SOLIDITY_NODE || '';
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
    && window.tronWeb.solidityNode.host === solidityNode;
}

export async function setContract() {
  contractHandler = await window.tronWeb.contract().at(contractAddress);
}

export async function transferTrx(handle: string, amount: number): Promise<string> {
  if (contractHandler == null)
    await setContract();

  return await contractHandler?.transferTrx(handle)
    .send({
      feeLimit: 500_000_000,
      callValue: window.tronWeb.toSun(amount),
      shouldPollResponse: false,
      keepTxID: true,
    });
}

export async function approveTrc20(trc20ContractAddress: string, amount: number): Promise<any> {
  const contract = await window.tronWeb.contract().at(trc20ContractAddress);

  return await contract.approve(contractAddress, amount)
    .send({ feeLimit: 100_000_000 });
}

export async function transferTrc20(handle: string, trc20ContractAddress: string, amount: number): Promise<string> {
  if (contractHandler == null)
    await setContract();

  return await contractHandler?.transferTrc20(handle, trc20ContractAddress, amount)
    .send({
      feeLimit: 500_000_000,
      callValue: 0,
      shouldPollResponse: false,
      keepTxID: true,
    });
}

export async function getTransactionInfo(txId: string, shouldPollResponse: boolean = false): Promise<any> {
  return new Promise((resolve, reject) => {
    let i = 0, response;
    const timerId = setInterval(async () => {
      response = await window.tronWeb.trx.getTransactionInfo(txId);
      if (shouldPollResponse && response.id == null && i < 90) { // max poll 90 sec
        i++;
      } else {
        clearInterval(timerId);
        resolve(response);
      }
    }, 1000);
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

export function debounce(func, timeout = 1000){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    // @ts-ignore
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}
