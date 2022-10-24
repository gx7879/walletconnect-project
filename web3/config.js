import WalletConnectProvider from '@walletconnect/web3-provider'

const USDT_CONTRACT_ADDRESS = '0x5894E7526B7a7dc14F16906855F14788E244D42D'
const NFT_CONTRACT_ADDRESS = '0xed9A3c81F5b57FdB4467fDB92ff936EF49bE587D'

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      // Mikko's test key - don't copy as your mileage may vary
      infuraId: '02822e1b3bdd472ab2aac2622e6486b5',
    },
  },
}

export { USDT_CONTRACT_ADDRESS, NFT_CONTRACT_ADDRESS, providerOptions }
