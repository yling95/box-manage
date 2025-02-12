<template>
  <div class="configuration-page">
    <div class="configuration-page-layout">
      <!-- 摄像头列表 -->
      <device-list
        ref="deviceListRef"
        :equipmentId="equipmentId"
        :managementInfo="managementInfo"
        @on-device-loaded="onDeviceLoaded"
        @on-click-device="onClickDevice"
      ></device-list>
      <div class="configuration-right">
        <div class="configuration-head">
          <!-- 区域 -->
          <!-- {{ deviceInfo }} -->
          <identifiable-area
            ref="identifiableAreaRef"
            :optionalCount="deviceInfo?.deviceActiveSrvCountV2"
            :equipment-id="equipmentId"
            :area-active-index="areaActiveIndex"
            :area-list="areaList"
            @on-add-area="getByDeviceIdAreaList('add')"
            @on-delete-area="handleDeleteAreaItem"
            @on-change-area="handleChangeAreaItem"
          ></identifiable-area>
          <a-button
            type="link"
            class="icon-button"
            v-auth="'equipment-management-ai-edit'"
            :disabled="areaList.length === 0 || aiServiceList.length === 0 || !notModified"
            @click="handleOpenCopy"
          >
            <i class="iconfont icon-file-copy-line1"></i>
            复制到..
          </a-button>
        </div>
        <div class="configuration-content">
          <!-- ai服务 -->
          <ai-serve
            :ai-service-list="aiServiceList"
            :ai-service-auth="aiServiceAuth"
            :area-info="areaInfo"
            @on-change-checked="onServiceCheckedChange"
          ></ai-serve>
          <!-- 编辑器 -->
          <div class="editor-container">
            <div class="editor-container-head">
              <div class="step-wrap">
                <div class="step">第二步</div>
                <p>绘制识别区域</p>
              </div>
              <a-button
                v-if="aiServiceAuth"
                type="primary"
                :loading="saveLoading"
                :disabled="areaList.length === 0 || notModified"
                @click="handleSubmit"
              >
                保存
              </a-button>
            </div>
            <div class="editor-container-content" @click="promptInfo">
              <div class="editor-control" v-auth="'equipment-management-ai-edit'">
                <div class="radio-group-wrap">
                  <!-- :disabled="areaList.length === 0 || !isLoadVideoSuccess" -->
                  <a-radio-group
                    size="small"
                    :disabled="areaList.length === 0 || !drawType"
                    :value="switchChecked"
                    @change="onSwitchCheckedChange"
                    button-style="solid"
                  >
                    <a-radio-button :value="1" :disabled="switchCheckedDisabled">全屏</a-radio-button>
                    <a-radio-button :value="0">自定义</a-radio-button>
                  </a-radio-group>
                </div>
                <div class="draw-info" v-if="switchChecked === 1 || switchChecked === 0">
                  <i v-if="switchChecked === 1" class="iconfont icon-information-fill"></i>
                  <p v-if="switchChecked === 1"><span>智能全域</span> 自动捕捉全屏画面</p>
                  <div v-else>
                    <div v-if="drawType === 2" class="flex">
                      <i class="iconfont icon-a-straightline"></i>
                      单击鼠标左键开始创建点，两点之间形成直线。双击左键、单击右键或回车完成绘制。鼠标放在直线上按住左键移动，按【delete】键删除已选直线。允许最多创建50条直线。
                      <!-- <span>绘制方法</span> 按住左键拖动画图；双击、右键、回车结束多边型绘制； <span>绘制规则</span>
                        可创建最多50个图形；【Delete】可清除图形 -->
                    </div>
                    <div v-else class="flex">
                      <i class="iconfont icon-shape-fill"></i>
                      单击鼠标左键开始绘图，需点击3次或以上以形成封闭图形。双击左键、单击右键或回车完成绘制。鼠标放入区域按住左键移动图形，按【delete】键删除已选图形。允许最多创建50个图形。
                    </div>
                  </div>
                </div>
                <div>
                  <a-button
                    v-if="switchChecked === 0"
                    type="default"
                    :disabled="!canvasActiveObject"
                    class="icon-button control-right"
                    :class="['icon-button', 'control-right', { 'control-right--disable': !canvasActiveObject }]"
                    @click="handleDelCanvas"
                    size="small"
                  >
                    删除
                  </a-button>
                  <a-button
                    v-if="switchChecked === 0"
                    :disabled="areaList.length === 0 || !isLoadVideoSuccess"
                    type="default"
                    :class="['icon-button', 'control-right']"
                    @click="handleClearCanvas"
                    size="small"
                  >
                    清屏
                  </a-button>
                </div>
              </div>
              <!-- 绘制容器 -->
              <div class="draw-container">
                <canvas id="canvas" class="canvas"></canvas>
                <video id="video" class="video" muted :key="equipmentId"></video>
                <!-- <p class="video-info">{{ deviceInfo?.deviceLocationName }}-{{ deviceInfo?.deviceName }}</p> -->
                <div class="video-empty" v-if="!isLoadVideoSuccess || videoLoading">
                  <div v-if="videoLoading" class="loading-wrap">
                    <img class="loading" src="@/assets/images/alarm/loading.png" />
                    <div class="empty-description">正在连接..</div>
                  </div>
                  <div v-if="!videoLoading">
                    <img src="@/assets/images/alarm/abnormal.png" />
                    <div class="empty-description">连接异常</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <copy-modal :equipment-id="equipmentId" ref="copyModalRef"></copy-modal>
  <g-no-save-confirm
    v-model:visible="noSaveConfirmObj.visible"
    :confirmFunObj="noSaveConfirmObj.funObj"
  ></g-no-save-confirm>
