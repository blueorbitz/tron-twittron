/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    SOLIDITY_NODE: process.env.SOLIDITY_NODE,
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
  },
}

module.exports = nextConfig
