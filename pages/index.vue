<template>
  <div>
    walletObj: {{ walletObj }}
    <div v-if="wallet.connected">
      <button
        class="border-2 border-blue-300 rounded px-3 py-1"
        @click="onConnect"
      >
        Connected
      </button>
      <h3>Address: {{ walletObj.address }}</h3>
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
import {
  providerOptions,
  USDT_CONTRACT_ADDRESS,
  NFT_CONTRACT_ADDRESS,
} from '@/web3/config'
import { getChainData } from '@/web3/tools'
// import UseWallet from '@/composables/wallet'
// const { onConnect } = UseWallet()
// import { CONTRACT_ADDRESS, providerOptions } from '@/web3/config'
const INITIAL_STATE = {
  // web3: null,
  // provider: null,
  address: '',
  connected: false,
  chainId: 5,
  networkId: 5,
}

export default {
  name: 'IndexPage',
  data() {
    return {
      wallet: INITIAL_STATE,
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
    walletObj({ $store }) {
      return $store.state.walletObj
    },
    usdtContract({ $store }) {
      const web3 = $store.state.web3
      return web3
        ? new web3.eth.Contract(USDT_ABI, USDT_CONTRACT_ADDRESS)
        : null
    },
    nftContract({ $store }) {
      const web3 = $store.state.web3
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
      network: getChainData(_this.wallet.chainId).network,
      cacheProvider: false,
      providerOptions,
    })
  },
  methods: {
    async onConnect() {
      try {
        const _this = this
        const provider = await _this.web3Modal.connect()

        await _this.subscribeProvider(provider)

        const web3 = new Web3(provider)
        const accounts = await web3.eth.getAccounts()

        const address = accounts[0]

        const networkId = await web3.eth.net.getId()

        const chainId = await web3.eth.getChainId() // 坑逼 注意版本 chainId

        // this.wallet.web3 = web3
        // this.wallet.provider = provider
        // this.wallet.connected = true
        // this.wallet.address = address
        // this.wallet.chainId = chainId
        // this.wallet.networkId = networkId
        this.wallet = {
          // web3,
          // provider,
          connected: true,
          address,
          chainId,
          networkId,
        }
        this.$store.commit('setWallet', _this.wallet)
        this.web3 = web3
        this.$store.commit('setWeb3', _this.web3)

        await _this.getAccountAssets()
      } catch (error) {
        console.log(error)
      }
    },
    subscribeProvider(provider) {
      const _this = this
      if (!provider.on) {
        return
      }
      // provider.on('disconnect', () => _this.disconnect())
      provider.on('accountsChanged', async (accounts) => {
        // eslint-disable-next-line prefer-destructuring
        this.$store.commit('setWallet', { address: accounts[0] })
        // _this.walletObj.address = accounts[0]
        await _this.getAccountAssets()
      })
      provider.on('chainChanged', async (chainId) => {
        console.log('333', chainId)
        const networkId = await _this.web3?.eth?.net.getId()
        _this.wallet.chainId = chainId
        _this.wallet.networkId = networkId
        this.$store.commit('setWallet', { chainId, networkId })
        await _this.getAccountAssets()
      })
    },
    async disconnect() {
      const _this = this
      // const { web3 } = this.wallet
      const web3 = this.web3
      if (web3 && web3.currentProvider && web3.currentProvider.close) {
        await web3.currentProvider.close()
      }

      this.web3Modal.clearCachedProvider()
      this.balance = 0
      Object.keys(INITIAL_STATE).forEach((e) => {
        _this.wallet[e] = INITIAL_STATE[e]
      })
      this.$store.commit('setWallet', { ...INITIAL_STATE })
    },
    async getAccountAssets() {
      const _this = this
      // get account balances

      this.balance = await _this.getUserBalance()
    },
    getUserBalance() {
      const _this = this
      return _this.web3.eth
        .getBalance(_this.wallet.address)
        .then((res) => (res ? utils.fromWei(res.toString(), 'ether') : 0))
    },
    async getBalanceOf() {
      const _this = this
      const balanceResult = await this.nftContract.methods
        .balanceOf(_this.wallet.address)
        .call()
      console.log(balanceResult)
    },
    async allowance() {
      const _this = this
      const result = await this.usdtContract.methods
        .allowance(_this.wallet.address, USDT_CONTRACT_ADDRESS)
        .call()
      console.log(result)
    },
    async usdtApprove() {
      const _this = this
      const result = await this.usdtContract.methods
        .approve(USDT_CONTRACT_ADDRESS, 750000000)
        .send({ from: _this.wallet.address })
      console.log(result)
    },
    async nftApprove() {
      const _this = this
      const result = await this.nftContract.methods
        .approve(NFT_CONTRACT_ADDRESS, 750000000)
        .send({ from: _this.wallet.address })
      console.log(result)
    },
    async basicMint() {
      const _this = this
      const result = await this.nftContract.methods
        .basicMint(1)
        .send({ from: _this.wallet.address })
      console.log(result)
    },
  },
}
</script>