</template>

<script setup lang="ts">
import { MaskingAreaSize, equipmentApi } from '@/services/api'
import { computed, nextTick, onUnmounted, ref, watch, reactive } from 'vue'
import { useRequest } from 'vue-request'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { fabric } from 'fabric'
import { Rect, Polygon, Line } from '@/utils/fabric'
import { confirm, message } from '@/utils/antd.util'
import { obj2str } from '@/utils/utils'
import { cloneDeep } from 'g6-fn'
import { JSWebrtc } from '@/utils/webtc'
import CopyModal from './_components/copy-modal.vue'
import DeviceList from './_components/device-list.vue'
import IdentifiableArea from './_components/identifiable-area.vue'
import AiServe from './_components/ai-serve.vue'
import { beforeRouteLeaveWhiteList } from '@/config'
import { MAX_SELECTED_SERVE_NUM } from '../config'

const route = useRoute()
const router = useRouter()
const equipmentId = ref<number>(0)

// 未保存，切换、离开提示
const noSaveConfirmObj = reactive({
  visible: false,
  funObj: {
    noSaveFun: () => {},
    saveFun: () => {},
    cancelFun: () => {},
  },
})

// 设备id
equipmentId.value = route.query.id as unknown as number

// 监听键盘delete按键
const keydown = (e: KeyboardEvent) => {
  if (e.key === 'Delete' || e.key === 'Backspace') {
    // 删除激活的矩形
    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      canvas.remove(activeObject)
      canvas.renderAll()
      notModified.value = obj2str(cacheData) === obj2str(getUpdateData())
    }
  }
  if (e.key === 'Enter') {
    polygon?.finish()
  }
}
document.addEventListener('keydown', keydown)

// 缓存数据
type CacheData = {
  smartUniverse?: number
  customizeDrawAreaCoordinates?: any[]
  deviceAIServiceList?: any[]
}
let cacheData: CacheData = {
  smartUniverse: undefined,
  customizeDrawAreaCoordinates: undefined,
  deviceAIServiceList: undefined,
}

/**
 * ----------------------------------------------- 设备列表 ---------------------------------------------
 */
const managementInfo = ref<any>()
const deviceInfo = ref<any>()
const onDeviceLoaded = (management: any, device: any, type?: 'refresh') => {
  managementInfo.value = management
  deviceInfo.value = device
  console.log(deviceInfo.value, '设备列表')

  if (type === 'refresh') {
    return
  }
  initCanvas()
  getByDeviceIdAreaList()
}

