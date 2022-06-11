export interface TransactionRecord {
  _id?: string;
  txId: string;
  recieptId: number;
  handle: string;
  amount: number;
  sender: string;
  senderWallet: string;
  claimWallet?: string;
  claimTx?: string;
  timestamp: Date;
  twitter?: any; // data fetch back from twitter
}

export interface TransactionQuery {
  handle?: string;
  sender?: string;
  skip?: number;
  limit?: number;
}

export interface TwitterTokenOptions {
  access_token_key?: string;
  access_token_secret?: string;
}
