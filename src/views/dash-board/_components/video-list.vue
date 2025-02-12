<template>
  <div class="video-list-wrap">
    <ul class="video-list">
      <template v-for="item in currentConfig?.deviceIds" :key="item?.deviceId">
        <li class="video-list-item" v-if="item">
          <g-video-spin :spinning="item.spinning">
            <div class="operation">
              <video :id="`video${item.deviceId}`" class="video-item" autoplay muted />
            </div>
            <div v-show="item.warningStatus" class="operation-border" />
          </g-video-spin>

          <div class="operation-location">
            <div class="location-locationName">{{ StrFn(item.deviceConcatName, true) }}</div>
            <div>-</div>
            <div class="location-deviceName">{{ StrFn(item.deviceConcatName, false) }}</div>
          </div>
          <div class="operation-aiDevice" :class="[item.deviceActiveSrvCount === 0 && 'operation-empty']">
            <img src="@/assets/images/public/icon_ai.png" alt="" />
            <span class="title-type-number">{{ item.deviceActiveSrvCount }}</span>
          </div>
        </li>
      </template>
      <div class="video-list-item" v-for="item in emptyNums" :key="item">
        <div class="video-empty">
          <div class="empty-image">
            <img src="@/assets/images/alarm/empty.png" />
            <div class="empty-description">未选择设备</div>
          </div>
        </div>
      </div>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { SSE } from '@/utils/SSE'
import { AlarmCenterListProps, ArrayRecords, currentConfigProps, deviceListProps } from '@/views/alarm-center/interface'
import { computed, nextTick, onUnmounted, ref } from 'vue'
import { baseURL } from '@/request'
import { JSWebrtc } from '@/utils/webtc'
import { useRequest } from 'vue-request'
import { warningApi } from '@/services/api'

const { token } = useUserStore()

let currentViewCount = 0
const currentConfig = ref<currentConfigProps>({
  aiTagStatus: false,
  deviceIds: [],
  id: 0,
  inspectionStatus: false,
  screenType: 0,
  userId: 0,
  warningStatus: false,
})
const { data: currentData, runAsync: runUpdateCurrentConfig } = useRequest(warningApi.getWarningToken)
const getWarningTokenFn = async () => {
  await runUpdateCurrentConfig()
  await closeVideoAll()
  currentConfig.value = currentData?.value?.data
  findDeviceIds()
  nextTick(() => {
    const deviceIdArr = currentConfig.value.deviceIds
    for (const videoItem of deviceIdArr) {
      videoRender(videoItem)
    }
    if (currentConfig.value.inspectionStatus) {
      handleChangInspection(false)
    }
  })
}

// 初始化获取当前选中的设备
const findDeviceIds = () => {
  const deviceMenuList = deviceMenuData.value
  const deviceIds = currentConfig.value.deviceIds
  const deviceIdArr = []
  for (const deviceItem of deviceMenuList) {
    for (const devices of deviceItem.deviceAlarmCenterList) {
      if (deviceIds.includes(devices.deviceId)) {
        deviceIdArr.push({ ...devices, ...{ spinning: true, locationName: deviceItem.deviceLocationName } })
      }
    }
  }
  currentConfig.value.deviceIds = deviceIdArr
}

/**
 * 获取设备列表数据
 */
const deviceMenuData = ref<Array<deviceListProps>>([])
const deviceMenuFlatData = ref<AlarmCenterListProps[]>([])
const getWarningManagementFn = async (flag: boolean) => {
  try {
    let { data } = await warningApi.getWarningManagement()
    deviceMenuData.value = data
    deviceMenuData.value.forEach((item) =>
      item.deviceAlarmCenterList.forEach((item) => deviceMenuFlatData.value.push(item)),
    )
    if (!flag) return
    getWarningTokenFn()
  } catch (error) {
    console.log('error', error)
  }
}

const videoSSE = new SSE({
  messageCb: (code: number, _message: string, data: any) => {
    if (code != 0) return
    if (!data) return (currentConfig.value.deviceIds[currentViewCount] = null)
    if (!data.warningStatus) {
      const flag = currentConfig.value.deviceIds.find((obj: ArrayRecords) => obj?.deviceId == data.deviceId)
      if (flag) {
        flag.warningStatus = data.warningStatus
      }
    }
    //重复不取消
    if (currentConfig.value.deviceIds.find((item) => item?.deviceId === data.deviceId)) return

    let haveDeviceId = deviceMenuFlatData.value.some((item) => item.deviceId === data.deviceId)

    if (!haveDeviceId) {
      getWarningManagementFn(false)
    }
    const viewCount = data.viewCount - 1
    currentViewCount = data.viewCount
    if (currentConfig.value.deviceIds[viewCount]) {
      closeVideo(currentConfig.value.deviceIds[viewCount].deviceId)
    }
    currentConfig.value.deviceIds[viewCount] = { ...data, spinning: true }
    const currentData = currentConfig.value.deviceIds.find((item) => item?.deviceId === data.deviceId)
    videoRender(currentData)
  },
})

