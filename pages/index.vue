<template>
  <div>
    <div v-if="fetching">
      <!-- <button
        class="border-2 border-blue-300 rounded px-3 py-1"
        @click="connectUserWallet"
      >
        Connected
      </button> -->
      <button
        class="border-2 border-blue-300 rounded px-3 py-1"
        @click="onConnect"
      >
        Connected
      </button>
      <h3>Address: {{ walletObj.userAddress }}</h3>
      <h3>ChainId: {{ walletObj.chainId }}</h3>
      <h3>Balance: {{ balance }}</h3>
      <button
        class="border-2 border-red-300 rounded px-3 py-1"
        @click="disconnect"
      >
        Disconnect
      </button>
    </div>
    <button
      v-else
      class="border-2 border-blue-300 rounded px-3 py-1"
      @click="onConnect"
    >
      Connected
    </button>
    <template v-if="walletObj.web3">
      <button
        class="border-2 border-gray-300 rounded px-3 py-1"
        @click="getBalanceOf"
      >
        BalanceOf
      </button>
      <button
        class="border-2 border-gray-300 rounded px-3 py-1"
        @click="allowance"
      >
        allowance
      </button>
      <button
        class="border-2 border-gray-300 rounded px-3 py-1"
        @click="usdtApprove"
      >
        usdtApprove
      </button>
      <button
        class="border-2 border-gray-300 rounded px-3 py-1"
        @click="nftApprove"
      >
        nftApprove
      </button>
      <button
        class="border-2 border-gray-300 rounded px-3 py-1"
        @click="basicMint"
      >
        basicMint
      </button>
    </template>
  </div>
</template>

<script>
import Web3, { utils } from 'web3'
import Web3Modal from 'web3modal'
import { USDT_ABI, NFT_ABI } from '@/web3/abi'
import { providerOptions, USDT_CONTRACT_ADDRESS, NFT_CONTRACT_ADDRESS } from '@/web3/config'
import { getChainData } from '@/web3/tools'
// import UseWallet from '@/composables/wallet'
// const { onConnect } = UseWallet()
// import { CONTRACT_ADDRESS, providerOptions } from '@/web3/config'
const INITIAL_STATE = {
  web3: null,
  provider: null,
  userAddress: '',
  connected: false,
  chainId: 5,
  networkId: 5,
}

export default {
  name: 'IndexPage',
  data() {
    return {
      walletObj: Object.assign({}, INITIAL_STATE),
      fetching: false,
      balance: 0,
      web3: null,
      web3Modal: null,
      provider: null,
    }
  },
  computed: {
    // address({ $store }) {
    //   return $store.state.wallet.address
    // },
    // chainId({ $store }) {
    //   return $store.state.wallet.chainId
    // },
    // balance({ $store }) {
    //   return $store.state.wallet.balance
    // },
    // status({ $store }) {
    //   return $store.state.status
    // },
    usdtContract({ walletObj }) {
      const web3 = walletObj.web3
      console.log(walletObj)
      return web3 ? new web3.eth.Contract(USDT_ABI, USDT_CONTRACT_ADDRESS) : null
    },
    nftContract({ walletObj }) {
      const web3 = walletObj.web3
      console.log(walletObj)
      return web3 ? new web3.eth.Contract(NFT_ABI, NFT_CONTRACT_ADDRESS) : null
    },
  },
  mounted() {
    // this.web3Modal = new Web3Modal({
    //   // network: 'rinkeby',
    //   cacheProvider: false, // optional
    //   providerOptions, // required
    //   theme: 'dark',
    //   accentColor: 'blackWhite',
    // })
    const _this = this
    this.web3Modal = new Web3Modal({
      theme: 'dark',
      network: getChainData(_this.walletObj.chainId).network,
      cacheProvider: false,
      providerOptions,
    })
  },
  methods: {
    async onConnect() {
      const _this = this
      const provider = await _this.web3Modal.connect()

      await _this.subscribeProvider(provider)

      const web3 = new Web3(provider)
      const accounts = await web3.eth.getAccounts()

      const address = accounts[0]

      const networkId = await web3.eth.net.getId()

      const chainId = await web3.eth.getChainId() // 坑逼 注意版本 chainId

      this.walletObj.web3 = web3
      this.walletObj.provider = provider
      this.walletObj.connected = true
      this.walletObj.userAddress = address
      this.walletObj.chainId = chainId
      this.walletObj.networkId = networkId
      await _this.getAccountAssets()
    },
    subscribeProvider(provider) {
      const _this = this
      if (!provider.on) {
        return
      }
      provider.on('close', () => _this.disconnect())
      provider.on('accountsChanged', async (accounts) => {
        // eslint-disable-next-line prefer-destructuring
        _this.walletObj.userAddress = accounts[0]
        await _this.getAccountAssets()
      })
      provider.on('chainChanged', async (chainId) => {
        console.log('333', chainId)
        const networkId = await _this.walletObj?.web3?.eth?.net.getId()
        _this.walletObj.chainId = chainId
        _this.walletObj.networkId = networkId
        await _this.getAccountAssets()
      })
    },
    async disconnect() {
      const _this = this
      const { web3 } = this.walletObj
      if (web3 && web3.currentProvider && web3.currentProvider.close) {
        await web3.currentProvider.close()
      }

      this.web3Modal.clearCachedProvider()
      this.balance = 0
      Object.keys(INITIAL_STATE).forEach((e) => {
        _this.walletObj[e] = INITIAL_STATE[e]
      })
    },
    async getAccountAssets() {
      const _this = this
      this.fetching = true
      // get account balances

      this.balance = await _this.getUserBalance()
    },
    getUserBalance() {
      const _this = this
      return _this.walletObj.web3.eth
        .getBalance(_this.walletObj.userAddress)
        .then((res) => (res ? utils.fromWei(res.toString(), 'ether') : 0))
    },
    async getBalanceOf() {
      const _this = this
      const balanceResult = await this.nftContract.methods
        .balanceOf(_this.walletObj.userAddress)
        .call()
      console.log(balanceResult)
    },
    async allowance() {
      const _this = this
      const result = await this.usdtContract.methods
        .allowance(_this.walletObj.userAddress, USDT_CONTRACT_ADDRESS)
        .call()
      console.log(result)
    },
    async usdtApprove() {
      const _this = this
      const result = await this.usdtContract.methods
        .approve(USDT_CONTRACT_ADDRESS, 750000000)
        .send({ from: _this.walletObj.userAddress })
      console.log(result)
    },
    async nftApprove() {
      const _this = this
      const result = await this.nftContract.methods
        .approve(NFT_CONTRACT_ADDRESS, 750000000)
        .send({ from: _this.walletObj.userAddress })
      console.log(result)
    },
    async basicMint() {
      const _this = this
      const result = await this.nftContract.methods
        .basicMint(1)
        .send({ from: _this.walletObj.userAddress })
      console.log(result)
    },
  },
}
</script>
