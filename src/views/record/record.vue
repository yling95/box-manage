<template>
  <div class="record-page">
    <img src="@/assets/images/record/top_line.png" style="height: 10px; margin: 20px 20px 0" />
    <div class="screen">
      <div style="display: flex; align-items: center; gap: 12px">
        <a-input
          style="width: 240px"
          placeholder="人员姓名/ID"
          v-model:value="pageForm.person"
          allowClear
          @press-enter="handleSearch"
          @change="!pageForm.person && handleSearch()"
        >
          <template #prefix>
            <i class="iconfont icon-search-line"></i>
          </template>
        </a-input>
        <div style="min-width: 90px">
          <a-select
            :loading="aiListLoading"
            v-model:value="pageForm.aiName"
            class="select-item"
            :class="[pageForm?.aiName.length && 'active ant-select-focused']"
            mode="multiple"
            :max-tag-count="2"
            placeholder="AI服务"
            :options="aiList"
            @change="handleSearch()"
            allow-clear
            :showSearch="false"
            showArrow
            style="width: 100%; max-width: 380px"
          >
            <template #suffixIcon>
              <i class="iconfont icon-arrow-down-s-fill"></i>
            </template>
            <template #clearIcon>
              <i class="iconfont icon-close-circle-fill" style="color: #fff"></i>
            </template>
          </a-select>
        </div>
        <div style="background: rgba(255, 255, 255, 0.05); width: 2px; height: 14px"></div>
        <div style="min-width: 90px">
          <a-select
            :loading="aiListLoading"
            v-model:value="pageForm.algorithmLinkageAlarm"
            class="select-item"
            :class="[pageForm?.algorithmLinkageAlarm.length && 'active ant-select-focused']"
            mode="multiple"
            :max-tag-count="1"
            placeholder="联动报警"
            :options="algoLinkList"
            @change="handleSearch()"
            allow-clear
            :showSearch="false"
            showArrow
            style="width: 100%; max-width: 380px"
          >
            <template #suffixIcon>
              <i class="iconfont icon-arrow-down-s-fill"></i>
            </template>
            <template #clearIcon>
              <i class="iconfont icon-close-circle-fill" style="color: #fff"></i>
            </template>
          </a-select>
        </div>
        <div style="background: rgba(255, 255, 255, 0.05); width: 2px; height: 14px"></div>
        <div style="min-width: 142px">
          <a-cascader
            class="select-item"
            :class="[pageForm?.names.length && 'active ant-select-focused']"
            :loading="deviceListLoading"
            v-model:value="pageForm.names"
            :max-tag-count="2"
            multiple
            :options="deviceList"
            expand-trigger="hover"
            placeholder="场景位置/设备"
            @change="handleSearch()"
            allow-clear
            showArrow
            style="max-width: 400px"
          >
            <template #suffixIcon>
              <i class="iconfont icon-arrow-down-s-fill"></i>
            </template>
            <template #clearIcon>
              <i class="iconfont icon-close-circle-fill" style="color: #fff"></i>
            </template>
          </a-cascader>
        </div>
      </div>

      <div style="display: flex">
        <ul class="select-list">
          <li
            class="select-list-item"
            :class="[activeTimeIndex === index && 'select-list-item--active']"
            @click="changeTime(index, item.value)"
            v-for="(item, index) in presetTime"
            :key="item.value"
          >
            {{ item.text }}
          </li>
          <!-- <li v-if="!timeModalVisible && !visible" class="select-list-item" @click="customTimeBtn">自定义时间</li> -->
          <li>
            <a-range-picker
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="range-picker"
              :class="[searchTime && 'active']"
              :value="[createBeginVal, createEndVal]"
              @calendarChange="onCalendarChange"
              show-time
              inputReadOnly
              @change="handleCustomTime"
            />
          </li>
        </ul>
      </div>
    </div>
    <a-checkbox-group v-model:value="checkedList" class="card-wrap" @change="onCheckboxGroupChange">
      <a-spin :spinning="cardLoading" class="loading">
        <div style="display: flex; justify-content: center">
          <a-empty style="padding-top: 216px" v-if="!cardLoading && dataList?.length === 0" :image="simpleImage">
            <template #description>
              <span style="color: rgba(255, 255, 255, 0.45)"> 无数据 </span>
            </template>
          </a-empty>
        </div>
        <div class="card-list" :style="{ paddingBottom: isOpenSelect ? '110px' : '60px' }">
          <label
            :for="isOpenSelect ? item.id : ''"
            :id="`card-list-item-${index}`"
            :class="['card-list-item', isOpenSelect && 'checked', alarmModalActiveIndex === index && 'active']"
            @click="handleClickItem(item, index)"
            v-for="(item, index) in dataList"
            :key="item.id"
            :tabindex="alarmModalActiveIndex === index ? 0 : -1"
          >
            <div class="mask"></div>
            <p class="senceName" v-if="item.senceName">
              {{ item?.senceName ? item?.senceName + '-' : '' }}{{ item?.deviceName }}
            </p>
            <div class="img-wrap">
              <img
                :data-src="getRealUrl(item.eventImg)"
                class="lazyload"
                :onerror="(e: any) => {
                e.target.src = defaultImage
                e.target.onerror = null
              }
                "
              />
            </div>
            <ul>
              <li>
                <!--  -->
                <div class="title-wrap">
                  <span class="name"> {{ item.aiAlarmName || '' }}</span>
                  <a-tooltip>
                    <template #title> 与【人脸识别】算法产生报警联动 </template>
                    <i
                      class="iconfont algoLinkIcon icon-links-line"
                      v-if="
                        item.algorithmLinkageAlarm !== null &&
                        item.algorithmLinkageAlarm !== undefined &&
                        item.algorithmLinkageAlarm !== -1
                      "
                    ></i>
                  </a-tooltip>
                  <div class="media-tag sm" v-if="item.eventType === 1">
                    <i class="iconfont icon-play-fill"></i>
                    视频
                  </div>
                </div>
                <p>{{ item.eventTime }}</p>
              </li>
              <li></li>
            </ul>
            <div class="right-top" v-auth="'record-select'" v-show="isOpenSelect" @click.stop>
              <a-checkbox :id="'' + item.id" :value="item.id"></a-checkbox>
            </div>
          </label>
        </div>
      </a-spin>
    </a-checkbox-group>

    <div class="suspend">
      <div class="suspend-operate" v-if="isOpenSelect">
        <div class="suspend-operate-select">
          <a-checkbox v-model:checked="checkAll" @change="handleCheckAll">全选本页</a-checkbox>
          <span></span>
          <p>已选中{{ checkedList.length }}条</p>
        </div>
        <div class="suspend-operate-btns">
          <a-button
            type="default"
            class="icon-button"
            :disabled="checkedList.length === 0 || exportDisabled"
            @click="handleExport(1)"
          >
            <i class="iconfont icon-image-edit-line"></i>
            导出标注图
          </a-button>
          <a-button
            type="default"
            class="icon-button"
            :disabled="checkedList.length === 0 || exportDisabled"
            @click="handleExport(0)"
          >
            <i class="iconfont icon-image-line"></i>
            导出原图
          </a-button>
        </div>
      </div>
      <div class="suspend-pagination">
        <a-button
          type="default"
          class="icon-button"
          :class="[isOpenSelect && 'icon-select-button']"
          @click="handleOpenSelect"
          v-auth="'record-select'"
          v-if="!isOpenSelect"
        >
          <i class="iconfont icon-arrow-up-s-fill"></i>
          选择
        </a-button>
        <a-button
          v-else
          type="default"
          class="icon-button"
          :class="[isOpenSelect && 'icon-select-button']"
          @click="handleOpenSelect"
          v-auth="'record-select'"
        >
          <i class="iconfont icon-close-line"></i>
          取消
        </a-button>
        <div class="pagination">
          <a-pagination
            size="small"
            :current="pageForm.offset"
            :page-size="pageForm.limit"
            :total="pageForm.total"
            :show-total="(total: number) => `共${total}条记录`"
            :showSizeChanger="true"
            @change="onPaginationChange"
            :pageSizeOptions="['50', '100', '200']"
          />
        </div>
      </div>
    </div>
  </div>
  <g-preview-record-modal
    ref="alarmModalRef"
    :active-index="alarmModalActiveIndex"
    :hide-prev="hidePrev"
    :hide-next="hideNext"
    :recordFaceData="recordFaceData"
    :showChangeOriginalImg="true"
    @next="nextImage"
    @prev="prevImage"
    @close="onAlarmModalClose"
  />