/**
 * 获取视频巡检SSE链接
 * @param screenType 0:单屏 1:四屏 2:九屏
 */
const getVideoSSELink = (screenType: number) => {
  const gTokenList = ['SINGLE', 'FOUR', 'NINE']
  return `${baseURL}/sse/connect-inspection?gToken=${gTokenList[screenType - 1]}-${token}`
}

/**
 * 开关视频巡检SSE
 */
const handleChangInspection = async (status: boolean) => {
  if (!currentConfig.value.inspectionStatus) {
    videoSSE.closeLink()
  } else {
    videoSSE.selectAndLink(getVideoSSELink(currentConfig.value.screenType))
  }
  // 视频巡检按钮
  if (!status) return
  await closeVideoAll()
  currentConfig.value.deviceIds = []
  try {
    await warningApi.putChangeInspection({ inspectionStatus: currentConfig.value.inspectionStatus })
    await getWarningTokenFn()
    // putChangeWarningFn(false)
    if (!currentConfig.value.inspectionStatus) {
      currentConfig.value.deviceIds.forEach((item) => (item.warningStatus = false))
    }
  } catch (error) {
    console.log('error', error)
  }
}

const playerQueue = ref<any[]>([])
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
    playerQueue.value.push({ play, deviceId: videoParams.deviceId })
  })
}

// 关闭单个视屏
const closeVideo = (deviceId: number) => {
  playerQueue.value = playerQueue.value.filter((item) => {
    if (item.deviceId === deviceId) {
      item.play.destroy && item.play.destroy()
      let video = item?.play?.options?.video as HTMLVideoElement | null
      let theVideo = document.getElementById(`video${item.deviceId}`) as HTMLVideoElement | null
      video?.pause()
      video?.removeAttribute('src')
      video?.remove()
      video?.load()
      video = null

      theVideo?.pause()
      theVideo?.removeAttribute('src')
      theVideo?.remove()
      theVideo?.load()
      theVideo = null
    }
    return item.deviceId !== deviceId
  })
}

//关闭所有视频
const closeVideoAll = () => {
  playerQueue.value.forEach((item) => {
    item?.play?.destroy && item.play.destroy()
  })
  playerQueue.value = []
}

// 空状态个数
const emptyNums = computed(() => currentConfig.value.screenType ** 2 - currentConfig.value.deviceIds.length)

const init = () => {
  getWarningManagementFn(true)
}
init()

// 视频巡检兼容判断标题长度
const StrFn = (str: string, position: boolean) => {
  let index = str.indexOf('-')
  if (position) {
    return str.substring(0, index)
  } else {
    return str.substring(index + 1)
  }
}

onUnmounted(() => {
  videoSSE.closeLink()
  closeVideoAll()
})
</script>

<style lang="less" scoped>
@import '../common.less';

@count: v-bind('currentConfig.screenType');
@gap: 6px;

.video-list-wrap {
  width: 100%;
  flex: 1;
  flex-shrink: 0;
  border-radius: 12px;
  border: 1px solid #142e55;
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0px 20px 40px 0px rgba(0, 0, 0, 0.25), 0px 12px 12px 0px rgba(0, 0, 0, 0.35);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    width: 100%;
    height: 100%;
    position: absolute;
    backdrop-filter: blur(40px);
  }
  .video-list {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: @gap;
    width: 100%;
    height: 100%;
    padding: 8px;

    .video-list-item {
      width: calc((100% / @count) - (@gap * (@count - 1) / @count));
      height: calc(100% / @count - (@gap * (@count - 1) / @count));
      box-sizing: border-box;
      position: relative;

      .video-item {
        width: 100%;
        height: 100%;
        object-fit: fill;
      }

      .video-empty {
        width: 100%;
        height: 100%;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        .empty-image {
          width: 112px;
          height: 84px;
          object-fit: cover;
          position: relative;
          & > img {
            width: 112px;
            height: 84px;
            object-fit: cover;
          }
          .empty-description {
            position: absolute;
            bottom: -30px;
            left: 30px;
            font-weight: 400;
            font-size: 14px;
            line-height: 22px;
            text-align: center;
            color: rgba(255, 255, 255, 0.6);
          }
        }
      }
    }
  }
}
</style>
