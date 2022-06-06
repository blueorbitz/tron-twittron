import NextAuth from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';

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
      console.log('has valid token', token.twitter != null);
      return session;
    },

    async jwt({ token, user, account = {}, profile, isNewUser }) {
      if (account.provider && !token[account.provider])
        token[account.provider] = {};

      if (Object.keys(account).length !== 0)
        Object.assign(token, { twitter: account });

      return token;
    },
  }
});