// 切换设备
let prevTime = 0
const onClickDevice = (item: any, onlyRun?: boolean) => {
  if (Number(item.id) === Number(equipmentId.value)) return

  const nowTime = new Date().getTime()

  // 弹窗确认不保存
  if (onlyRun) {
    return run()
  }

  // 切换设备间隔小于500ms或者区域数量为0 不用验证
  if (nowTime - prevTime < 1000 || areaList.value.length === 0) {
    return run()
  }
  // console.log('初始缓存数据：', obj2str(cacheData))
  // console.log('更新后的数据：', obj2str(getUpdateData()))
  if (obj2str(cacheData) === obj2str(getUpdateData())) {
    return run()
  }
  // 未保存 弹窗确认
  //  保存并切换的方法
  const saveLeaveFun = async () => {
    await handleSubmit()
    await run()
  }
  noSaveConfirmObj.funObj.noSaveFun = run
  noSaveConfirmObj.funObj.saveFun = saveLeaveFun
  noSaveConfirmObj.visible = true

  function run() {
    canvas.clear()
    backgroundVideo = undefined as any
    router.replace({ query: { id: item.id } })
    isLoadVideoSuccess.value = false
    stopDraw()
    equipmentId.value = item.id
    deviceInfo.value = item
    areaActiveIndex.value = 0
    getByDeviceIdAreaList()
    loadVideo(deviceInfo.value)
    prevTime = nowTime
  }
}

/**
 * ----------------------------------------------- 加载视频 ---------------------------------------------
 */
let videoLoading = ref(false)
let timer: any
// 视频加载成功标识
const isLoadVideoSuccess = ref(false)
let play: any = null
const loadVideo = async (deviceInfo: any) => {
  if (!deviceInfo) return
  videoLoading.value = true
  isLoadVideoSuccess.value = false
  const url = deviceInfo.deviceOriginalStreamingLocation
  if (play) {
    play.pause()
    play.destroy()
    play = null
    await nextTick()
  }
  // 验证超时
  clearTimeout(timer)
  timer = setTimeout(() => {
    videoLoading.value = false
    isLoadVideoSuccess.value = false
    message.error('设备连接失败')
    clearTimeout(timer)
  }, 1000 * 10)
  video = document.getElementById('video') as HTMLVideoElement
  // @ts-ignore
  play = new JSWebrtc.Player(url, {
    video: video,
    autoplay: true,
    onPlay: () => {
      // 监听视频加载完成
      clearTimeout(timer)
      isLoadVideoSuccess.value = true
      videoLoading.value = false
      video.width = video.videoWidth
      video.height = video.videoHeight
      scale = Math.min(canvas.getWidth() / video.width, canvas.getHeight() / video.height)
      backgroundVideo = new fabric.Image(video)
      backgroundVideo.scale(scale)
      drawVideo()
      clearCanvas()

      if (areaList.value.length > 0 && areaInfo.value) {
        // 视频加载完成 回填绘制区域
        if (switchChecked.value === 1) {
          return fullRect()
        }
        areaInfo.value?.customizeDrawAreaCoordinates && drawDefaultArea(areaInfo.value.customizeDrawAreaCoordinates)
      }
    },
  })
}

/**
 * ----------------------------------------------- 识别区域 ---------------------------------------------
 */
const areaActiveIndex = ref<number>(0)
const areaList = ref<number[]>([])
const { runAsync: runGetByDeviceIdAreaList } = useRequest(equipmentApi.getByDeviceIdAreaList)
// 获取识别区域列表
const getByDeviceIdAreaList = async (type?: string) => {
  try {
    const { data } = await runGetByDeviceIdAreaList(equipmentId.value)
    if (data === null) {
      await equipmentApi.addDeviceArea(equipmentId.value as number)
      await getByDeviceIdAreaList('add')
      return
    }
    areaList.value = data || []
    // 新增跳转到新增的区域
    if (type === 'add') {
      handleChangeAreaItem(data[data.length - 1], data.length - 1)
      return
    }
    if (data && data.length) {
      return getByAreaInfo(data[areaActiveIndex.value])
    }
    switchChecked.value = 0
    polygon.clearAll()
    aiServiceList.value = []
  } catch (error) {
    console.error(error)
  }
}

// 切换识别区域
const handleChangeAreaItem = (id: number, index: number, onlyRun?: boolean) => {
  // 弹窗确认 不保存
  if (onlyRun) {
    return run()
  }

  // console.log('初始缓存数据：', obj2str(cacheData))
  // console.log('更新后的数据：', obj2str(getUpdateData()))
  if (obj2str(cacheData) === obj2str(getUpdateData())) {
    return run()
  }

  // 未保存 弹窗确认
  const saveLeaveFun = async () => {
    await handleSubmit()
    await run()
  }

  noSaveConfirmObj.funObj.noSaveFun = run
  noSaveConfirmObj.funObj.saveFun = saveLeaveFun
  noSaveConfirmObj.visible = true

  function run() {
    areaActiveIndex.value = index
    getByAreaInfo(id)
  }
}

