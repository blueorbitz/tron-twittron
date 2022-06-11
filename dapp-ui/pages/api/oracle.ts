import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from "next-auth/jwt";
import TronWeb from 'tronweb';
import HttpErrorHandler, { HttpError } from '../../helpers/HttpError';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  HttpErrorHandler(req, res, {
    postFn: async (body) => {
      const token = await getToken({ req, secret: process.env.NEXT_PUBLIC_SECRET });
      if (token == null)
        throw new HttpError('Unauthorize', 405);

      const tronWeb = new TronWeb({
        fullHost: 'https://api.nileex.io',
        privateKey: process.env.OWNER_PRIVATE_KEY,
      });
      const contractHandler = await tronWeb.contract().at(process.env.CONTRACT_ADDRESS);
      
      // @ts-ignore
      const handle = token.twitter.username;
      const result = await contractHandler?.updateHandleAddress(handle, body.wallet)
        .send({
          feeLimit: 100_000_000,
          shouldPollResponse: false,
        }, process.env.OWNER_PRIVATE_KEY);

      return result;
    },
  });
}
