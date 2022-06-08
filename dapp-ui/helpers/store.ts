import { NextApiRequest } from "next";
import { getToken } from "next-auth/jwt";
import clientPromise from "./mongo";
import TwitterClient from "./TwitterClient";
import { TransactionRecord, TransactionQuery } from "../types";

export async function saveRecord(record: TransactionRecord): Promise<any> {
  const mclient = await clientPromise;
  const db = mclient.db(process.env.MONGODB_DB);

  const mresult = await db.collection(process.env.MONGODB_COLLECTION)
    .insertOne(record);
  
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
  const client = TwitterClient.v2({
    consumer_key: process.env.TWITTER_CONSUMER_KEY ?? '',
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET ?? '',
    // @ts-ignore
    access_token_key: token.twitter.oauth_token,
    // @ts-ignore
    access_token_secret: token.twitter.oauth_token_secret,
  });

  const tresults = await client.get('users/by', {
    'usernames': uniqueHandle.join(','),
    'user.fields': 'profile_image_url,verified',
  });

  const tuserMap = {};
  tresults.data.forEach(o => tuserMap[o.username] = o);

  return results.map((trx: TransactionRecord) => {
    return Object.assign(trx, { twitter: tuserMap[trx.handle] })
  });
}