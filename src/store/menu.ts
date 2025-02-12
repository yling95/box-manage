import { Menu } from '@/routes/menu'
import { defineStore } from 'pinia'

export interface MenuState {
  menuList: Menu[]
  isUpdateMenu: boolean
  urlList: string[]
  authList: string[]
  defaultMenuLink: string
}
export const useMenuStore = defineStore('menu', {
  state: () => {
    return {
      menuList: [],
      isUpdateMenu: false,
      urlList: [],
      authList: [],
      defaultMenuLink: '/',
    } as MenuState
  },
  actions: {
    updateMenuList(menus: Menu[]) {
      this.menuList = menus
    },
    updateIsUpdateMenu(value: boolean) {
      this.isUpdateMenu = value
    },
    updateAuthList(auths: string[]) {
      this.authList = auths
    },
    updateUrlList(urls: string[]) {
      this.urlList = urls
    },
    updateDefaultMenuLink(link: string) {
      this.defaultMenuLink = link
    },
  },
  persist: {
    key: 'menu-store',
    storage: window.localStorage,
  },
})
