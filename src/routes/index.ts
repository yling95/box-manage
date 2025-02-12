import { NavigationGuardNext, RouteLocationNormalized, createRouter, createWebHashHistory } from 'vue-router'
import { routes } from './routes'
import { Menu, menuList } from './menu'
import { useMenuStore } from '@/store/menu'
import { useUserStore } from '@/store/user'
import { userApi } from '@/services/api'

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes,
})

router.beforeEach((to, from, next) => {
  const { token } = useUserStore()
  const { isUpdateMenu } = useMenuStore()
  const userStore = localStorage.getItem('user-store')
  // 1.判断路由是否需要校验权限（是否需要登录）
  if (!to.meta.auth) return next()
  // 2.判断是否已经登录
  if (userStore === null || !token) return next('/login')
  // 3.判断是否需要更新菜单
  if (isUpdateMenu) {
    // 加载菜单
    loadMenus(to, from, next)
  } else {
    // 校验路由
    checkRoutes(to, from, next)
  }
})

router.onError((error, to) => {
  if (error.message.includes('Failed to fetch dynamically imported module')) {
    localStorage.setItem('to-href', to.fullPath)
    window.location.reload()
  }
})

// 加载菜单
const loadMenus = async (_to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const { updateIsUpdateMenu, updateMenuList, updateAuthList, updateDefaultMenuLink, updateUrlList } = useMenuStore()
  try {
    const { data } = await userApi.getMenuList()
    const urlList = data.urlList
    const authList = data.codeList
    const allowList = generateMenus(menuList, urlList)
    const link = findUsableMenu(allowList)
    updateDefaultMenuLink(link)
    updateMenuList(allowList)
    updateUrlList(urlList)
    updateAuthList(authList)
    updateIsUpdateMenu(false)
    next({ path: link, replace: true })
  } catch (error) {
    console.error(error)
  }
}

// 查找该用户可用菜单链接，将其设置为默认跳转菜单
const findUsableMenu = (allowList: any[]): string => {
  if (allowList.length === 0) return '/403'
  if (allowList[0].children && allowList[0].children.length > 0) {
    return findUsableMenu(allowList[0].children)
  }
  return allowList[0].path as string
}

// 生成可用菜单
const generateMenus = (menuList: Menu[], urlList: string[]) => {
  const allowList: Menu[] = []
  menuList.forEach((menu) => {
    if (menu.children && menu.children.length > 0) {
      const children = generateMenus(menu.children, urlList)
      if (children.length > 0) allowList.push({ ...menu, children })
    } else {
      if (urlList.includes(menu.path) || !menu.auth) allowList.push({ ...menu })
    }
  })

  return allowList
}

// 校验路由
const checkRoutes = (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const { urlList } = useMenuStore()
  if (urlList.includes(to.path)) {
    next()
  } else {
    // next('/403')
    next()
  }
}

export default router
