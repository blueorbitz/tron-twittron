import { AnyError } from 'mongodb';
import NextAuth from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';
import TwitterClient from '../../../helpers/TwitterClient';

export default NextAuth({
  secret: process.env.NEXT_PUBLIC_SECRET,
  providers: [
    TwitterProvider({
      // OAuth1.1
      clientId: process.env.TWITTER_CONSUMER_KEY || '',
      clientSecret: process.env.TWITTER_CONSUMER_SECRET || '',

      // OAuth2.0
      // clientId: process.env.TWITTER_CLIENT_ID || '',
      // clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
      // version: "2.0",
    })
  ],
  callbacks: {
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token from a provider.
      if (session && token.twitter) {
        const twitter: any = token.twitter;
        Object.assign(session.user ?? {}, {
          twitterId: twitter.providerAccountId,
          twitterHandle: twitter.username,
        });
      }

      return session;
    },

    async jwt({ token, user, account = {}, profile, isNewUser }: any) {
      if (account.provider && !token[account.provider])
        token[account.provider] = {};

      if (Object.keys(account).length !== 0) {
        const client = TwitterClient.v2({
          access_token_key: account.oauth_token,
          access_token_secret: account.oauth_token_secret,
        });
        const result = await client.get('users/' + token.sub);
        account.username = result.data.username;
        Object.assign(token, { twitter: account });
      }

      return token;
    },
  }
});