</template>

<script setup lang="ts">
import useList from '@/hooks/useList'
import dayjs, { Dayjs } from 'dayjs'
import { useRoute, useRouter } from 'vue-router'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { recordApi, aiApi } from '@/services/api'
import { useRequest } from 'vue-request'
import { getRealUrl } from '@/utils/utils'
import simpleImage from '@/assets/images/alarm/icon_list_empty.png'
import gPreviewRecordModal, { CarouselDataProps } from '@/components/g-preview-record-modal.vue'
import defaultImage from '@/assets/images/alarm/no-img.png'
import { useGlobalStore } from '@/store/global'
import { message } from 'ant-design-vue'
import { ServiceEnum } from '@/views/system/ai-service/config'

const router = useRouter()
const route = useRoute()

// [['默认场景', 'fcafdcacaca'], ['默认场景', '杨佳豪的设备1'], ['默认场景', '1'], ['场景1'], ['场景5']]
type RangeValue = [Dayjs, Dayjs]
const timeModalVisible = ref(false)
const visible = ref(false)
// const simpleImage = ref('@/assets/images/alarm/icon_list_empty.png')
const names = JSON.parse(sessionStorage.getItem('names') || '[]')
const globalStore = useGlobalStore()
const { updateLoading } = globalStore

const algoLinkList = ref([
  {
    value: ServiceEnum.FACE_RECOGNITION,
    label: '人脸识别检测',
  },
])

