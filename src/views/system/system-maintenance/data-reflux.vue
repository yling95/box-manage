<template>
  <div class="data-reflux">
    <div class="screen">
      <div style="display: flex; align-items: center; gap: 12px">
        <div style="min-width: 90px">
          <a-select
            :loading="aiListLoading"
            v-model:value="pageForm.aiSrvTypeList"
            class="select-item"
            :class="[pageForm?.aiSrvTypeList.length && 'active ant-select-focused']"
            mode="multiple"
            :max-tag-count="2"
            placeholder="AI服务"
            :options="aiList"
            @change="handleSearch()"
            allow-clear
            :showSearch="false"
            showArrow
            style="width: 100%; max-width: 380px; white-space: nowrap"
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
            :class="[pageForm?.deviceIds.length && 'active ant-select-focused']"
            :loading="deviceListLoading"
            v-model:value="pageForm.deviceIds"
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
        <div style="background: rgba(255, 255, 255, 0.05); width: 2px; height: 14px"></div>
        <div style="min-width: 142px">
          <a-select
            :loading="aiListLoading"
            v-model:value="pageForm.model"
            class="select-item"
            placeholder="回流策略"
            :options="refluxStrategyList"
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
      </div>

      <div style="display: flex; align-items: center">
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
        <div class="task-list-btn" @click="taskOpenBtn" id="taskBtnID">
          <div class="task-list-num" v-if="taskStore.taskDataList.length">{{ taskStore.taskDataList.length }}</div>
          <i class="iconfont icon-tasklist-line"></i>
        </div>
      </div>
    </div>
    <a-checkbox-group
      v-model:value="checkedList"
      :class="['card-wrap', { 'card-wrap--loading-wrap': cardLoading }]"
      @change="onCheckboxGroupChange"
    >
      <a-spin :spinning="cardLoading" size="small">
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
            <p class="senceName">{{ item?.locationName ? item?.locationName + '-' : '' }}{{ item?.deviceName }}</p>
            <div class="img-wrap">
              <img
                :data-src="getRealUrl(item.firstImage)"
                class="lazyload"
                :onerror="
                    (e:any) => {
                      e.target.src = defaultImage
                      e.target.onerror = null 
                    }
                  "
              />
            </div>
            <ul>
              <li>
                <div class="title-wrap" :title="item.alarmName">
                  {{ item.alarmName ? item.alarmName : '-' }}
                </div>
                <p>{{ timePeriodFormat(item.startTime, item.endTime) }}</p>
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
            @click="handleExport"
          >
            <i class="iconfont icon-upload-2-line"></i>
            导出
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
            :pageSizeOptions="['20']"
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
    @next="nextImage"
    @prev="prevImage"
    @close="onAlarmModalClose"
  />
  <taskListBar :buttonId="'taskBtnID'" :taskType="1" v-model:visible="taskListBarVisible"></taskListBar>
</template>

<script lang="ts" setup>
import useList from '@/hooks/useList'
import dayjs, { Dayjs } from 'dayjs'
import { aiApi, reflowApi } from '@/services/api'
import { onMounted, onUnmounted, ref, nextTick, reactive } from 'vue'
import { useRequest } from 'vue-request'
import { useGlobalStore } from '@/store/global'
import { getRealUrl } from '@/utils/utils'
import gPreviewRecordModal, { CarouselDataProps } from '@/components/g-preview-record-modal.vue'
import { message } from 'ant-design-vue'
import simpleImage from '@/assets/images/alarm/icon_list_empty.png'
import defaultImage from '@/assets/images/alarm/no-img.png'
import { useTaskStore } from '@/store/task'
import taskListBar from './_components/task-list-bar.vue'

const taskStore = useTaskStore()
const globalStore = useGlobalStore()
const { updateLoading } = globalStore

const refluxStrategyList = reactive([
  {
    value: 0,
    label: '算法报警回流',
  },
  {
    value: 1,
    label: '录像回流',
  },
])

// 打开/关闭任务队列
const taskListBarVisible = ref<boolean>(false)
const taskOpenBtn = () => {
  taskListBarVisible.value = !taskListBarVisible.value
}

type RangeValue = [Dayjs, Dayjs]
const alarmModalRef = ref<InstanceType<typeof gPreviewRecordModal>>()
const timeModalVisible = ref(false)
const visible = ref(false)

const {
  loading: cardLoading,
  dataList,
  getDataList,
  pageForm,
} = useList(
  reflowApi.getReflowRecordList,
  {
    aiSrvTypeList: [],
    model: undefined,
    deviceIds: [],
    deviceIdList: [],
    startTime: '',
    endTime: '',
    offset: 1,
    limit: 20,
  },
  () => {
    document.querySelector('.card-wrap')?.scrollTo(0, 0)
  },
)
// AI服务列表
const {
  loading: aiListLoading,
  data: aiList,
  runAsync: runGetAiList,
} = useRequest<any, any>(aiApi.getAiList, {
  onSuccess: ({ data }) => {
    aiList.value = data?.map((item: any) => ({
      label: item.aiSrvName,
      value: item.aiSrvId,
    }))
  },
})

