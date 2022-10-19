import WalletConnectProvider from '@walletconnect/web3-provider'

const CONTRACT_ADDRESS = '0xed9A3c81F5b57FdB4467fDB92ff936EF49bE587D'

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      // Mikko's test key - don't copy as your mileage may vary
      infuraId: '02822e1b3bdd472ab2aac2622e6486b5',
    },
  },
}

export { CONTRACT_ADDRESS, providerOptions }
