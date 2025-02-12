<template>
  <div class="device-video-container">
    <ul class="device-video-list-wrap" :class="[isRail && 'rail', isFullscreen && 'fullscreen']">
      <template v-for="(item, index) in deviceList" :key="item?.deviceId">
        <li
          class="device-video-wrap"
          :style="railStyle(index)"
          :class="[`video-item${currentConfig?.screenType}`, item?.warningStatus && 'warn']"
          @dblclick="onDbClick(item)"
          v-if="item"
        >
          <!-- 视频 -->
          <g-video-spin :spinning="item.spinning">
            <video :id="`video${item.deviceId}`" class="video-item" autoplay muted />
            <img
              v-if="maskInfoStatus"
              :src="getRealUrl(getImgUrl('device/mask/', item.deviceId))"
              class="image-item"
              :onerror="(e: any) => imageErrorReplaceSrc(e)"
            />
          </g-video-spin>
          <!-- 操作 -->
          <div class="video-operation-button" v-if="!isFullscreen">
            <a-button
              type="text"
              class="alone-icon-button button-item"
              style="width: 30px; height: 30px"
              @click="handleClickFullVideo(item)"
            >
              <i class="iconfont icon-fullscreen-line"></i>
            </a-button>
            <a-button
              type="text"
              class="alone-icon-button button-item"
              style="width: 30px; height: 30px"
              @click="handleClickDevice(item)"
            >
              <i class="iconfont icon-close-line"></i>
            </a-button>
          </div>
          <!-- 设备名称 -->
          <div class="device-name">
            <p :title="`${StrFn(item.deviceConcatName, true)} - ${StrFn(item.deviceConcatName, false)}`">
              {{ StrFn(item.deviceConcatName, true) }} - {{ StrFn(item.deviceConcatName, false) }}
            </p>
          </div>
          <!-- AI数量 -->
          <a-tooltip placement="topRight">
            <template #title v-if="item?.deviceActiveSrvNames">
              <div class="tooltip-title">
                <spn>【已配置算法】</spn>
                <ul>
                  <li v-for="names in item?.deviceActiveSrvNamesV2.split('、')">{{ names }}</li>
                </ul>
              </div>
            </template>
            <div class="ai-num-wrap" @click="toConfiguration(item)">
              <img src="@/assets/images/public/icon_ai.png" alt="" />
              <span>{{ item?.deviceActiveSrvCountV2 }}</span>
            </div>
          </a-tooltip>
        </li>
        <li v-else class="device-video-wrap" :style="railStyle(index)">
          <div class="video-abnormal">
            <img src="@/assets/images/alarm/empty.png" />
            <div class="empty-description">未选择设备</div>
          </div>
        </li>
      </template>
      <!-- <canvas v-if="!fullVideo" id="gxAiMarkCanvas" class="gxAiMarkCanvas"></canvas> -->
    </ul>
    <div class="footer" v-if="!isFullscreen">
      <div class="footer-left">
        <a-tooltip title="单屏" :get-popup-container="(e) => (e.parentNode as HTMLElement)">
          <a-button
            type="text"
            class="alone-icon-button footer-button-item"
            :class="[currentConfig.screenType == 1 && 'active']"
            @click="handleClickChangeScreen(1)"
          >
            <i class="iconfont icon-Screen1-fill"></i>
          </a-button>
        </a-tooltip>
        <a-tooltip title="四屏" :get-popup-container="(e) => (e.parentNode as HTMLElement)">
          <a-button
            type="text"
            class="alone-icon-button footer-button-item"
            :class="[currentConfig.screenType == 2 && 'active']"
            @click="handleClickChangeScreen(2)"
          >
            <i class="iconfont icon-Screen4-fill"></i>
          </a-button>
        </a-tooltip>
        <a-tooltip title="九屏" :get-popup-container="(e) => (e.parentNode as HTMLElement)">
          <a-button
            type="text"
            class="alone-icon-button footer-button-item"
            :class="[currentConfig.screenType == 3 && 'active']"
            @click="handleClickChangeScreen(3)"
          >
            <i class="iconfont icon-Screen9-fill"></i>
          </a-button>
        </a-tooltip>
        <div class="footer-line"></div>
        <a-tooltip title="全屏" :get-popup-container="(e) => (e.parentNode as HTMLElement)">
          <a-button type="text" class="alone-icon-button footer-button-item" @click="fullscreenFn">
            <i class="iconfont icon-fullscreen-line"></i>
          </a-button>
        </a-tooltip>
        <a-tooltip title="大屏" :get-popup-container="(e) => (e.parentNode as HTMLElement)">
          <a-button type="text" class="alone-icon-button footer-button-item" @click="toDashBoard">
            <i class="iconfont icon-trend-fill"></i>
          </a-button>
        </a-tooltip>
      </div>
      <div class="footer-right">
        <!-- <div>
          <a-checkbox :checked="currentConfig.aiTagStatus" @change="handleChangeAi"> AI标记 </a-checkbox>
        </div> -->
        <div>
          <a-switch
            size="small"
            v-model:checked="currentConfig.inspectionStatus"
            @change="handleChangInspection(true)"
          ></a-switch>
          <span class="switch-text">智能巡检</span>
        </div>
        <div>
          <a-switch size="small" v-model:checked="maskInfoStatus" @change="handleChangMarkInfo"></a-switch>
          <span class="switch-text">识别区域</span>
          <!-- <a-checkbox :checked="maskInfoStatus" @change="handleChangMarkInfo"> 识别区域 </a-checkbox> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { JSWebrtc } from '@/utils/webtc'