// 删除识别区域
const handleDeleteAreaItem = async (id: number, index: number) => {
  confirm({
    title: '是否删除识别区域' + (index + 1),
    onOk: async () => {
      const maskingAreaSize: MaskingAreaSize = {
        width: video.width || 0,
        height: video.height || 0,
      }
      await equipmentApi.deleteDeviceArea(id, maskingAreaSize)
      deviceListRef.value?.getManagementInfo('refresh')
      if (areaList.value.length > 0) {
        if (areaActiveIndex.value === index) {
          areaActiveIndex.value = 0
        }
      }
      await getByDeviceIdAreaList()
      message.success('操作成功')
    },
  })
}

/**
 * ----------------------------------------------- 绘制信息及AI服务列表 ---------------------------------------------
 */
// AI服务列表
const aiServiceList = ref<any[]>([])
const aiServiceAuth = ref<boolean>(true)
// 绘制坐标消息
const customizeDrawAreaCoordinates = ref<any[]>([])
// 当前区域可选AI服务数量
const optionalCount = ref<number>(0)
// 获取识别区域信息
const areaInfo = ref<any>()
const { runAsync: runGetByAreaInfo } = useRequest(equipmentApi.getByAreaInfo)

const getByAreaInfo = async (id: number) => {
  try {
    const { data } = await runGetByAreaInfo(id)
    aiServiceAuth.value = true
    if (
      data.deviceAreaAIServiceList.find((item: any) => item.aiSrvType === 21)?.selected ||
      data.deviceAreaAIServiceList.find((item: any) => item.aiSrvDrawType === 2)?.selected
    ) {
      switchChecked.value = 0
      switchCheckedDisabled.value = true
    }

    if (!data) return
    const activatedServeCount = data?.deviceAreaAIServiceList.filter((item: any) => item.selected === 1).length
    optionalCount.value = MAX_SELECTED_SERVE_NUM - data.activeAreaAISrvCount + activatedServeCount

    // 已选择得算法往上排
    aiServiceList.value = data?.deviceAreaAIServiceList.sort((a: { selected: number }, b: { selected: number }) => {
      if (a.selected === 1 && b.selected !== 1) {
        return -1
      }
      if (a.selected !== 1 && b.selected === 1) {
        return 1
      }
      return 0
    })

    // chore:由于计算算法数量由后端计算，前端暂时去掉禁用逻辑
    aiServiceList.value = data?.deviceAreaAIServiceList.map((item: any) => {
      if (optionalCount.value <= activatedServeCount) {
        item.selected !== 1 && (item.selectable = 0)
        return item
      }
      return item
    })

    areaInfo.value = data
    customizeDrawAreaCoordinates.value = data?.customizeDrawAreaCoordinate
    switchChecked.value = data?.smartUniverse
    // 缓存数据
    Object.assign(cacheData, {
      smartUniverse: data?.smartUniverse,
      customizeDrawAreaCoordinates: cloneDeep(data?.customizeDrawAreaCoordinates),
      deviceAIServiceList: cloneDeep(data?.deviceAreaAIServiceList),
    })
    clearCanvas()
    if (getCanvasStatus()) {
      // 视频加载完成 回填绘制区域
      if (switchChecked.value === 1) {
        return fullRect()
      }
      areaInfo.value?.customizeDrawAreaCoordinates && drawDefaultArea(areaInfo.value.customizeDrawAreaCoordinates)
    }
  } catch (err: any) {
    console.log('ai服务', err)
    // 当异常code === -17的时候算法没有授权
    if (err.data.code === -17) {
      aiServiceAuth.value = false
      return
    }
    aiServiceAuth.value = true
  }
}

// 绘制类型
const drawType = computed(() => {
  const service = aiServiceList.value.find((item) => item.selected === 1)
  return service?.aiSrvDrawType
})

