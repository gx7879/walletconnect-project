import { providers } from 'ethers'
import store from 'vuex'
// import { provider } from '@/walletConnect/provider'
import WalletConnect from '@walletconnect/client'
import QRCodeModal from '@walletconnect/qrcode-modal'

export const connectWalletConnect = async () => {
  try {
    // await provider.enable()
    // bridge url
    const bridge = 'https://bridge.walletconnect.org'
    // Create a connector
    const connector = new WalletConnect({ bridge, qrcodeModal: QRCodeModal })

    if (!connector.connected) {
      // create new session
      connector.createSession()
    }
    console.log('222')
    const web3Provider = new providers.Web3Provider(connector)
    const signer = await web3Provider.getSigner()
    const address = await signer.getAddress()
    const chainId = await connector.request({ method: 'eth_chainId' })
    store.commit('setWalletStatus', true)
    store.commit('setWalletAddress', address)
    store.commit('setWalletChainId', chainId)

    // Subscribe to connection events
    connector.on('connect', (error, payload) => {
      if (error) {
        throw error
      }

      // Get provided accounts and chainId
      const { accounts, chainId } = payload.params[0]
      console.log(accounts, chainId)
    })

    connector.on('session_update', (error, payload) => {
      if (error) {
        throw error
      }

      // Get updated accounts and chainId
      const { accounts, chainId } = payload.params[0]
      console.log(accounts, chainId)
      if (accounts.length > 0) {
        store.commit('setWalletAddress', accounts[0])
      }
    })

    connector.on('disconnect', (error, payload) => {
      console.log(error, payload)
      store.commit('setWalletStatus', false)
      store.commit('setWalletAddress', '')
      localStorage.removeItem('userState')
      if (error) {
        throw error
      }
      // Delete connector
    })

    // provider.on('disconnect', (code, reason) => {
    //   console.log(code, reason)
    //   console.log('disconnected')
    //   store.commit('setWalletStatus', false)
    //   store.commit('setWalletAddress', '')
    //   localStorage.removeItem('userState')
    // })
    // provider.on('accountsChanged', (accounts) => {
    //   if (accounts.length > 0) {
    //     store.commit('setWalletAddress', accounts[0])
    //   }
    // })

    // provider.on('chainChanged', (chainId) => {
    //   store.commit('setWalletChainId', chainId)
    // })
  } catch (error) {
    console.log(error)
  }
}

// export default connectWalletConnect
