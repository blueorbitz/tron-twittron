import { useState, useEffect } from 'react';
import { isTronWebConnected, walletAddress } from './utils';

interface TronWebHookResponse {
  isConnect: boolean;
  address: string;
}

export default function useTronWeb(): TronWebHookResponse {
  const [isConnect, setIsConnect] = useState(isTronWebConnected());
  const [address, setAddress] = useState(walletAddress());

  const tronLinkEventListener = (e: MessageEvent) => {
    switch (e.data.message && e.data.message.action) {
      case 'accountsChanged':
        console.log('accountsChanged', e.data.message.address);
        setAddress(walletAddress());
        break;
      case 'setNode':
        console.log('setNode', e.data.message.data.node);
        setIsConnect(isTronWebConnected());
        break;
      case 'disconnect':
        console.log('TronWeb disconnect');
        setIsConnect(false);
        break;
      case 'connect':
        console.log('TronWeb connected');
        setIsConnect(isTronWebConnected());
        break;
    }
  }

  useEffect(() => {
    globalThis.addEventListener('message', tronLinkEventListener);
    return () => {
      globalThis.removeEventListener('message', tronLinkEventListener);
    }
  }, []);

  return { isConnect, address };
}