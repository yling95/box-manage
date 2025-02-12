import { defineStore } from 'pinia'

export interface UserState {
  userInfo: any
  token: string
  remember: boolean
  roleIsManager: boolean
}
const managerRoleIdArr = [1, 2] // 超管1 管理员2
export const useUserStore = defineStore('user', {
  state: () => {
    return {
      userInfo: null,
      token: '',
      remember: false,
      roleIsManager: false, // 当前角色是否是管理员
    } as UserState
  },
  actions: {
    updateUserInfo(info: any) {
      this.userInfo = info
      this.roleIsManager = managerRoleIdArr.includes(info.roleId)
    },
    updateToken(value: string) {
      this.token = value
    },
    updateRemember(value: boolean) {
      this.remember = value
    },
  },
  persist: {
    key: 'user-store',
    storage: window.localStorage,
  },
})