import { useUserStore } from '@/store/user'
import { useGlobalStore } from '@/store/global'
import { warningApi } from '@/services/api'
import { message } from '@/utils/antd.util'
import { getRealUrl, getImgUrl, imageErrorReplaceSrc } from '@/utils/utils'
import { useRouter } from 'vue-router'
import { checkKey } from '@/directives/auth'

interface DeviceListProps {
  currentConfig?: any
  playerQueue: any[]
  isFullscreen?: boolean
}

const props = withDefaults(defineProps<DeviceListProps>(), {
  currentConfig: {
    inspectionStatus: false,
    screenType: 3,
    deviceIds: [],
  },
  isFullscreen: false,
})

const emits = defineEmits([
  'update:player-queue',
  'on-click-full-video',
  'on-click-device',
  'on-click-change-screen',
  'on-full-screen',
  'on-change-ai',
  'chang-inspection',
])

const router = useRouter()
const { userInfo, updateUserInfo } = useUserStore()
const { updateLoading } = useGlobalStore()

const emptyNums = computed(() => props.currentConfig.screenType ** 2 - props.currentConfig.deviceIds.length)
const deviceList = computed(() => {
  const nullArr = isRail.value ? [] : new Array(emptyNums.value).fill(null)
  return props.currentConfig?.deviceIds.concat(nullArr)
})
// 开关巡检
const handleChangInspection = (bool: boolean) => {
  emits('chang-inspection', bool)
}
// 渲染视频
const videoRender = (videoParams: any) => {
  nextTick(() => {
    const theVideo = document.getElementById(`video${videoParams.deviceId}`)
    //@ts-ignore
    let play = new JSWebrtc.Player(videoParams.deviceStreamingLocation, {
      video: theVideo,
      autoplay: true,
      onPlay: () => {
        videoParams.spinning = false
      },
    })
    emits('update:player-queue', [...props.playerQueue, { play, deviceId: videoParams.deviceId }])
  })
}

// 全屏查看视频
const handleClickFullVideo = (item: any) => {
  emits('on-click-full-video', item)
}

// 关闭视频
const handleClickDevice = (item: any) => {
  emits('on-click-device', item)
}

// 切换屏幕
const handleClickChangeScreen = (index: number) => {
  emits('on-click-change-screen', index)
}

// 跳转大屏
const toDashBoard = () => {
  updateLoading(true, { tip: '正在跳转大屏...' })
  const timer = setTimeout(() => {
    updateLoading(false)
    clearTimeout(timer)
    document.body.requestFullscreen()
    router.push('/dash-board')
  }, 500)
}

// 全屏
const fullscreenFn = () => {
  emits('on-full-screen')
}

// AI标记
// const handleChangeAi = () => {
//   emits('on-change-ai')
// }

// 跳转设备配置
const toConfiguration = (item: any) => {
  if (checkKey('equipment-management-equipment-edit')) {
    router.push(`/system-layout/equipment-management/configuration?id=${item.deviceId}`)
  } else {
    message.warning('暂无设备配置权限')
  }
}

// 识别区域
const maskInfoStatus = ref(userInfo.videoMaskingEnabled === 1)
const handleChangMarkInfo = async (value: any) => {
  console.log('切换识别区域', value)
  maskInfoStatus.value = value
  let videoMaskingEnabled = value ? 1 : 0
  try {
    await warningApi.updateMasking(videoMaskingEnabled)
    updateUserInfo({ ...userInfo, videoMaskingEnabled })
    message.success('操作成功')
  } catch (error) {
    maskInfoStatus.value = !value
    console.log(error)
  }
}

const StrFn = (str: string, position: boolean) => {
  let index = str.indexOf('-')
  if (position) {
    return str.substring(0, index)
  } else {
    return str.substring(index + 1)
  }
}

// 鼠标双击
const onDbClick = (item: any) => {
  emits('on-click-full-video', item)
}

/**
 * 6栏布局（用于显示AI标记）
 */
const isRail = ref(false)
const AREA_KEY = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']
const railStyle = (index: number) => {
  return isRail.value
    ? {
        'grid-area': AREA_KEY[index],
      }
    : {}
}

defineExpose({
  videoRender,
})
</script>

