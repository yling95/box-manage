import { message } from '@/utils/antd.util'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useUserStore } from '@/store/user'
import router from '@/routes'
import { useClearCache } from '@/hooks/useUser'

// 请求拦截器
export const requestInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    function (config) {
      const userStore = useUserStore()
      if (userStore && userStore.token) {
        config.headers!['G-Token'] = userStore.token
      }
      CancelToken.addRequest(config)
      return config
    },
    function (error) {
      return Promise.reject(error)
    },
  )
}

// 响应拦截器
export const responseInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.response.use(
    function (response: AxiosResponse<any>) {
      const key: string = CancelToken.getKey(response.config)
      CancelToken.cencelRequest(key)
      // 正常状态
      if (response?.data?.code === 0) {
        return Promise.resolve(response.data)
      }
      // 流数据
      if (response.config.responseType === 'blob') {
        return Promise.resolve(response.data)
      }
      // 统一提示错误信息
      if (response.data.code === -1 && !response.config.headers['hide-message']) {
        message.error(response.data.message)
        return Promise.reject(response)
      }
      // 登录过期
      else if (response.data.code === -5) {
        const { clear } = useClearCache()
        message.error(response.data.message)
        router.replace('/login')
        clear()
        return Promise.reject(response)
      }
      // 返回错误信息，交给业务处理
      else {
        return Promise.reject(response)
      }
    },
    function (error) {
      // 网络请求错误处理
      if (error?.code === 'ERR_NETWORK') {
        message.error('网络链接异常，请检查网络')
      } else if (error?.code === 'ECONNABORTED') {
        message.error('网络请求超时')
      } else if (error?.code === 'ERR_CANCELED') {
        console.warn(`${error.message}请求已取消`)
      } else if (!error?.config?.headers['hide-message']) {
        message.error('服务端错误，请稍后刷新重试')
      }
      return Promise.reject(error)
    },
  )
}

// 取消请求
export class CancelToken {
  // 存储每个请求的标识
  static requestList = new Map()

  // 白名单（不进行取消请求） 请求方式-接口（例如：get-/menus）
  static whiteList: Array<string> = ['post-/ai/uniform', 'post-/ai/face/recognition']

  // 获取key
  static getKey(config: AxiosRequestConfig): string {
    return `${config.method}-${config.url}`
  }

  // 验证接口是否被加入白名单
  static verifyWhiteList(config: AxiosRequestConfig): boolean {
    const key: string = this.getKey(config)
    return this.whiteList.includes(key)
  }

  // 添加请求
  static addRequest(config: AxiosRequestConfig) {
    const key: string = this.getKey(config)
    if (this.whiteList.includes(key) || config?.headers!['cancelable'] === false) return
    config.cancelToken = new axios.CancelToken((cancel) => {
      // 若请求已存在（请求中）则取消上一次的请求
      if (this.requestList.has(key)) {
        // 取消上一次请求
        this.cencelRequest(key)
      } else if (!this.requestList.has(key) && !this.verifyWhiteList(config)) {
        // 请求不存在并且不在白名单
        this.requestList.set(key, cancel)
      }
    })
  }

  // 取消单个请求
  static cencelRequest(key: string) {
    if (this.requestList.has(key)) {
      // 取消请求
      this.requestList.get(key)(key)
      // 删除当前请求
      this.requestList.delete(key)
    }
  }

  // 取消全部请求
  static cencelAllRequest() {
    // 遍历请求列表 全部取消
    for (const [url, cancel] of this.requestList) {
      cancel(url)
    }
    this.requestList.clear()
  }
}
