import store from 'vuex'
import { provider } from '@/walletConnect/provider'
export const disconnectWallet = async () => {
  await provider.disconnect()
  store.commit('setWalletStatus', false)
  store.commit('setWalletAddress', '')
  localStorage.removeItem('userState')
}
// export default disconnectWallet
