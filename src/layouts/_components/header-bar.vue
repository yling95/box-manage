<template>
  <header class="header">
    <div class="header-title">
      <div class="logo">
        <img :src="systemInfo?.logo" alt="" />
        <h2>{{ systemInfo?.systemName }}</h2>
      </div>
    </div>
    <div class="menu">
      <ul class="menu-list" :style="{ '--current': activeIndex }">
        <li
          class="menu-item"
          :class="[current.includes(item.path) && 'active']"
          :key="item.path"
          :data-index="index"
          v-for="(item, index) in menuList"
          @click="onMenuItem(item)"
        >
          <span>{{ item.name }}</span>
        </li>
      </ul>
    </div>

    <div class="ant-dropdown-link">
      <a-dropdown placement="bottomRight" @visible-change="onVisibleChange">
        <div class="round">{{ name }}</div>
        <template #overlay>
          <a-menu>
            <a-menu-item @click="handleUpdatePassword">修改密码</a-menu-item>
            <a-menu-item @click="handleLogout">退出登录</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </header>
  <updatePassword ref="updatePasswordRef" />
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMenuStore } from '@/store/menu'
import updatePassword from './update-password.vue'
import { useLogout, useClearCache } from '@/hooks/useUser'
import { SSE } from '@/utils/SSE'
import { info } from '@/utils/antd.util'
import { useUserStore } from '@/store/user'
import { message } from 'ant-design-vue'
import { getShortName, getShortPath } from '@/utils/utils'
import { useGlobalStore } from '@/store/global'
import { baseURL } from '@/request'
import { commonApi } from '@/services/api'
import { storeToRefs } from 'pinia'

// import taskListBar from './task-list-bar.vue'

const route = useRoute()
const router = useRouter()
const menuStore = useMenuStore()
const { token, userInfo } = useUserStore()
const globalStore = useGlobalStore()
const { systemInfo } = storeToRefs(globalStore)
const { updateLoading } = useGlobalStore()
const { menuList } = menuStore

// 用户名
const name = computed(() => getShortName(userInfo?.account, 1))

const defaultPath = getShortPath(route.path, 1)
const current = ref<string>(defaultPath)
const dropdownVisible = ref<boolean>(false)
const activeIndex = ref<number>(0)
const onMenuItem = (menu: any) => {
  updateLoading(true)
  router.push(menu.path as string)
  const timer = setTimeout(() => {
    updateLoading(false)
    clearTimeout(timer)
  }, 500)
}

// 获取当前路由的index
const getActiveIndex = (path: string) => {
  const index = menuList.findIndex((item) => item.path === path)
  return index >= 0 ? index : 0
}
activeIndex.value = getActiveIndex(current.value)

const onVisibleChange = (visible: boolean) => {
  dropdownVisible.value = visible
}

// 监听路由变化
watch(
  () => route.path,
  () => {
    current.value = getShortPath(route.path, 1)
    activeIndex.value = getActiveIndex(current.value)
  },
  { deep: true },
)

// 个人中心
const updatePasswordRef = ref<InstanceType<typeof updatePassword>>()
const handleUpdatePassword = () => {
  dropdownVisible.value = false
  updatePasswordRef.value?.show()
}

// 退出登录
const { logout } = useLogout()
const { clear } = useClearCache()
const handleLogout = () => {
  dropdownVisible.value = false
  sse.closeLink()
  logout()
}

// 账号被挤掉
const code3 = (text: string) => {
  info({
    title: text,
    onOk: () => {
      sse.closeLink()
      router.replace('/login')
    },
  })
}

// 权限更改
const code7 = (text: string) => {
  sse.closeLink()
  message.error(text)
  router.replace('/login')
  clear()
}

// 系统故障
const getCode16Message = (second: number) => {
  return `硬件故障，盒子将于${second}秒后重启`
}
const code16 = () => {
  let second = 60
  let timer: any
  let message = getCode16Message(second)

  const modal = info({
    title: message,
    onOk: () => {
      clearInterval(timer)
      sse.closeLink()
      router.replace('/login')
      clear()
    },
  })
  clearInterval(timer)
  timer = setInterval(() => {
    if (second === 1) {
      clearInterval(timer)
      modal.destroy()
      sse.closeLink()
      router.replace('/login')
      clear()
    }
    second--
    message = getCode16Message(second)
    modal.update({
      title: message,
    })
  }, 1000)
}

