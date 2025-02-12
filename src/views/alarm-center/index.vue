<template>
  <skeleton :loading="skeletonLoading" :delay="300">
    <div class="alarm-page" :class="[isFullscreen && 'fullscreen']" ref="fullscreenDiv">
      <!-- 设备列表 -->
      <device-list
        v-show="!isFullscreen"
        :currentConfig="currentConfig"
        :deviceMenuData="deviceMenuData"
        v-model:activeKey="activeKey"
        @on-click-device="handleClickDevice"
      ></device-list>
      <!-- 视频列表 -->
      <device-video
        ref="deviceVideoRef"
        :currentConfig="currentConfig"
        :isFullscreen="isFullscreen"
        v-model:player-queue="playerQueue"
        @on-click-full-video="handleClickFullVideo"
        @on-click-device="handleClickDevice"
        @chang-inspection="handleChangInspection(true)"
        @on-click-change-screen="handleClickChangeScreen"
        @on-full-screen="fullscreenFn"
      ></device-video>
      <!-- 报警记录 -->
      <event-list
        ref="eventListRef"
        v-show="!screenFull"
        :isFullscreen="isFullscreen"
        :currentConfig="currentConfig"
        @on-click-alarm="handleClickAlarm"
      ></event-list>
      <!-- 全屏控制 -->
      <screen-button
        v-show="isFullscreen && isHover"
        :screenFull="screenFull"
        @exit-fullscreen="exit"
        @change-video-full-view="changeVideoFullView"
      ></screen-button>
    </div>
  </skeleton>
  <g-preview-record-modal ref="alarmModalRef" />
  <videoModal ref="videoModalRef" @openAiMarkFn="openAiMarkFn" />
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick, onUnmounted, watch } from 'vue'
import { SSE } from '@/utils/SSE'
import { useUserStore } from '@/store/user'
import { warningApi } from '@/services/api'
import deviceList from './_components/device-list.vue'
import skeleton from './_components/skeleton.vue'
import deviceVideo from './_components/device-video.vue'
import eventList from './_components/event-list.vue'
import screenButton from './_components/screen-button.vue'
import { useRequest } from 'vue-request'
import {
  ArrayRecords,
  currentConfigProps,
  deviceListProps,
  AlarmCenterListProps,
  aiMarkDeviceListProps,
} from './interface'
import { confirm } from '@/utils/antd.util'
import { baseURL } from '@/request'
import videoModal from './_components/video-modal.vue'
import { useFullscreen, useElementBounding } from '@vueuse/core'
import { useMouseMovement } from '@/hooks/useMouse'
import createAiMarkModule from '../../utils/Webassembly/edge-box-ai-mark-agent'

const { token } = useUserStore()

const alarmModalRef = ref()

const videoModalRef = ref()

const skeletonLoading = ref(false)

// 右侧报警记录及数据
const sse1 = new SSE({
  messageCb: (code: number, _message: string, data: any) => {
    //错误判断
    if (code != 0) return
    // 初始数据返空判断
    if (!data) return

    let alarmInfo = data?.data

    // 右边侧边栏带数据的
    if (alarmInfo?.id) {
      let flag = currentConfig.value.deviceIds.some((obj: ArrayRecords) => obj?.deviceId == alarmInfo.deviceId)
      //  如果是仅显示选中过滤
      if (currentConfig.value.warningStatus && !flag) return
      return eventListRef.value?.getData(alarmInfo)
    }

    //视屏巡检
    if (currentConfig.value.inspectionStatus && !alarmInfo?.warningStatus) return
    return findAlarmList(alarmInfo)
  },
})

