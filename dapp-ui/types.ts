export interface TransactionRecord {
  _id?: string;
  handle: string;
  amount: number;
  sender: string;
  senderWallet: string;
  claimWallet?: string;
  timestamp: Date;
  twitter?: any; // data fetch back from twitter
}

export interface TransactionQuery {
  handle?: string;
  sender?: string;
  skip?: number;
  limit?: number;
}
