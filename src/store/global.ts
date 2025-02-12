import { systemApi } from '@/services/api'
import { getRealUrl } from '@/utils/utils'
import { defineStore } from 'pinia'

export interface GlobalState {
  loading: boolean
  // loading配置
  loadingOptions: LoadingOptions
  systemInfo: any
}

// loading类型 global:全局加载  stair:二级路由页面加载  movers:三级路由页面加载
export type LoadingType = 'global' | 'stair' | 'movers'
export type LoadingOptions = {
  type?: LoadingType
  tip?: string
  delay?: number
}

const initLoadingOptions: LoadingOptions = { type: 'global', tip: '', delay: 0 }
export const useGlobalStore = defineStore('global', {
  state: () => {
    return {
      loading: false,
      loadingOptions: { ...initLoadingOptions },
      systemInfo: {},
    } as GlobalState
  },
  actions: {
    updateLoading(bool: boolean, options?: LoadingOptions) {
      this.loading = bool
      if (options) {
        this.loadingOptions = {
          ...this.loadingOptions,
          ...options,
        }
      }
      if (!bool) {
        this.loadingOptions = { ...initLoadingOptions }
      }
    },
    async getSystemInfo() {
      const { data } = await systemApi.getSystemInfo()
      data.logo = getRealUrl(data.systemLogo || '')
      this.systemInfo = data
    },
  },
  persist: {
    key: 'global-store',
    storage: window.localStorage,
    paths: ['systemInfo'],
  },
})
