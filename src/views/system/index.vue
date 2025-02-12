<template>
  <div class="system-layout">
    <aside class="system-layout-aside" v-if="!route.meta.secondPage">
      <a-menu class="system-layout-menu" mode="inline" :selectedKeys="current" @click="onMenuItem">
        <a-menu-item class="system-layout-menu-item" :key="item.path" v-for="item in list">
          <template #icon>
            <i class="iconfont" :class="item.icon"></i>
          </template>
          <template #title>Navigation One</template>
          <span class="menu-item-name">{{ item.name }}</span>
        </a-menu-item>
      </a-menu>
      <div class="box-info" @click="onOpenBoxInfo">关于盒子</div>
    </aside>
    <div class="system-layout-main">
      <router-view />
    </div>
  </div>
  <!-- 关于盒子 -->
  <g-modal width="460px" v-model:visible="visible" title="关于盒子" :footer="null">
    <div class="box-info-modal">
      <!-- <box-svg></box-svg> -->
      <!-- <logo-svg class="logo" font-size="204" /> -->
      <img class="logo" :src="logo" alt="" />
      <div class="box-info-modal-item">
        <div class="box-info-modal-item-label">处理器</div>
        <div class="box-info-modal-item-value">{{ boxInfo?.cpu || '--' }}</div>
      </div>
      <div class="box-info-modal-item">
        <div class="box-info-modal-item-label">操作系统</div>
        <div class="box-info-modal-item-value">{{ boxInfo?.os || '--' }}</div>
      </div>
      <div class="box-info-modal-item">
        <div class="box-info-modal-item-label">内存</div>
        <div class="box-info-modal-item-value">{{ boxInfo?.memory || '--' }}</div>
      </div>
      <div class="box-info-modal-item">
        <div class="box-info-modal-item-label">固态硬盘</div>
        <div class="box-info-modal-item-value">{{ boxInfo?.disk || '--' }}</div>
      </div>
      <div class="box-info-modal-item">
        <div class="box-info-modal-item-label">序列号</div>
        <div class="box-info-modal-item-value">{{ boxInfo?.serial || '--' }}</div>
      </div>
      <glasssix-svg class="glasssix"></glasssix-svg>
    </div>
  </g-modal>
</template>

<script setup lang="ts">
import { systemApi } from '@/services/api'
import { useMenuStore } from '@/store/menu'
import { getShortPath } from '@/utils/utils'
import { MenuInfo } from 'ant-design-vue/es/menu/src/interface'
import { computed, ref, watch } from 'vue'
import { useRequest } from 'vue-request'
import { useRoute, useRouter } from 'vue-router'

import logo from '@/assets/images/public/logo.png'
import GlasssixSvg from '@/assets/svg/glasssix.svg'

const route = useRoute()
const router = useRouter()
const current = ref<string[]>([getShortPath(route.path, 2)])
const onMenuItem = ({ key }: MenuInfo) => {
  router.push(key as string)
}
const { menuList } = useMenuStore()
const list = computed(() => {
  const parentList = menuList.find((item) => item.path === getShortPath(route.path, 1))
  if (parentList?.children && parentList?.children?.length > 0 && route.path === getShortPath(route.path, 1)) {
    current.value = [parentList?.children[0]?.path]
    router.replace(parentList?.children[0]?.path)
  }
  return parentList?.children || []
})

// 监听路由变化
watch(
  () => route.path,
  () => {
    current.value = [getShortPath(route.path, 2)]
  },
  { deep: true },
)

/**
 * 关于盒子
 */
const visible = ref<boolean>(false)
const boxInfo = ref<any>({})
const { runAsync: runGetBoxInfo } = useRequest(systemApi.getBoxInfo)
const onOpenBoxInfo = async () => {
  visible.value = true
  const { data } = await runGetBoxInfo()
  boxInfo.value = data
}
</script>

<style lang="less">
.system-layout {
  display: flex;
  width: 100%;
  height: 100%;
  border-radius: 0px 8px 8px 0px;

  .iconfont {
    font-size: 16px;
  }

  .system-layout-aside {
    display: flex;
    flex-direction: column;
    background: rgba(46, 75, 120, 0.3);
    backdrop-filter: blur(2px);
    padding: 16px 0;
    margin: 14px 0;
    border-radius: 0px 8px 8px 0px;

    .ant-menu-inline {
      border-right: none;
    }

    .system-layout-menu {
      width: 160px;
      flex: 1;
      background: transparent;
      padding: 0 8px;

      .system-layout-menu-item {
        width: 100%;
        margin: 16px auto;
        border-radius: 6px;
        color: @text3;
        font-size: 14px;
        border: 1px solid transparent;

        &:hover:not(.ant-menu-item-selected) {
          background-color: @mask1;
        }

        &.ant-menu-item-selected {
          color: @text2;
          background: @mask5;
          position: relative;

          &:focus-visible {
            border: transparent !important;
          }

          &::before {
            width: 10px;
            height: 36px;
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            background-size: cover;
          }

          // &::after {
          //   width: 2px;
          //   height: 16px;
          //   content: '';
          //   position: absolute;
          //   left: 0;
          //   top: 50%;
          //   transform: translateY(-50%);
          //   border-radius: 0px 2px 2px 0px;
          //   background: #f1c277;
          // }
        }

        &:first-child {
          margin-top: 0;
        }
      }

      .ant-menu-item {
        padding: 20px 16px !important;
      }

      .ant-menu-item .ant-menu-item-icon + span,
      .ant-menu-submenu-title .ant-menu-item-icon + span,
      .ant-menu-item .anticon + span,
      .ant-menu-submenu-title .anticon + span {
        margin-left: 10px;
      }
    }

    .box-info {
      width: 144px;
      height: 44px;
      border-top: 1px solid @border1;
      font-weight: 400;
      font-size: 12px;
      color: @text3;
      cursor: pointer;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.1);
      margin: 0 auto;
      .center();
    }
  }

  .system-layout-main {
    flex: 1;
  }
}

.box-info-modal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px 0;

  .box-img {
    width: 260px;
    height: 188.8px;
    text-align: center;
  }

  .logo {
    width: 204px;
    height: 22px;
    margin-bottom: 28px;
  }

  .box-info-modal-item {
    width: 100%;
    display: flex;
    gap: 0 24px;

    .box-info-modal-item-label {
      width: 50%;
      font-size: 14px;
      color: @text2;
      text-align: end;
    }

    .box-info-modal-item-value {
      width: 50%;
      font-size: 14px;
      color: @text1;
    }
  }

  .glasssix {
    margin: 46px 0 20px;
  }
}
</style>