// 处理AI服务列表是否可选
const aiServeListSelective = () => {
  // chore:由于计算算法数量由后端计算，前端暂时去掉禁用逻辑
  // const activatedServeCount = aiServiceList.value.filter((item) => item.selected === 1).length
  aiServiceList.value.map((item) => {
    // if (optionalCount.value <= activatedServeCount) {
    //   item.selected !== 1 && (item.selectable = 0)
    //   return item
    // }
    item.selectable = 1
    return item
  })
}
const switchCheckedDisabled = ref(false)
// const curdrawType = ref<number>(1)
// AI服务是否选中
const onServiceCheckedChange = (checked: boolean, item: any) => {
  if ((item.aiSrvType === 21 && item.selected === 0) || item.aiSrvDrawType === 2) {
    // 特殊算法 自定义
    switchChecked.value = 0
    switchCheckedDisabled.value = true
    clearCanvas()
    stopDraw()
  } else {
    switchCheckedDisabled.value = false
    // 选中第一个算法的时候，除特殊算法外 默认全屏
    const activatedServeCount = aiServiceList.value.filter((item) => item.selected === 1).length
    if (activatedServeCount <= 0) {
      switchChecked.value = 1
      fullRect()
    }
  }
  item.selected = checked ? 1 : 0
  aiServeListSelective()

  if (drawType.value) {
    // isLoadVideoSuccess.value && drawType.value === 2
    //   ? drawLine()
    //   : drawPolygon(drawType.value === 3 ? 'four-sides' : 'more')
    // isLoadVideoSuccess.value && drawPolygon(drawType.value === 3 ? 'four-sides' : 'more')

    if (isLoadVideoSuccess.value && switchChecked.value === 0) {
      if (drawType.value === 2) {
        drawLine()
      } else if (drawType.value === 4) {
        drawRect()
      } else {
        drawPolygon(drawType.value === 3 ? 'four-sides' : 'more')
      }
    }

    // chore:由于计算算法数量由后端计算，前端暂时去掉禁用逻辑
    // const activatedServeCount = aiServiceList.value.filter((item) => item.selected === 1).length
    aiServiceList.value.forEach((item) => {
      if (drawType.value === item.aiSrvDrawType) {
        item.selectable = 1
      } else {
        item.selectable = 0
        item.selected = 0
      }
      // 保证满足选择到最大数量后所有服务都不可选
      // if (optionalCount.value <= activatedServeCount) {
      //   item.selected !== 1 && (item.selectable = 0)
      // }
    })
  } else {
    // 没有选中算法时 不能绘制全屏、自定义
    switchChecked.value = -1
    stopDraw()
    clearCanvas()
    !switchChecked.value && clearCanvas()
    aiServiceList.value.forEach((item) => {
      item.selectable = 1
      item.selected = 0
    })
  }
}

/**
 * ----------------------------------------------- 绘制 ---------------------------------------------
 */
let canvas: fabric.Canvas
let video: HTMLVideoElement
let polygon: Polygon
let rect: Rect
let backgroundVideo: fabric.Image
let scale: number
let line: Line

// 填充色
const nowGraphFillColor = 'rgba(255, 142, 66, 0.20)'
// 边框色
const nowGraphStrokeColor = '#FF8E42'
// 背景色
const backgroundColor = '#0E1C32'

const canvasActiveObject = ref()

function initCanvas() {
  try {
    // 初始化canvas
    canvas = new fabric.Canvas('canvas', {
      // 禁止选中
      selection: false,
      // 启用右键
      fireRightClick: true,
      // 禁止默认右键菜单
      stopContextMenu: true,
    })
    // 读取视频宽高
    canvas.setWidth(getCanvasWidth())
    canvas.setHeight(getCanvasHeight())
    canvas.backgroundColor = backgroundColor
    // 矩形
    rect = new Rect(canvas)
    // 多边形
    polygon = new Polygon(canvas)
    // 线
    line = new Line(canvas)
    // 加载背景视频
    loadVideo(deviceInfo.value)

    // 监听canvas操作 验证是否有修改
    canvas.on('mouse:up', () => {
      notModified.value = obj2str(cacheData) === obj2str(getUpdateData())
    })

    canvas.on('mouse:down', () => {
      const isSelectALG = aiServiceList.value.some((item) => item.selected === 1)
      if (getCanvasStatus() && !isSelectALG && !switchChecked.value) {
        stopDraw()
        message.warning('请先选择算法')
      }
    })
    canvas.on('selection:created', (event) => {
      var selectedObject = event.selected![0]
      // 执行您想要的操作，比如获取选中对象的信息等等
      console.log('选中的对象:', selectedObject)
      canvasActiveObject.value = selectedObject
    })
    canvas.on('selection:cleared', () => {
      console.log('取消选中图形')
      canvasActiveObject.value = null
    })
  } catch (error) {
    console.error(error)
  }
}