<style lang="less" scoped>
@import '../styles/index.less';
@count: v-bind('currentConfig.screenType');

:deep(.ant-switch-checked:focus) {
  box-shadow: none;
}
:deep(.ant-switch[aria-checked='false']) {
  background: #d9dadb;
}
.switch-text {
  font-size: 14px;
}
.device-video-container {
  flex: 1;
  height: 100%;
  border-radius: 8px;
  box-shadow: 0px 6px 20px 0px rgba(0, 0, 0, 0.1), 0px 2px 6px 0px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  &:has(.device-video-list-wrap.fullscreen) {
    border-radius: 0 !important;
  }

  .device-video-list-wrap {
    flex: 1;
    width: 100%;
    height: calc(100% - 48px);
    display: grid;
    grid-template-columns: repeat(@count, 1fr);
    grid-template-rows: repeat(@count, 1fr);
    padding: 8px;
    background: linear-gradient(180deg, #1d3c6f 0%, #16325f 5.21%, #122747 100%);
    &.fullscreen {
      padding: 0;
    }

    // 五栏布局
    &.rail {
      grid-template-areas:
        'a a b'
        'a a c'
        'd e f';
    }

    .device-video-wrap {
      width: 100%;
      height: 100%;
      overflow: hidden;
      border: 1px solid #0c1423;
      position: relative;

      &:hover {
        background-color: @mask2;
      }

      .video-item,
      .image-item {
        width: 100%;
        height: 100%;
        object-fit: fill;
        flex-shrink: 0;
      }

      .image-item {
        position: absolute;
        top: 0;
        left: 0;
      }

      &.warn {
        border: 1px solid @secondary1;
      }

      .ai-num-wrap {
        display: flex;
        width: 34px;
        height: 17px;
        border-radius: 3px;
        background: rgba(0, 0, 0, 0.85);
        color: @text2;
        justify-content: center;
        align-items: center;
        gap: 0 4px;
        font-size: 14px;
        position: absolute;
        right: 10px;
        bottom: 10px;
        cursor: pointer;

        > img {
          display: block;
          width: 14px;
          height: 11px;
        }

        > span {
          display: block;
          color: @secondary1;
          text-shadow: 0px 0px 8px @secondary1;
          font-size: 16px;
          font-family: D-DIN;
          font-weight: 700;
          line-height: 17px;
        }
      }

      .device-name {
        color: @text1;
        text-shadow: 0px 0px 3px rgba(2, 36, 59, 0.9);
        font-size: 12px;
        font-weight: 700;
        position: absolute;
        left: 10px;
        bottom: 10px;
        width: calc(100% - 70px);
        display: flex;
        cursor: pointer;
        > p {
          .ellipsis();
        }
      }

      &:hover {
        .video-operation-button {
          display: flex;
        }
      }

      .video-operation-button {
        position: absolute;
        display: none;
        gap: 0 12px;
        top: 6px;
        right: 6px;
        align-items: center;
        height: 42px;
        border-radius: 8px;
        background: rgba(19, 22, 26, 0.75);
        cursor: pointer;
        padding: 0 6px;
        .button-item {
          width: 42px;
          height: 28px;
          line-height: 28px;
          text-align: center;
          i {
            color: @text1;
          }
          position: relative;
          &:first-child {
            &::after {
              content: '';
              width: 1px;
              height: 16px;
              background-color: @mask5;
              position: absolute;
              right: -7px;
              top: 50%;
              transform: translateY(-50%);
            }
          }
        }
      }
    }
  }

  .footer {
    height: 48px;
    border-top: 1px solid @border2;
    background: linear-gradient(180deg, #203a63 0%, #0e203d 100%);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;

    .footer-right {
      display: flex;
      gap: 0 20px;
      position: relative;
      height: 100%;
      > div {
        color: #fff;
        display: flex;
        align-items: center;
        > span {
          margin-left: 8px;
        }
        z-index: 1;
      }
      &::after {
        content: '';
        width: 291px;
        height: 48px;
        background: url(../../../assets/images/alarm/video_footer_bgc.png) no-repeat;
        background-size: 100% 100%;
        position: absolute;
        right: 0;
        top: 0;
        z-index: 0;
      }
    }
    .footer-left {
      display: flex;
      align-items: center;
      gap: 0 12px;
      position: relative;
      height: 100%;

      .footer-button-item {
        width: 30px;
        height: 30px;
        color: @text3;
        position: relative;
        z-index: 1;
        > i {
          font-size: 18px;
          transform: translateY(1px);
        }

        &.active {
          color: @text1;
          border-radius: 6px;
          background: @mask4;
        }
      }

      .footer-line {
        width: 1px;
        height: 16px;
        background-color: rgba(255, 255, 255, 0.15);
      }
    }
  }
}

.tooltip-title {
  color: @text2;
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  > h6 {
    color: @text2;
    text-align: center;
  }
}
</style>
