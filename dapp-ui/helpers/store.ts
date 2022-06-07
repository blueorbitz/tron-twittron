import clientPromise from "./mongo";

interface TransactionRecord {
  handle: string;
  amount: number;
  sender: string;
  senderWallet: string;
  claimWallet?: string;
  timestamp: Date;
}

interface TransactionQuery {
  handle?: string;
  sender?: string;
  skip?: number;
  limit?: number;
}

export async function saveRecord(record: TransactionRecord): Promise<any> {
  const mclient = await clientPromise;
  const db = mclient.db(process.env.MONGODB_DB);

  const mresult = await db.collection(process.env.MONGODB_COLLECTION)
    .insertOne(record);
  
  return mresult;
}

export async function getRecords(query: TransactionQuery): Promise<any> {
  const mclient = await clientPromise;
  const db = mclient.db(process.env.MONGODB_DB);

  const results = await db.collection(process.env.MONGODB_COLLECTION)
    .find({ handle: query.handle, sender: query.sender })
    .sort({ timestamp: -1 })
    .skip(query.skip || 0)
    .limit(query.limit || 5)
    .toArray();

  return results;
}