// 设备列表
const {
  loading: deviceListLoading,
  data: deviceList,
  runAsync: runGetRecordCenter,
} = useRequest<any, any>(reflowApi.getDeviceOptions, {
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
  dataList.value = []
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
  dataList.value = []
  const deviceIdList: any[] = []
  pageForm.deviceIds?.forEach((item: any) => {
    if (item.length === 1) {
      deviceList.value.forEach((device: any) => {
        if (device.value === item[0]) {
          device.children.forEach((item: any) => {
            deviceIdList.push(item.value)
          })
        }
      })
    }
    if (!deviceIdList.includes(item[1]) && item.length > 1) {
      deviceIdList.push(item[1])
    }
  })
  pageForm.deviceIdList = deviceIdList as unknown as any

  getDataList({ ...pageForm, offset: 1 })
}

const timePeriodFormat = (startTime: string, endTime: string) => {
  // 提取开始时间的年月日
  const date = startTime.split(' ')[0]

  // 提取开始时间和结束时间的时分秒
  const startTimePart = startTime.includes('.') ? startTime.split(' ')[1].split('.')[0] : startTime
  const endTimePart = endTime.includes('.') ? endTime.split(' ')[1].split('.')[0] : endTime

  // 组装成需要的格式
  const formattedTime = `${date} ${startTimePart}至${endTimePart}`

  // 输出: 2024-05-21 09:33:42至09:39:20
  return formattedTime
}

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

const handleExport = async () => {
  exportDisabled.value = true
  try {
    updateLoading(true, { tip: '正在导出，请稍后...' })
    let params = {
      recordIdList: checkedList.value,
      retryMark: 0,
    }
    await reflowApi.exportReflowRecord(params)
    exportDisabled.value = false
    isOpenSelect.value = false
    checkedList.value = []
    checkAll.value = false
    updateLoading(false)
    await taskStore.getTaskList(1)
    message.info('已加入导出任务队列， 请前往任务栏查看！')
  } catch (error) {
    exportDisabled.value = false
    updateLoading(false)
  }
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
// 数据转换
const dataListToModalList = (dataList: any[]) => {
  return dataList.map((item) => {
    return {
      id: item.id,
      alarmName: item?.alarmName,
      time: timePeriodFormat(item.startTime, item.endTime),
      video: getRealUrl(item.fileUrl),
      title: item?.locationName,
      subTitle: item?.deviceName,
      downLoadLink: getRealUrl(item.fileUrl),
      type: 'onlyVideo',
    }
  }) as CarouselDataProps[]
}

// 点击卡片
const handleClickItem = async (_item: any, index: number) => {
  if (isOpenSelect.value) return
  hidePrevAndNext(index)
  const data = dataListToModalList(dataList.value)
  alarmModalActiveIndex.value = index
  alarmModalRef.value?.openModal(data, index)
}

const hidePrev = ref(false)
const hideNext = ref(false)
const alarmModalActiveIndex = ref(-1)
const recordFaceData = ref([])

// 下一张
const nextImage = async () => {
  alarmModalActiveIndex.value++
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
  })
}

// 上一张
const prevImage = async () => {
  alarmModalActiveIndex.value--
  // message.info('已是第一张')
  console.log('666', alarmModalActiveIndex)
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
  })
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

onMounted(async () => {
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
  getDataList()
})

onUnmounted(() => {
  sessionStorage.removeItem('names')
})
</script>

<style lang="less">
.task-list-btn {
  border-radius: 8px;
  border: 1px solid #4b5266;
  background: rgba(255, 255, 255, 0.08);

  /* 淡阴影/淡SS */
  box-shadow: 0px 1px 2px 0px rgba(2, 36, 59, 0.03);
  display: flex;
  width: 38px;
  // height: 26px;
  height: 36px;
  padding: 8px 10px;
  padding: 5px;
  justify-content: center;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  color: #fff;
  // position: absolute;
  // right: 122px;
  margin-left: 16px;
  cursor: pointer;
  .task-list-num {
    color: #fff;
    height: 16px;
    position: absolute;
    transform: translate(calc(100% - 8px), -86%);
    padding: 0 6px;
    border-radius: 100px;
    font-size: 12px;
    line-height: 14px;
    border: 1px solid rgba(255, 255, 255, 0.4);
    background: #fa7260;
  }
}
.select-item {
  white-space: nowrap;
}
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
.data-reflux {
  height: 100%;
  display: flex;
  position: relative;
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
    &--loading-wrap {
      width: 100px;
      overflow: hidden;
      margin: 0 auto;
      padding-top: 100px;
    }
    .card-list {
      display: grid;
      gap: 10px;
      grid-template-columns: repeat(auto-fill, minmax(274px, 1fr));
      padding: 16px 16px 10px;

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
          text-align: left;
          font-size: 14px;
          font-style: normal;
          font-weight: 700;
          line-height: 22px;
          margin-bottom: 2px;
          .ellipsis();
          flex: 1;
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
    border-top: 1px solid @border3;
    background: linear-gradient(180deg, #203a63 0%, #0e203d 100%), #132238;

    box-shadow: 0px -3.4px 5.85px 0px rgba(2, 36, 59, 0.03), 0px -17px 36px 0px rgba(2, 36, 59, 0.06);
    border-radius: 0 0 8px 8px;
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
