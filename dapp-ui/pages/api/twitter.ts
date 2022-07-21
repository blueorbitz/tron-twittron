import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from "next-auth/jwt";
import TwitterClient from '../../helpers/TwitterClient';
import HttpErrorHandler, { HttpError } from '../../helpers/HttpError';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  HttpErrorHandler(req, res, {
    postFn: async (body) => {
      const token = await getToken({ req, secret: process.env.NEXT_PUBLIC_SECRET });
      if (token == null)
        throw new HttpError('Unauthorize', 405);

      const twitter: any = token.twitter;
      const oauthToken = {
        access_token_key: twitter.oauth_token,
        access_token_secret: twitter.oauth_token_secret,
      };

      const t2client = TwitterClient.v2(oauthToken);
      const t2result = await t2client.get('users/by/username/' + body.handle);
      const recipientId = t2result.data.id;

      const t1client = TwitterClient.v1(oauthToken);
      const t1result = await t1client.post(
        "direct_messages/events/new",
        {
          event: {
            type: 'message_create',
            message_create: {
              target: {
                recipient_id: recipientId,
              },
              message_data: {
                text: `I have send you ${body.amount} ${body.symbol}.\nGo to ${process.env.NEXTAUTH_URL} to connnect your wallet and redeem it.`
              },
            },
          }
        },
      );

      return t1result;
    },
  });
}
