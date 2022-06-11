import { NextApiRequest } from "next";
import { getToken } from "next-auth/jwt";
import { ObjectId } from "mongodb";
import clientPromise from "./mongo";
import TwitterClient from "./TwitterClient";
import { TransactionRecord, TransactionQuery, TwitterTokenOptions } from "../types";

export async function saveRecord(record: TransactionRecord): Promise<any> {
  const mclient = await clientPromise;
  const db = mclient.db(process.env.MONGODB_DB);

  const mresult = await db.collection(process.env.MONGODB_COLLECTION)
    .insertOne(record);
  
  return mresult;
}

export async function updateRecord(record: TransactionRecord): Promise<any> {
  const mclient = await clientPromise;
  const db = mclient.db(process.env.MONGODB_DB);

  const mresult = await db.collection(process.env.MONGODB_COLLECTION)
    .updateOne(
      { '_id': new ObjectId(record._id) },
      {
        $set: {
          claimTx: record.claimTx,
          claimWallet: record.claimWallet
        }
      }
    );
  return mresult;
}

export async function getRecords(query: TransactionQuery, req: NextApiRequest): Promise<any> {
  const mclient = await clientPromise;
  const db = mclient.db(process.env.MONGODB_DB);

  const _query: TransactionQuery = {};
  if (query.handle) _query.handle = query.handle;
  if (query.sender) _query.sender = query.sender;

  const results = await db.collection(process.env.MONGODB_COLLECTION)
    .find(_query)
    .sort({ timestamp: -1 })
    .skip(Number(query.skip) ?? 0)
    .limit(Number(query.limit) ?? 5)
    .toArray();

  // get twitter user details
  const uniqueHandle = results.map(o => o.handle)
    .filter((value, index, self) => self.indexOf(value) === index);
  console.log('getRecords twitter handle:', uniqueHandle);
  if (uniqueHandle.length === 0)
    return results;

  const token = await getToken({ req, secret: process.env.NEXT_PUBLIC_SECRET });
  // @ts-ignore
  const twitter: any = token.twitter;
  const client = TwitterClient.v2({
    access_token_key: twitter.oauth_token,
    access_token_secret: twitter.oauth_token_secret,
  });

  const tresults = await client.get('users/by', {
    'usernames': uniqueHandle.join(','),
    'user.fields': 'profile_image_url,verified',
  });

  const tuserMap = {};
  tresults.data.forEach(o => tuserMap[o.username] = o);

  return results.map((tx: TransactionRecord) => {
    return Object.assign(tx, { twitter: tuserMap[tx.handle] })
  });
}