// 获取容器宽度
const getCanvasWidth = () => {
  const canvasWidth = document.querySelector('.draw-container')?.clientWidth
  return canvasWidth || 0
}
// 获取容器高度
const getCanvasHeight = () => {
  const canvasHeight = document.querySelector('.draw-container')?.clientHeight
  return canvasHeight || 0
}

// 获取画布状态（用于判断是否能绘制）
const getCanvasStatus = () => {
  return areaList.value.length > 0 && isLoadVideoSuccess.value
}

// 绘制视频
function drawVideo() {
  if (backgroundVideo) {
    canvas.setBackgroundImage(backgroundVideo, canvas.renderAll.bind(canvas), {
      left: 0,
      top: 0,
    })
    // 设置居中
    canvas.centerObject(backgroundVideo)
    canvas.renderAll()
    requestAnimationFrame(drawVideo)
  } else {
    // 去掉背景
    canvas.setBackgroundImage('', canvas.renderAll.bind(canvas))
  }
}

// 停止绘制
function stopDraw() {
  polygon.resetDefaultOptions()
  polygon.endDraw()
  line.endDraw()
  rect.endDraw()
}

// 清除当前正在绘制的对象
function clearCurrentObject() {
  polygon.clearCurrentObject()
  line.clearCurrentObject()
}

// 启用画布上的所有对象
function enableAllObject() {
  canvas?.getObjects().forEach((item) => {
    item.set({
      evented: true,
      selectable: true,
    })
  })
}

// 绘制多边形
function drawPolygon(type: 'four-sides' | 'more' = 'more') {
  stopDraw()
  enableAllObject()
  if (type === 'four-sides') {
    polygon.set({
      minDotCount: 4,
      maxDotCount: 4,
      maxNum: 1,
    })
  }
  polygon.startDraw()
}
// 绘制直线
const drawLine = (): void => {
  stopDraw()
  enableAllObject()
  line.startDraw()
}

// 绘制矩形
const drawRect = (): void => {
  stopDraw()
  enableAllObject()
  rect.startDraw()
}
// 清屏
const handleClearCanvas = () => {
  clearCurrentObject()
  clearCanvas()
  notModified.value = obj2str(cacheData) === obj2str(getUpdateData())
}

// 删除当前选中的图形
const handleDelCanvas = () => {
  clearCurrentObject()
  if (canvas.getActiveObject()) {
    canvas.remove(canvas.getActiveObject() as fabric.Object)
  }
  notModified.value = obj2str(cacheData) === obj2str(getUpdateData())
}

// 清空画布
const clearCanvas = () => {
  canvas?.getObjects().forEach(function (obj) {
    if (obj !== canvas.backgroundImage) {
      canvas.remove(obj)
    }
  })
  canvas.renderAll()
}

// 绘制默认区域
const drawDefaultArea = (axisList: [number, number][][]) => {
  if (!canvas?.backgroundImage) return
  axisList.forEach((item) => {
    if (drawType.value === 2) {
      const position = line.getCurrentAxis({ top: backgroundVideo.top!, left: backgroundVideo.left! }, item, scale)
      const lineObj = line.create(position, {
        selectable: false,
        evented: false,
      })
      canvas.add(lineObj)
      drawLine()
    } else if (drawType.value === 4) {
      const position = rect.getCurrentAxis({ top: backgroundVideo.top!, left: backgroundVideo.left! }, item, scale)
      const rectObj = rect.create({
        ...position,
        selectable: false,
        evented: false,
      })
      canvas.add(rectObj)
      drawRect()
    } else {
      const position = polygon.getCurrentAxis({ top: backgroundVideo.top!, left: backgroundVideo.left! }, item, scale)
      const newPolygon = polygon.create(position, {
        selectable: false,
        evented: false,
      })
      canvas.add(newPolygon)
      drawPolygon(drawType.value === 3 ? 'four-sides' : 'more')
    }
  })
}