onMounted(async () => {
  // 读取路由搜索人员参数
  const queryPersonName = route.query.personName
  if (queryPersonName) {
    pageForm.person = queryPersonName as string
    router.replace({ query: undefined })
  }

  await runGetRecordCenter()
  await runGetAiList({ isAlgoHistory: true })
  // 默认搜索今日的时间
  const createBegin = dayjs()
    .subtract(1 - 1, 'days')
    .startOf('day')
    .format('YYYY-MM-DD HH:mm:ss')
  const createEnd = dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss.999')
  pageForm.startTime = createBegin
  pageForm.endTime = createEnd
  createBeginVal.value = undefined
  createEndVal.value = undefined

  await handleSearch()
  sessionStorage.removeItem('names')
})

onUnmounted(() => {
  sessionStorage.removeItem('names')
})

const alarmModalRef = ref<InstanceType<typeof gPreviewRecordModal>>()
// 自定义时间弹窗确认
// const handleTimeSubmit = () => {
//   timeModalVisible.value = false
//   visible.value = true
// }
//打开自定义事件弹窗
// const customTimeBtn = () => {
//   timeModalVisible.value = true
// }
// AI服务列表
const {
  loading: aiListLoading,
  data: aiList,
  runAsync: runGetAiList,
} = useRequest<any, any>(aiApi.getAiList, {
  onSuccess: ({ data }) => {
    aiList.value = data?.map((item: any) => ({
      label: item.aiSrvName,
      value: item.aiSrvName,
    }))
  },
})

