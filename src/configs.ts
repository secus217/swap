import {Chain, getDefaultConfig} from "@rainbow-me/rainbowkit";

export const asdNetwork = {
  id: +import.meta.env.VITE_ASD_CHAIN_ID,
  name: 'BNB Chain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [`${import.meta.env.VITE_ASD_RPC_URL}`],
    },
  },
  blockExplorers: {
    default: { name: 'BNB Explorer', url: 'https://explorer.asdchain.io' },
  },
  testnet: true,
} as const satisfies Chain;


export const wagmiConfig = getDefaultConfig({
  appName: 'BNB',
  projectId: 'f47700e45c81d8b9ff877f8eb3f88de8dfsf',
  chains: [asdNetwork],
  ssr: false,
});