// 智能全域
const switchChecked = ref<1 | 0 | -1>(-1) // 1全屏  0自定义  -1未定义
const onSwitchCheckedChange = (e: any) => {
  if (e.target.value === false && drawType.value === 2) {
    message.warning(`为了让算法生效，您需要绘制至少一条直线`)
  }
  const checked = e.target.value
  switchChecked.value = checked
  clearCanvas()
  stopDraw()
  if (getCanvasStatus()) {
    checked ? fullRect() : drawType.value === 4 ? drawRect() : drawPolygon(drawType.value === 3 ? 'four-sides' : 'more')
  }
}

// 绘制整个区域
const fullRect = () => {
  if (!canvas?.backgroundImage) return
  try {
    stopDraw()
    const bgcObj = canvas.backgroundImage as fabric.Image
    const width = bgcObj.width! * bgcObj.scaleX! || 0
    const height = bgcObj.height! * bgcObj.scaleY! || 0
    const left = bgcObj.left! || 0
    const top = bgcObj.top! || 0
    const fullRect = rect.create({
      width: width,
      height: height,
      left: left,
      top: top,
      fill: nowGraphFillColor,
      stroke: nowGraphStrokeColor,
      strokeWidth: 1,
    })
    canvas.add(fullRect)
    // 只读
    fullRect.set({
      selectable: false,
      evented: false,
    })
  } catch (error) {
    console.error(error)
  }
}

/**
 * ----------------------------------------------- 获取修改数据 ---------------------------------------------
 */
const getUpdateData = () => {
  const params = {
    // 智能全域
    smartUniverse: switchChecked.value,
    // 识别区域坐标
    customizeDrawAreaCoordinates: null as any,
    // AI服务信息
    deviceAIServiceList: aiServiceList.value,
  }
  // 获取绘制的图形数据
  if (switchChecked.value === 0) {
    params.customizeDrawAreaCoordinates = []
    canvas?.getObjects().forEach((item) => {
      if (item instanceof fabric.Polygon) {
        // 获取坐标
        const axis = polygon.getOriginAxis({ top: backgroundVideo.top!, left: backgroundVideo.left! }, item, scale)
        params.customizeDrawAreaCoordinates.push(axis)
      } else if (item instanceof fabric.Line) {
        const axis = line.getOriginAxis({ top: backgroundVideo.top!, left: backgroundVideo.left! }, item, scale)
        params.customizeDrawAreaCoordinates.push(axis)
      } else if (item instanceof fabric.Rect) {
        const axis = rect.getOriginAxis({ top: backgroundVideo.top!, left: backgroundVideo.left! }, item, scale)
        params.customizeDrawAreaCoordinates.push(axis)
      }
    })
  }
  // 是否存在区域
  if (areaList.value.length === 0 || !areaInfo.value) {
    return cacheData
  }

  // 视频是否加载成功：目的是当视频加载失败时，不需要绘制区域信息
  if (!isLoadVideoSuccess.value) {
    return {
      ...params,
      customizeDrawAreaCoordinates: cacheData.customizeDrawAreaCoordinates,
    }
  }
  return params
}

const promptInfo = () => {
  if (switchChecked.value === -1) {
    message.info('请先勾选算法')
  }
}

/**
 * ----------------------------------------------- 保存 ---------------------------------------------
 */
const deviceListRef = ref()
const { loading: saveLoading, runAsync: runSaveAreaInfo } = useRequest(equipmentApi.saveAreaInfo)
const handleSubmit = async () => {
  if (switchChecked.value === 0) {
    if (canvas?.getObjects().length === 0) {
      drawType.value === 2
        ? message.error(`区域${areaActiveIndex.value + 1}未绘制直线`)
        : message.error(`区域${areaActiveIndex.value + 1}未绘制区域`)
      return
    }
  }

  try {
    const params = {
      // 区域id
      id: areaList.value[areaActiveIndex.value],
      // 设备id
      deviceId: equipmentId.value,
      maskingAreaSize: {
        width: video.width || 0,
        height: video.height || 0,
      },
      ...getUpdateData(),
    }
    params.smartUniverse = params.smartUniverse === -1 ? 1 : params.smartUniverse
    await runSaveAreaInfo(params)
    cacheData = getUpdateData()
    notModified.value = true
    message.success('操作成功')
    aiServiceList.value = []
    nextTick(() => {
      getByAreaInfo(areaList.value[areaActiveIndex.value])
    })

    // 刷新摄像头列表数据
    if (deviceListRef.value) {
      deviceListRef.value?.getManagementInfo('refresh')
    }
  } catch (error: any) {
    if (error.data.code === -21) {
      message.error('算法配置超过7个，请删除多余算法后保存')
      return
    }
    message.error(error.data.message)
  }
}

