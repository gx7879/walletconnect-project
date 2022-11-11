export const state = () => ({
  walletObj: {
    address: '',
    connected: false,
    chainId: 5,
    networkId: 5,
  },
})

export const mutations = {
  setWallet(state, payload) {
    state.walletObj = payload
  },
  setWeb3(state, payload) {
    state.web3 = payload
  }
}
