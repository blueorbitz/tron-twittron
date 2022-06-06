import Head from 'next/head';

export default function HtmlHeader() {
  return (
    <Head>
      <title>Twittron</title>
      <meta name="description" content="Connect TRX with twitter" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}