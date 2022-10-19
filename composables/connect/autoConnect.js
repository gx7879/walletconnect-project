import store from 'vuex'
import { connectWalletConnect } from './index'
export const autoConnect = () => {
  if (store.state.status) {
    if (localStorage.getItem('walletconnect') == null) {
      console.log('disconnected')
      console.log('disconnected')
      store.commit('setWalletStatus', false)
      store.commit('setWalletAddress', '')
      localStorage.removeItem('userState')
    }
    if (localStorage.getItem('walletconnect')) {
      ;(async () => {
        console.log('start')
        await connectWalletConnect()
      })()
    }
  }
}
// export default autoConnect
