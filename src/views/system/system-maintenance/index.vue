<template>
  <g-conf-module :show-page-tools="false" v-if="!route.meta.secondPage">
    <template #Slot-Conf-Module-Header>
      <div class="system-maintenance-layout">
        <header class="header">
          <h4>系统维护</h4>
          <div class="menu">
            <ul class="menu-list">
              <li
                class="menu-item"
                :class="[current.includes(item.path) && 'active']"
                :key="item.path"
                v-for="item in list"
                @click="onMenuItem(item)"
              >
                {{ item.name }}
              </li>
            </ul>
          </div>
        </header>
      </div>
    </template>
    <template #Slot-Conf-Module-Content v-if="!route.meta.customContent">
      <div class="system-maintenance-layout-main">
        <router-view></router-view>
      </div>
    </template>
    <template #Slot-Conf-custom-Module-Content v-else>
      <router-view></router-view>
    </template>
  </g-conf-module>

  <router-view v-else></router-view>
</template>

<script setup lang="ts">
import { useMenuStore } from '@/store/menu'
import { getShortPath } from '@/utils/utils'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
// import { cloneDeep } from 'g6-fn'

const { roleIsManager } = useUserStore()
const route = useRoute()
const router = useRouter()
const menuStore = useMenuStore()
const { menuList } = menuStore

const current = ref<string>(route.path)
const onMenuItem = (menu: any) => {
  router.push(menu.path as string)
}

// 数据回流迭代-迁移菜单栏到通用配置  暂时由前端隐藏菜单栏
const noShowMenu = [
  '/system-layout/system-maintenance/algo-auth', // "算法授权"
  '/system-layout/system-maintenance/push-configuration', //"推送配置"
  '/system-layout/system-maintenance/platform-access', //"平台接入"
  '/system-layout/system-maintenance/nvr-configuration', //"NVR配置"
  '/system-layout/system-maintenance/network-configuration', //"网络配置"
]
// 数据回流迭代-迁移菜单栏到通用配置  新增数据回流的菜单
const addMenuList = [
  {
    auth: true,
    icon: null,
    menuType: 0,
    name: '回流配置',
    path: '/system-layout/system-maintenance/reflux-config/list',
    sort: 1,
  },
  {
    auth: true,
    icon: null,
    menuType: 0,
    name: '数据回流',
    path: '/system-layout/system-maintenance/data-reflux',
    sort: 1,
  },
]

const list = computed(() => {
  const parentList = menuList
    .find((item) => item.path === getShortPath(route.path, 1))
    ?.children?.find((item) => item.path === getShortPath(route.path, 2))
  let currentMenu: any[] = []

  // 过滤已去掉的菜单
  if (parentList?.children && parentList?.children?.length > 0) {
    currentMenu = parentList?.children.filter((item: { path: string }) => !noShowMenu.includes(item.path))
  }
  // 首次进入 跳转第一个
  if (currentMenu?.length > 0 && route.path === getShortPath(route.path, 2)) {
    current.value = currentMenu[0]?.path
    router.replace(currentMenu[0]?.path)
  }
  // 管理员展示数据回流
  if (roleIsManager) {
    currentMenu.splice(2, 0, ...addMenuList)
  }
  return currentMenu
})

// 监听路由变化
watch(
  () => route.path,
  () => {
    current.value = route.path
  },
  { deep: true },
)
</script>

<style lang="less" scoped>
.system-maintenance-layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .header {
    display: flex;
    align-items: center;
    // padding: 24px 32px 6px;
    h4 {
      color: @text2;
      font-size: 22px;
      font-style: normal;
      font-weight: 700;
      line-height: 32px; /* 145.455% */
      margin: 0;
      margin-right: 32px;
    }
    .menu {
      .menu-list {
        display: flex;
        align-items: center;
        gap: 0 10px;

        .menu-item {
          border-radius: 6px;
          color: @text3;
          font-size: 14px;
          font-weight: 700;
          padding: 4px 12px;
          height: 30px;
          cursor: pointer;
          .center();

          &:hover {
            background: @mask1;
          }
          &.active {
            background: @mask4;
            color: @text2;
          }
        }
      }
    }
  }

  .system-maintenance-layout-main {
    flex: 1;
    overflow: auto;
  }
}
</style>