// 设备列表
const {
  loading: deviceListLoading,
  data: deviceList,
  runAsync: runGetRecordCenter,
} = useRequest<any, any>(recordApi.getRecordCenter, {
  onSuccess: ({ data }) => {
    deviceList.value = data || []
  },
})
// 时间过滤
const createBeginVal = ref<any>()
const createEndVal = ref<any>()
// 预设时间段
const presetTime = ref<any>([
  {
    text: '今日',
    value: 1,
  },
  {
    text: '近7天',
    value: 7,
  },
  {
    text: '近30天',
    value: 30,
  },
])
const activeTimeIndex = ref<number>(0)
const searchTime = ref<RangeValue | undefined>(undefined)
const changeTime = (index: number, day: number) => {
  if (index === activeTimeIndex.value) {
    // activeTimeIndex.value = -1
    // getDataList()
    // handleReset()
    return
  }
  activeTimeIndex.value = index
  getTimeRange(day)
  visible.value = false
}

const onCalendarChange = (dates: any, date: string[]): void => {
  activeTimeIndex.value = -1
  if (dates === null) {
    pageForm.startTime = ''
    pageForm.endTime = ''
    createBeginVal.value = ''
    createEndVal.value = ''
    getDataList()
  }
  if (date[0] !== '' && date[1] !== '') {
    if (dates[0] !== '') {
      pageForm.startTime = `${date[0]}`
      createBeginVal.value = `${date[0]}`
    }
    if (dates[1] !== '') {
      pageForm.endTime = `${date[1]}.999`
      createEndVal.value = `${date[1]}`
    }
    getDataList()
  }
}

// 根据传入的天数，获取以当前时间基准的时间范围
const getTimeRange = (day: number): void => {
  const createBegin = dayjs()
    .subtract(day - 1, 'days')
    .startOf('day')
    .format('YYYY-MM-DD HH:mm:ss')
  const createEnd = dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss.999')
  pageForm.startTime = createBegin
  pageForm.endTime = createEnd
  createBeginVal.value = undefined
  createEndVal.value = undefined
  getDataList({ ...pageForm, offset: 1 })
  pageForm.offset = 1
}
const handleCustomTime = () => {
  if (createEndVal.value && createBeginVal.value) {
    timeModalVisible.value = false
    visible.value = true
  } else {
    visible.value = false
  }
}
// 查询
const handleSearch = () => {
  const sceneName: any[] = []
  const deviceName: any[] = []
  pageForm.names?.forEach((item: any) => {
    if (!sceneName.includes(item[0])) {
      sceneName.push(item[0])
    }
    if (item.length === 1) {
      deviceList.value.forEach((device: any) => {
        if (device.value === item[0]) {
          device.children.forEach((item: any) => {
            deviceName.push(item.value)
          })
        }
      })
    }
    if (!deviceName.includes(item[1]) && item.length > 1) {
      deviceName.push(item[1])
    }
  })
  pageForm.sceneName = sceneName as unknown as any
  pageForm.deviceName = deviceName as unknown as any
  getDataList({ ...pageForm, offset: 1 })
  // changeTime(0, 1)
}

const hidePrev = ref(false)
const hideNext = ref(false)
const alarmModalActiveIndex = ref(-1)
const recordFaceData = ref([])

// 下一张
const nextImage = async () => {
  alarmModalActiveIndex.value++
  await getRecordDetail(dataList.value[alarmModalActiveIndex.value])
  if (hidePrevAndNext(alarmModalActiveIndex.value) === 1) {
    message.info('已是最后一张')
    alarmModalActiveIndex.value = dataList.value.length - 1
    return
  }
  if (pageForm.offset === pageForm.pages) return
  if (alarmModalActiveIndex.value <= dataList.value.length - 1) {
    return
  }
  await getDataList({ offset: pageForm.offset + 1 })
  alarmModalActiveIndex.value = 0
  nextTick(() => {
    const data = dataListToModalList(dataList.value)
    alarmModalRef.value?.changeData(data)
    getRecordDetail(dataList.value[alarmModalActiveIndex.value])
  })
}