/**
 * ----------------------------------------------- 复制AI配置 ---------------------------------------------
 */
const notModified = ref<boolean>(true)
const copyModalRef = ref<InstanceType<typeof CopyModal>>()
const handleOpenCopy = () => {
  const maskingAreaSize = {
    width: video.width || 0,
    height: video.height || 0,
  }
  copyModalRef.value?.openCopyModal(maskingAreaSize)
}

// 监听数据变化
watch(
  () => {
    return {
      areaInfo: areaInfo.value,
      switchChecked: switchChecked.value,
    }
  },
  () => {
    notModified.value = obj2str(cacheData) === obj2str(getUpdateData())
  },
  { deep: true },
)

/**
 * ----------------------------------------------- 路由后置守卫 ---------------------------------------------
 */

onBeforeRouteLeave((to, _from, next) => {
  // 未保存 弹窗确认
  if (obj2str(cacheData) !== obj2str(getUpdateData()) && !beforeRouteLeaveWhiteList.includes(to.path)) {
    const saveLeaveFun = async () => {
      await handleSubmit()
      next()
    }
    noSaveConfirmObj.funObj.noSaveFun = next
    noSaveConfirmObj.funObj.saveFun = saveLeaveFun
    noSaveConfirmObj.visible = true
  } else {
    next()
  }
})

/**
 * ----------------------------------------------- 卸载 ---------------------------------------------
 */
onUnmounted(() => {
  clearTimeout(timer)
  play?.destroy()
  polygon?.destroy()
  document.removeEventListener('keydown', keydown)
})
</script>

<style lang="less" scoped>
@import '../styles/index.less';

.configuration-page {
  width: 100%;
  height: 100%;
  padding: 14px 16px;

  .configuration-page-layout {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    background: rgba(46, 75, 120, 0.15);
    display: flex;
    // gap: 0 16px;
  }

  .configuration-right {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;

    .configuration-head {
      display: flex;
      padding: 0 16px;
    }

    .configuration-content {
      width: 100%;
      height: calc(100% - 56px);
      border-radius: 10px 0px 0px 0px;
      background: rgba(40, 65, 103, 0.5);
      display: flex;

      .editor-container {
        flex: 1;
        height: 100%;
        padding: 14px 20px;
        background: rgba(0, 0, 0, 0.08);
        display: flex;
        flex-direction: column;
        gap: 14px 0;

        .editor-container-head {
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .editor-container-content {
          height: 100%;
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.2);
          background: rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;

          .editor-control {
            width: 100%;
            height: 56px;
            padding: 0 16px;
            display: flex;
            align-items: center;
            gap: 0 24px;
            flex-shrink: 0;

            .radio-group-wrap {
              width: 140px;
            }

            .draw-info {
              flex: 1;
              color: @text3;
              font-size: 14px;
              line-height: 20px;
              display: flex;
              gap: 0 8px;

              .flex {
                display: flex;
                align-items: center;
                font-size: 12px;

                i {
                  margin-right: 9px;
                }
              }

              span {
                font-weight: 700;
              }

              i {
                display: block;
              }
            }

            .control-right {
              display: flex;
              align-items: center;
              gap: 0 10px;
              font-size: 14px;
              color: @text1;
              margin-left: auto;

              &--disable {
                color: @text3;
                background: @border1;
              }

              &:first-child {
                margin-right: 8px;
              }
            }
          }

          .draw-container {
            flex: 1;
            width: 100%;
            overflow: auto;
            border-radius: 2px;
            background: #0e1c32;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: relative;

            .video {
              display: none;
            }

            .video-info {
              position: absolute;
              bottom: 4px;
              left: 8px;
              color: @text1;
              text-shadow: 0px 0px 2px rgba(2, 36, 59, 0.8);
              font-size: 12px;
              font-weight: 700;
              line-height: 20px;
            }

            .video-empty {
              position: absolute;
              text-align: center;
              color: @text1;

              img {
                width: 48px;
                height: 48px;
              }

              .loading {
                animation: rotate 2s linear infinite;
              }

              .empty-description {
                font-weight: 400;
                font-size: 14px;
                line-height: 22px;
                text-align: center;
                color: @text2;
              }
            }
          }
        }
      }
    }
  }
}
</style>
