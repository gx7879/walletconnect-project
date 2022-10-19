export const state = () => ({
  wallet: { address: '', chainId: '', balance: '' },
  status: false,
})

export const mutations = {
  setWallet(state, payload) {
    state.wallet.address = payload.address
    state.wallet.chainId = payload.chainId
    state.wallet.balance = payload.balance
  },
  setWalletStatus(state, payload) {
    state.status = payload
  },
}