// 上一张
const prevImage = async () => {
  alarmModalActiveIndex.value--
  // message.info('已是第一张')
  console.log('666', alarmModalActiveIndex)
  await getRecordDetail(dataList.value[alarmModalActiveIndex.value])
  if (hidePrevAndNext(alarmModalActiveIndex.value) === -1) {
    message.info('已是第一张')
    alarmModalActiveIndex.value = 0
    return
  }
  if (pageForm.offset === 1) return
  if (alarmModalActiveIndex.value >= 0) {
    return
  }
  await getDataList({ offset: pageForm.offset - 1 })
  alarmModalActiveIndex.value = dataList.value.length - 1
  nextTick(() => {
    const data = dataListToModalList(dataList.value)
    alarmModalRef.value?.changeData(data)
    getRecordDetail(dataList.value[alarmModalActiveIndex.value])
  })
}

// 改变上一张下一张按钮的显示
const hidePrevAndNext = (index: number) => {
  hidePrev.value = false
  hideNext.value = false
  if (pageForm.offset === 1 && index <= 0) {
    hidePrev.value = true
    return -1
  }
  if (pageForm.offset === pageForm.pages && index >= dataList.value.length - 1) {
    hideNext.value = true
    return 1
  }

  return 0
}

const { runAsync: runGetRecordDetail } = useRequest(recordApi.recordDetail)
const getRecordDetail = async (item: any) => {
  try {
    // 有算法联动的时候，查询人脸识别记录
    if (item && item.algorithmLinkageAlarm !== null && item.algorithmLinkageAlarm !== -1) {
      const { data } = await runGetRecordDetail(item.id)
      recordFaceData.value = data || []
    } else {
      recordFaceData.value = []
    }
  } catch {}
}

// 点击卡片
const handleClickItem = async (_item: any, index: number) => {
  if (isOpenSelect.value) return
  hidePrevAndNext(index)
  const data = dataListToModalList(dataList.value)
  alarmModalActiveIndex.value = index
  await getRecordDetail(dataList.value[index])
  alarmModalRef.value?.openModal(data, index)
}

// 数据转换
const dataListToModalList = (dataList: any[]) => {
  return dataList.map((item) => {
    return {
      id: item.id,
      tag: item.aiAlarmName,
      time: item.eventTime,
      image: getRealUrl(item.eventImg),
      video: getRealUrl(item.eventFile),
      title: item?.senceName,
      subTitle: item?.deviceName,
      downLoadLink: getRealUrl(item.eventImg),
      type: item.eventType === 0 ? 'image' : 'video',
    }
  }) as CarouselDataProps[]
}

const onAlarmModalClose = () => {
  const domId = `card-list-item-${alarmModalActiveIndex.value}`
  const dom = document.getElementById(domId)
  dom?.focus()
  dom?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'center',
  })
}

// // 重置
// const handleReset = () => {
//   Object.assign(pageForm, { startTime: '', endTime: '' })
//   activeTimeIndex.value = -1
//   getDataList()
// }

const {
  loading: cardLoading,
  dataList,
  getDataList,
  pageForm,
} = useList(
  recordApi.getRecordList,
  {
    aiName: [],
    names: names || [],
    sceneName: [],
    deviceName: [],
    startTime: '',
    endTime: '',
    person: '',
    algorithmLinkageAlarm: [],
    offset: 1,
    limit: 50,
  },
  () => {
    document.querySelector('.card-wrap')?.scrollTo(0, 0)
  },
)

const onPaginationChange = (page: number, pageSize: number) => {
  checkAll.value = false
  checkedList.value = []
  getDataList({ offset: page, limit: pageSize })
}

/**
 * 选中的列表
 */
const checkedList = ref<any[]>([])
const checkAll = ref<boolean>(false)
const isOpenSelect = ref<boolean>(false)
const exportDisabled = ref<boolean>(false)
// 全选、反选
const handleCheckAll = (e: any) => {
  checkAll.value = e.target.checked
  if (checkAll.value) {
    checkedList.value = dataList.value.map((item: any) => item.id)
  } else {
    checkedList.value = []
  }
}
const onCheckboxGroupChange = (checkedList: any[]) => {
  isOpenSelect.value = true
  checkAll.value = checkedList.length === dataList.value.length
}
const handleOpenSelect = () => {
  isOpenSelect.value = !isOpenSelect.value
  checkedList.value = []
  checkAll.value = false
}

