import { userApi } from '@/services/api'
import { useGlobalStore } from '@/store/global'
import { useMenuStore } from '@/store/menu'
import { useUserStore } from '@/store/user'
import { useRouter } from 'vue-router'

// 退出登录
export const useLogout = () => {
  const { clear } = useClearCache()
  const router = useRouter()
  const logout = async () => {
    try {
      await userApi.logout()
      clear()
      router.replace('/login')
    } catch (error) {
      console.error(error)
    }
  }

  return {
    logout,
  }
}

// 清除缓存
export const useClearCache = () => {
  const menuStore = useMenuStore()
  const userInfoStore = useUserStore()
  const globalStore = useGlobalStore()
  const clear = () => {
    userInfoStore.$reset()
    menuStore.$reset()
    globalStore.$reset()
    // localStorage.clear()
    // sessionStorage.clear()
  }

  return {
    clear,
  }
}
