This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

Rename `.env.local.sample` to `.env.local`.

Replace the parameter as by getting an access with Twitter Developer.
- Consumer = API key
- Client = OAuth2
- AccessToken = AccessToken (most likely not needed for now).

Choose your solidity node that you want your apps to run and insert the following related to the smart contract.
- SOLIDITY_NODE = eg. `https://api.shasta.trongrid.io`
- CONTRACT_ADDRESS = your compiled contract address
- OWNER_PRIVATE_KEY = private key that used to compile the contract.

Create a mongodb from the mongo atlas.
- MONGODB_URI = eg. `mongodb+srv://user:password@xxx.xxx.mongodb.net/xxx`
- MONGODB_DB = database name
- MONGODB_COLLECTION = collection name

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
