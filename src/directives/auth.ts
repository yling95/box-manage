import { isAuth } from '@/config'
import { useMenuStore } from '@/store/menu'

export const checkKey = (key: string | string[]) => {
  const menuStore = useMenuStore()
  const authList = menuStore.authList || []

  if (!isAuth) return true
  if (key === '' || key.length === 0) return true
  if (typeof key === 'string' || typeof key === 'number') {
    return authList.includes(key)
  }
  return key.some((k) => authList.includes(k))
}

export default {
  /**
   * inserted：被绑定元素插入父节点时调用
   * el：指令所绑定的元素，可以用来直接操作 DOM
   * binding.value：指令的绑定值，例如：v-my-directive="1 + 1" 中，绑定值为 2。
   */
  mounted(el: HTMLElement, binding: any) {
    const authKey: string = binding.value
    // 代表某个元素需要通过权限验证
    if (authKey) {
      if (!checkKey(authKey)) {
        el.remove() //删除按钮
      }
    } else {
      throw new Error('缺少唯一指令')
    }
  },
}