// 视频巡检
let currentViewCount = 0
const sse2 = new SSE({
  messageCb: (code: number, _message: string, data: any) => {
    // 错误判断
    if (code != 0) return
    // 并发数据错误返空判断
    if (!data) return (currentConfig.value.deviceIds[currentViewCount] = null)
    // 报警取消判断
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
    // 通过位置更换位置视频
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

// 关闭sse
onUnmounted(async () => {
  closeVideoAll()
  sse1.closeLink()
  sse2.closeLink()
  try {
    await warningApi.getDisconnectWarning()
    currentConfig.value = null as any
  } catch (error) {
    console.log('error', error)
  }
})

// 视屏绘制
const playerQueue = ref<any[]>([])
const deviceVideoRef = ref<InstanceType<typeof deviceVideo>>()
const videoRender = (videoParams: any) => {
  deviceVideoRef.value?.videoRender(videoParams)
}

//关闭所有视频
const closeVideoAll = () => {
  playerQueue.value.forEach((item) => {
    item?.play?.destroy && item.play.destroy()
    item.play && (item.play = null)
  })
  playerQueue.value = []
}

// 关闭单个视屏
const closeVideo = (deviceId: number) => {
  playerQueue.value = playerQueue.value.filter((item) => {
    if (item.deviceId === deviceId) {
      item.play.destroy && item.play.destroy()
      item.play = null
    }
    return item.deviceId !== deviceId
  })
}

// 查找报警的视屏并添加
const findAlarmList = (params: any) => {
  let Id = params.deviceId
  deviceMenuData.value.forEach((item) => {
    for (const deviceItem of item.deviceAlarmCenterList) {
      if (deviceItem.deviceId === Id) {
        const flag = currentConfig.value.deviceIds.find((obj: ArrayRecords) => obj.deviceId == Id)
        if (flag) {
          deviceItem.alarmStatus = false
          flag.warningStatus = params?.warningStatus
        } else {
          deviceItem.alarmStatus = true
        }
        return
      }
    }
  })
}

// 开关视频巡检SSE
const handleChangInspection = async (params: boolean) => {
  if (!currentConfig.value.inspectionStatus) {
    sse2.closeLink()
  } else {
    switch (currentConfig.value.screenType) {
      case 1:
        sse2.selectAndLink(`${baseURL}/sse/connect-inspection?gToken=SINGLE-${token}`)
        break
      case 2:
        sse2.selectAndLink(`${baseURL}/sse/connect-inspection?gToken=FOUR-${token}`)
        break
      case 3:
        sse2.selectAndLink(`${baseURL}/sse/connect-inspection?gToken=NINE-${token}`)
        break
      default:
        break
    }
  }
  // 视频巡检按钮
  if (!params) return
  await closeVideoAll()
  currentConfig.value.deviceIds = []
  try {
    await warningApi.putChangeInspection({ inspectionStatus: currentConfig.value.inspectionStatus })
    await getWarningTokenFn()
    putChangeWarningFn(false)
    if (!currentConfig.value.inspectionStatus) {
      currentConfig.value.deviceIds.forEach((item) => (item.warningStatus = false))
    }
  } catch (error) {
    console.log('error', error)
  }
}

// 初始化数据以及监听全屏
onMounted(() => {
  sse1.selectAndLink(`${baseURL}/sse/connect-warning?gToken=${token}`)
  getWarningManagementFn(true)
})

//右侧报警记录开关
const eventListRef = ref<InstanceType<typeof eventList>>()
const handleClickAlarm = async (status: boolean) => {
  if (currentConfig.value.warningStatus == status) return
  try {
    await warningApi.putChangeWarning({ warningStatus: status })
    currentConfig.value.warningStatus = status
    eventListRef.value?.resetData()
  } catch (error) {
    console.log('error', error)
  }
}

// 右侧栏添加数据
const putChangeWarningFn = async (params: boolean = true) => {
  if (params && !currentConfig.value.warningStatus) return
  try {
    await warningApi.putChangeWarning({ warningStatus: currentConfig.value.warningStatus })
    eventListRef.value?.resetData()
  } catch (error) {
    console.log('error', error)
  }
}

// 视频单个全屏弹窗
const fullVideo = ref<boolean>(false)
const handleClickFullVideo = async (params: any) => {
  if (currentConfig.value.aiTagStatus) {
    await closeAiMarkFn()

    fullVideo.value = true
  }
  videoModalRef.value?.openModal(params, fullVideo.value)
}

/**
 * 点击设备栏
 */
const handleClickDevice = async (params: any, locationName = '') => {
  params.alarmStatus = false
  const deviceId = params.deviceId
  // 当前是否已选择
  const flag = currentConfig.value.deviceIds.some((deviceIds) => deviceIds.deviceId == deviceId)

  if (flag) {
    //关闭设备
    //巡检
    if (currentConfig.value.inspectionStatus) {
      confirm({
        title: '是否关闭智能巡检且关闭该实时摄像头画面？',
        onOk: () => {
          closeVideo(deviceId)
          currentConfig.value.deviceIds = currentConfig.value.deviceIds.filter((item) => item.deviceId !== deviceId)
          currentConfig.value.inspectionStatus = false
          handleChangInspection(false)
        },
      })
    }
    // 非巡检
    else {
      closeVideo(deviceId)
      currentConfig.value.deviceIds = currentConfig.value.deviceIds.filter((item) => item.deviceId !== deviceId)
    }
  }
  // 添加设备
  else {
    const currentVideo = currentConfig.value.deviceIds.length
    const limitVideo = currentConfig.value.screenType ** 2
    // 替换最后一个屏幕
    if (currentVideo === limitVideo) {
      //替换摄像头
      //有智能巡检
      if (currentConfig.value.inspectionStatus) {
        confirm({
          title: '是否关闭智能巡检且查看该摄像头实时画面？',
          onOk: () => {
            const popDevice = currentConfig.value.deviceIds.pop()
            closeVideo(popDevice.deviceId)
            currentConfig.value.deviceIds.push({ ...params, locationName })
            currentConfig.value.inspectionStatus = false
            handleChangInspection(false)
            const currentData = currentConfig.value.deviceIds.find((item) => item.deviceId === params.deviceId)
            videoRender(currentData)
          },
        })
      }
      // 无智能巡检
      else {
        const popDevice = currentConfig.value.deviceIds.pop()
        closeVideo(popDevice.deviceId)
        currentConfig.value.deviceIds.push({ ...params, locationName })
      }
    }
    // 直接添加
    else {
      currentConfig.value.deviceIds.push({ ...params, locationName })
    }

    if (currentConfig.value.inspectionStatus) return

    const currentData = currentConfig.value.deviceIds.find((item) => item.deviceId === params.deviceId)

    videoRender(currentData)
  }
  try {
    //记忆功能
    let deviceIds = currentConfig.value.deviceIds.map((item) => item.deviceId)
    await warningApi.postChangeDevice({ deviceIds })
    putChangeWarningFn()
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * 分屏幕按钮
 */
const handleClickChangeScreen = async (params: number) => {
  if (currentConfig.value.aiTagStatus) {
    aiMark.value.setDivision(params)
  }
  if (currentConfig.value.inspectionStatus) {
    try {
      await warningApi.postChangeScreen({ screenType: params })
      currentConfig.value.inspectionStatus = false
      await handleChangInspection(false)
      getWarningTokenFn()
    } catch (error) {
      console.log('error', error)
    }
  } else {
    try {
      await warningApi.postChangeScreen({ screenType: params })
      currentConfig.value.screenType = params
      const maxDeviceLength = params ** 2
      const currentDevice = currentConfig.value.deviceIds
      const currentDeviceLength = currentDevice.length

      // 小于最大分屏不裁剪
      if (currentDeviceLength < maxDeviceLength) return

      // 删除多余视屏实例
      currentDevice.slice(maxDeviceLength, currentDeviceLength).forEach((item) => {
        closeVideo(item.deviceId)
      })
      currentConfig.value.deviceIds = currentDevice.slice(0, maxDeviceLength)
      putChangeWarningFn()
    } catch (error) {
      console.log('error', error)
    }
  }

  //ai标记切换
}

// 全屏幕按钮
const fullscreenDiv = ref()
const { isFullscreen, enter, exit } = useFullscreen(fullscreenDiv)

const fullscreenchange = () => {
  screenFull.value = false
}
window.addEventListener('fullscreenchange', fullscreenchange)
//  离开报警中心
onUnmounted(() => {
  mouseMovement()
  window.removeEventListener('fullscreenchange', fullscreenchange)
})

const isHover = ref<boolean>(true)
// 全屏状态下鼠标移动
const mouseMovement = useMouseMovement((isMouseMove: boolean) => {
  if (!fullscreenDiv.value) return
  if (!isFullscreen.value) return
  isMouseMove ? (fullscreenDiv.value.style.cursor = 'default') : (fullscreenDiv.value.style.cursor = 'none')
  isHover.value = isMouseMove
})

//全部显示
const screenFull = ref<boolean>(false)
const changeVideoFullView = (bool: boolean) => {
  screenFull.value = bool
}

//气泡框挂载
const getPopupContainerEl = ref<any>(document.body)
onMounted(() => {
  nextTick(() => {
    getPopupContainerEl.value = document.getElementById('screen-button')
  })
})

//右侧栏
const deviceMenuData = ref<Array<deviceListProps>>([])

const activeKey = ref()

/**
 * 获取设备列表数据
 */
const deviceMenuFlatData = ref<AlarmCenterListProps[]>([])
const getWarningManagementFn = async (flag: boolean) => {
  try {
    skeletonLoading.value = true
    let { data } = await warningApi.getWarningManagement()
    deviceMenuData.value = data
    activeKey.value = data.map((item: any) => item.deviceLocationId)
    deviceMenuData.value.forEach((item, index, arr) => {
      // 对摄像头排序，在线的在上面
      if (item.deviceAlarmCenterList) {
        arr[index].deviceAlarmCenterList = item.deviceAlarmCenterList.sort((a, b) => {
          if (a.deviceStatus === 1 && b.deviceStatus !== 1) {
            return -1
          }
          if (a.deviceStatus !== 1 && b.deviceStatus === 1) {
            return 1
          }
          return 0
        })
      }
      item.deviceAlarmCenterList.forEach((item) => deviceMenuFlatData.value.push(item))
    })
    skeletonLoading.value = false
    if (!flag) return
    getWarningTokenFn()
  } catch (error) {
    console.log('error', error)
    // skeletonLoading.value = false
  }
}

/**
 * 获取默认配置
 */
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

const fullscreenFn = () => {
  enter()
  setTimeout(() => {
    const height = document.body.clientHeight - 1
    aiMark.value && aiMark.value.setCanvasSize(document.body.clientWidth, height)
  }, 48)
}
// ai插件标记
// const contentRef = ref()

// 更新绘制信息状态
// const handleChangMarkInfo = (status: boolean) => {
//   console.log(status);
// }

// ai插件标记
const aiVideoRef = ref()

const { x, y, width, height } = useElementBounding(aiVideoRef)

watch(
  () => {
    return {
      x: x.value,
      y: y.value,
      width: width.value,
      height: height.value,
    }
  },
  () => {
    canvasPositionFn()
  },
)

const aiMark = ref()

const getModuleFn = async () => {
  fullVideo.value = false

  aiMark.value = await createAiMarkModule()
}

// onMounted(() => {
//   getModuleFn()
// })

// 开关AI标记
const aiMarkDevice = ref<aiMarkDeviceListProps[]>([])

// const handleChangeAi = () => {
//   // currentConfig.value.aiTagStatus ? openAiMarkFn() : closeAiMarkFn()
//   if (currentConfig.value.aiTagStatus) {
//     console.log('qqqqqqqqqqq')

//     openAiMarkFn()
//   } else {
//     console.log('wwwwwwwwww')

//     closeAiMarkFn()
//   }
// }

const openAiMarkFn = async () => {
  const aiCanvas = document.getElementById('gxAiMarkCanvas')
  if (!aiCanvas) return
  await getModuleFn()
  canvasPositionFn()
  currentConfig.value.deviceIds.forEach((item: AlarmCenterListProps, index) => {
    aiMark.value.bindDevice(index, item.deviceId)
    aiMarkDevice.value.push({ deviceId: item.deviceId, aiMarkIndex: index })
  })
  aiCanvas.style['display'] = 'block'
  aiMark.value.setDivision(currentConfig.value.screenType)
  currentConfig.value.aiTagStatus = true
}

const closeAiMarkFn = () => {
  const aiCanvas = document.getElementById('gxAiMarkCanvas')
  if (!aiCanvas) return
  const screenNumber = currentConfig.value.screenType ** 2
  for (let index = 0; index < screenNumber; index++) {
    aiMark.value.unbindDevice(index)
    aiMarkDevice.value = []
  }
  aiCanvas.style['display'] = 'none'
  currentConfig.value.aiTagStatus = false
  aiMark.value.closeAiMarkService()
}

watch(
  () => {
    return currentConfig.value.deviceIds
  },
  () => {
    const maxIndex =
      currentConfig.value.deviceIds.length > aiMarkDevice.value.length
        ? currentConfig.value.deviceIds.length
        : aiMarkDevice.value.length
    if (!aiMark.value) return
    for (let index = 0; index < maxIndex; index++) {
      if (!currentConfig.value.deviceIds[index]?.deviceId) {
        aiMarkDevice.value.splice(index, index)
        aiMark.value.unbindDevice(index)
      } else {
        if (currentConfig.value.deviceIds[index]?.deviceId !== aiMarkDevice.value[index]?.deviceId) {
          aiMarkDevice.value[index] = { deviceId: currentConfig.value.deviceIds?.[index]?.deviceId, aiMarkIndex: index }
          aiMark.value.unbindDevice(index)
          aiMark.value.bindDevice(index, currentConfig.value.deviceIds[index].deviceId)
        }
      }
    }
  },
  { deep: true },
)

// ai标记位置
const canvasPositionFn = () => {
  const aiCanvas = document.getElementById('gxAiMarkCanvas')
  if (!aiCanvas) return
  if (isFullscreen.value) {
    const percent = width.value / document.body.clientWidth
    const left = (document.body.clientWidth - width.value) / 2
    aiCanvas.style['transform'] = `scaleX(${percent})`
    aiCanvas.style['left'] = `-${left}px`
  } else {
    aiCanvas.style['transform'] = `scaleX(1)`
    aiCanvas.style['left'] = `0`
    aiMark.value && aiMark.value.setCanvasSize(width.value, height.value)
  }
}
</script>
<style lang="less" scoped>
@import './styles/index.less';

.alarm-page {
  width: 100%;
  height: 100%;
  padding: 0 16px 20px;
  display: flex;
  gap: 0 16px;
  &.fullscreen {
    padding: 0;
  }
}
</style>
