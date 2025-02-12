import axios from 'axios'
import { requestInterceptor, responseInterceptor } from './interceptors'

export const baseURL = import.meta.env.VITE_BASE_URL + '/v1'

/**
 * 请求实例
 * @description 已封装请求、响应拦截器，以及重复请求取消；
 * @description 设置headers['hide-message'] = true 隐藏message；
 * @description 设置headers['cancelable'] = false 请求不能被自动取消；
 */
const instance = axios.create({
  baseURL: baseURL,
  timeout: 1000 * 20,
  withCredentials: true,
})

// 请求拦截器1
requestInterceptor(instance)
// 请求拦截器2
responseInterceptor(instance)

export default instance