const handleExport = async (imageType: 0 | 1) => {
  exportDisabled.value = true
  try {
    updateLoading(true, { tip: '正在导出，请稍后...' })
    // 0原图 1标注图
    if (imageType === 0) {
      await recordApi.recordExportOriginal({ selectIds: checkedList.value.toString() })
    } else {
      await recordApi.recordExport({ selectIds: checkedList.value.toString() })
    }
    exportDisabled.value = false
    isOpenSelect.value = false
    checkedList.value = []
    checkAll.value = false
    updateLoading(false)
  } catch (error) {
    exportDisabled.value = false
    updateLoading(false)
  }
}
</script>
<style lang="less">
.screen {
  .ant-picker {
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.15);
  }

  .ant-select-selection-item-content {
    padding: 2px 6px;
    max-width: 100px;
  }

  .ant-select {
    width: 100%;

    .ant-select-selection-placeholder {
      color: @text2;
    }

    &.active {
      border-radius: 6px;
    }
  }

  .ant-select-selector {
    border: none !important;
    background: transparent !important;
  }

  .ant-select-arrow {
    margin-top: -8px !important;
  }

  .icon-arrow-down-s-fill {
    color: @text2;
  }
}
</style>
<style lang="less" scoped>
:deep(.ant-checkbox-inner) {
  background-color: #fff !important;
}

:deep(.ant-checkbox-checked) {
  .ant-checkbox-inner {
    background-color: #1a6ff3 !important;
  }
}

.icon-close-line {
  font-size: 14px !important;
}

