export const state = () => ({
  walletObj: { address: '', chainId: '', balance: '' },
  fetching: false,
})

export const mutations = {
  setWallet(state, payload) {
    // state.walletObj = payload
    Object.keys(payload).forEach((item) => {
      state.walletObj[item] = payload[item]
    })
  },
  setWalletStatus(state, payload) {
    state.status = payload
  },
}
