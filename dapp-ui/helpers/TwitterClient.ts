import Twitter, { TwitterOptions } from 'twitter-lite';

export default class TwitterClient {
  static v1(options?: TwitterOptions) {
    return new Twitter(Object.assign({
      consumer_key: process.env.TWITTER_CONSUMER_KEY ?? '',
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET ?? '',
      access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    }, options));
  }

  static v2(options?: TwitterOptions) {
    return new Twitter(Object.assign({
      version: "2",
      extension: false,
      consumer_key: process.env.TWITTER_CONSUMER_KEY ?? '',
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET ?? '',
      access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    }, options));
  }
}