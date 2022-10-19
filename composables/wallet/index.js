import Web3, { utils } from 'web3'
import Web3Modal from 'web3modal'
import { getChainData } from '@/web3/tools'
import { providerOptions } from '@/web3/config'

const INITIAL_STATE = {
  web3: null,
  provider: null,
  userAddress: '',
  connected: false,
  chainId: 5,
  networkId: 5,
}
export default function UseWallet() {
  const walletObj = Object.assign({}, INITIAL_STATE)
  let fetching = false
  let balance = 0
  const web3Modal = new Web3Modal({
    theme: 'dark',
    network: getChainData(walletObj.chainId).network,
    cacheProvider: false,
    providerOptions,
  })
  // methods wallte.js
  const resetApp = async () => {
    const { web3 } = walletObj
    if (web3 && web3.currentProvider && web3.currentProvider.close) {
      await web3.currentProvider.close()
    }

    web3Modal.clearCachedProvider()
    balance = 0
    Object.keys(INITIAL_STATE).forEach((e) => {
      walletObj[e] = INITIAL_STATE[e]
    })
  }
  const getUserBalance = () =>
    walletObj.web3.eth
      .getBalance(walletObj.userAddress)
      .then((res) => (res ? utils.fromWei(res.toString(), 'ether') : 0))

  const getAccountAssets = async () => {
    fetching = true
    // get account balances

    balance = await getUserBalance()
  }
  const subscribeProvider = (provider) => {
    if (!provider.on) {
      return
    }
    provider.on('close', () => resetApp())
    provider.on('accountsChanged', async (accounts) => {
      // eslint-disable-next-line prefer-destructuring
      walletObj.userAddress = accounts[0]
      await getAccountAssets()
    })
    provider.on('chainChanged', async (chainId) => {
      console.log('333', chainId)
      const networkId = await walletObj?.web3?.eth?.net.getId()
      walletObj.chainId = chainId
      walletObj.networkId = networkId
      await getAccountAssets()
    })
  }

  const onConnect = async () => {
    const provider = await web3Modal.connect()

    await subscribeProvider(provider)

    const web3 = new Web3(provider)
    const accounts = await web3.eth.getAccounts()

    const address = accounts[0]

    const networkId = await web3.eth.net.getId()

    const chainId = await web3.eth.getChainId() // 坑逼 注意版本 chainId

    walletObj.web3 = web3
    walletObj.provider = provider
    walletObj.connected = true
    walletObj.userAddress = address
    walletObj.chainId = chainId
    walletObj.networkId = networkId
    await getAccountAssets()
  }

  return {
    ...walletObj,
    fetching,
    balance,
    resetApp,
    getAccountAssets,
    //
    web3Modal,
    // methods
    onConnect,
  }
}