.record-page {
  height: 100%;
  display: flex;
  flex-direction: column;

  .screen {
    display: flex;
    flex-shrink: 0;
    height: 64px;
    align-items: center;
    padding: 3px 40px 0;
    justify-content: space-between;
    gap: 0 12px;

    .select-list {
      flex-shrink: 0;
      display: flex;
      font-size: 14px;
      color: @text2;
      margin: 0 0 0 40px;

      .select-list-item {
        flex-shrink: 0;
        cursor: pointer;
        padding: 8px 16px;
        line-height: 20px;
        border-radius: 6px;
        position: relative;
        margin: 0 6px;

        &:hover,
        &--active {
          background: @mask1;
          border-radius: 6px;
          display: flex;
          height: 36px;
          padding: 8px 16px;
          justify-content: center;
          align-items: center;
          color: @text2;
          gap: 10px;
        }

        &--active {
          background-color: #305dc2 !important;
        }

        // 分割线
        &::after {
          content: '';
          position: absolute;
          right: -6px;
          top: 50%;
          transform: translateY(-50%);
          width: 1px;
          height: 14px;
          background: rgba(255, 255, 255, 0.1);
        }

        &:last-child {
          &::after {
            display: none;
          }
        }
      }
    }

    .range-picker {
      width: 350px;
      flex-shrink: 0;

      &.active {
        width: 308px;
      }
    }

    .icon-refresh-line {
      font-size: 14px;
    }

    .icon-reset-button {
      color: @text3;
    }
  }

  .senceName {
    position: absolute;
    overflow: hidden;
    color: @text1;
    text-overflow: ellipsis;
    text-shadow: 0px 0px 2px rgba(2, 36, 59, 0.8);
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: 22px;
    bottom: 30px;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.6) 100%);
    display: flex;
    width: calc(100% - 8px);
    padding: 2px 4px;
    flex-direction: column;
    align-items: flex-start;
    display: none;
  }

  .mask {
    position: absolute;
    top: 0;
    width: calc(100% - 8px);
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 100%);
    display: flex;
    height: 30px;
    padding: 2px 10px;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
    display: none;
  }

  .card-wrap {
    flex: 1;
    overflow: auto;
    width: 100%;

    .card-list {
      display: grid;
      gap: 10px;
      grid-template-columns: repeat(auto-fill, minmax(274px, 1fr));
      padding: 16px 16px 63px;

      .card-list-item {
        // height: 212px;
        padding: 4px;
        border-radius: 6px;
        position: relative;
        cursor: pointer;
        border: 1px solid @border3;
        background: rgba(72, 145, 255, 0.06);
        box-shadow: 0px 2px 8px 0px rgba(37, 37, 45, 0.14), 0px 1px 3px 0px rgba(37, 37, 45, 0.14);

        .img-wrap {
          width: 100%;
          height: 178px;

          > img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 2px;
          }
        }

        > ul {
          margin-top: 4px;

          > li {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0 4px;
            font-size: 12px;
            color: @text1;
            line-height: 20px;
            padding: 0 4px;
            position: relative;

            a-tooltip {
              position: absolute;
              z-index: 2;
            }

            > i {
              color: @textSecondary2;
              font-size: 12px;
            }

            > p {
              .ellipsis();
              color: #7594c2;
            }

            &:last-child {
              color: @text2;
            }
          }
        }

        .title-wrap {
          color: @text1;
          text-align: center;
          font-size: 14px;
          font-style: normal;
          font-weight: 700;
          line-height: 22px;
          margin-bottom: 2px;
          display: flex;
          align-items: center;
          gap: 0 4px;

          .name {
            max-width: 112px;
            .ellipsis();
          }

          .algoLinkIcon {
            font-size: 14px;
            margin-left: 4px;
            font-weight: 400;
            color: @primary2;
          }
        }

        .right-top {
          position: absolute;
          top: 6px;
          right: 8px;
        }

        &:hover,
        &.checked {
          background: rgba(72, 145, 255, 0.2);
          border-radius: 6px;
          border: 1px solid @mask3;
          box-shadow: 0px 2px 8px 0px rgba(37, 37, 45, 0.14), 0px 1px 3px 0px rgba(37, 37, 45, 0.14);

          .mask {
            display: block;
            margin-top: 4px;
          }

          .senceName {
            display: block;
          }

          .right-top {
            display: block !important;
          }

          &::before {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            left: 0;
            top: 0;
          }
        }

        &:focus {
          outline: none;
        }

        &.active {
          &:focus {
            border: 2px solid @primary1;
            border-radius: 6px;
            background: rgba(26, 111, 243, 0.5);
            box-shadow: 0px 2px 8px 0px rgba(37, 37, 45, 0.14), 0px 1px 3px 0px rgba(37, 37, 45, 0.14);
          }
        }
      }
    }
  }

  .suspend {
    width: 100%;
    position: fixed;
    bottom: 0;
    border-top: 1px solid @border3;
    background: linear-gradient(180deg, #203a63 0%, #0e203d 100%), #132238;

    box-shadow: 0px -3.4px 5.85px 0px rgba(2, 36, 59, 0.03), 0px -17px 36px 0px rgba(2, 36, 59, 0.06);

    .suspend-operate {
      display: flex;
      align-items: center;
      height: 48px;
      border-bottom: 1px solid @border1;
      padding-left: 24px;

      .suspend-operate-select {
        display: flex;
        align-items: center;
        padding-right: 24px;

        p {
          color: @primary2;
          font-weight: 400;
          font-size: 14px;
        }

        span {
          background: rgba(255, 255, 255, 0.05);
          display: block;
          margin: 0 24px;
          width: 1px;
          height: 20px;
        }
      }

      .suspend-operate-btns {
        height: 100%;
        display: flex;
        align-items: center;
        gap: 0 12px;
        padding-left: 24px;
        border-left: 1px solid @border1;
      }
    }

    .suspend-pagination {
      height: 48px;
      display: flex;
      align-items: center;
      padding: 0 24px;
      position: relative;

      .pagination {
        margin: 0 auto;
      }

      .icon-button {
        position: absolute;
      }

      .icon-select-button {
        border-radius: 8px;
        border: 1px solid @border2;
        background: @mask2;
      }
    }
  }
}
</style>