// SSE
const sse = new SSE({
  messageCb: (code: number, text: string) => {
    console.log('SSE====', code, text)

    if (code === -3) {
      code3(text)
    } else if (code === -7) {
      code7(text)
    } else if (code === -16) {
      code16()
    } else if (code === 1) {
      message.success(text)
    } else if (code === -22) {
      message.error(text)
    } else if (code === -23) {
      message.error(text)
    }
  },
})
// 建立连接
sse.selectAndLink(`${baseURL}/sse/connect?gToken=${token}`)

// sse心跳
let timer: any
// 心跳时间间隔
const gapTime = 1000 * 60
const heartBeat = () => {
  clearInterval(timer)
  timer = setInterval(() => {
    commonApi.heartbeat()
  }, gapTime)
}

onMounted(() => {
  localStorage.setItem('isOpenNewPage', Math.random().toString())
  commonApi.heartbeat()
  heartBeat()
})

onUnmounted(() => {
  sse.closeLink()
  clearInterval(timer)
})

// window.addEventListener('visibilitychange', () => {
//   if (document.visibilityState === 'visible') {
//     commonApi.heartbeat()
//     heartBeat()
//   } else {
//     clearInterval(timer)
//   }
// })

// 监听localStorage的变化 防止多个页面同时登录
window.addEventListener('storage', (e) => {
  if (e.key === 'isOpenNewPage') {
    sse.closeLink()
    clearInterval(timer)
    router.replace('/login')
  }
})

let _beforeUnload_time = 0,
  _gap_time = 0
window.onunload = function () {
  _gap_time = new Date().getTime() - _beforeUnload_time
  if (_gap_time <= 5) {
    // 浏览器关闭
    sse.closeLink()
    clearInterval(timer)
    navigator.sendBeacon(`${baseURL}/logout?gToken=${token}`)
    clear()
  }
}
window.onbeforeunload = function () {
  // 刷新或关闭页面都会执行，且先于onunload执行
  _beforeUnload_time = new Date().getTime()
}
</script>

<style lang="less" scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
  box-shadow: 0px 1px 3px rgba(37, 37, 45, 0.16);
  position: sticky;
  z-index: 1;
  position: relative;
  .header-title {
    width: 100%;
    height: 78px;
    position: absolute;
    top: 0;
    left: 0;
    background: url(../../assets/images/public/header_bgc.png) no-repeat;
    background-size: cover;
    display: flex;
    align-items: center;
    padding: 0 32px;
    .logo {
      display: flex;
      align-items: center;
      gap: 0 8px;
      transform: translateY(-10px);
      > img {
        width: 48px;
        height: 48px;
        object-fit: contain;
      }
      h2 {
        font-size: 17px;
        color: @text2;
      }
    }
  }

  .menu {
    position: absolute;
    left: 50%;
    transform: translate(-50%, 0);
    --max-width: 92;
    --x-gap: 42;

    .menu-list {
      display: flex;
      align-items: center;
      gap: 0 calc(var(--x-gap) * 1px);
      margin: 0;
      position: relative;
      user-select: none;

      .menu-item {
        border-radius: 6px;
        padding: 10px 14px;
        color: @text3;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        transition: all 500ms ease-out;
        .center();

        > span {
          position: relative;
          z-index: 1;
        }

        &:hover {
          background: @mask1;
        }

        &.active {
          color: @text1;
        }
      }
      &::after {
        content: '';
        width: 160px;
        height: 60px;
        position: absolute;
        background: url(../../assets/images/public/bgc_nav_guang.png) no-repeat;
        background-size: cover;
        color: @text1;
        font-weight: 400;
        left: calc((var(--max-width) * 1px + var(--x-gap) * 1px) * var(--current) - 34px);
        top: -8px;
        cursor: pointer;
        transition: left 500ms cubic-bezier(0, 0.89, 1, 1);
      }
    }

    // antd menu
    .ant-menu-horizontal {
      border-bottom: none;
    }
  }

  .ant-dropdown-link {
    width: 122px;
    height: 60px;
    display: flex;
    align-items: center;
    gap: 0 8px;
    cursor: pointer;
    margin-left: auto;
    background: url(../../assets/images/public/user_bgc.png) no-repeat;
    background-size: cover;
    position: relative;

    .round {
      width: 28px;
      height: 28px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #000;
      color: #adcdfc;
      background: url(../../assets/images/public/user_head_bgc.png) no-repeat center center;
      background-size: cover;
      font-size: 12px;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translateY(-50%);
      transition: all 500ms ease-out;
      &:hover {
        background: url(../../assets/images/public/user_head_bgc_hover.png) no-repeat;
        background-size: cover;
      }
    }
  }
}
</style>
