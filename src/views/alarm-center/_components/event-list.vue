<template>
  <div class="event-list" :class="[isFullscreen && 'fullscreen']">
    <header>
      <p>报警记录</p>
      <div>
        <a-checkbox
          :disabled="currentConfig.inspectionStatus"
          :checked="currentConfig.warningStatus"
          @click="handleClickAlarm(!currentConfig.warningStatus)"
        >
          仅显示选中
        </a-checkbox>
      </div>
    </header>
    <div class="event-list-wrap">
      <g-empty :empty="alarmList?.length === 0">
        <template #empty>
          <div class="empty-box">
            <img style="width: 80px; height: 80px" src="@/assets/images/alarm/icon_list_empty.png" />
            <p>无数据</p>
          </div>
        </template>
        <a-spin tip="数据加载中..." :spinning="loading">
          <ul class="event-list-card-wrap" @scroll="handleScroll" ref="scrollable">
            <transition-group :name="transitionName">
              <li
                class="event-list-card"
                v-for="item in alarmList"
                :key="item?.id"
                @click="!isFullscreen && handleClickAVatar(item)"
              >
                <img
                  :key="item?.eventImg"
                  :src="getRealUrl(item.eventImg)"
                  :onerror="(e: any) => imageErrorReplaceSrc(e, defaultImage)"
                />
                <div class="event-list-card-info">
                  <div>
                    <!-- <a-tooltip :title="item?.aiAlarmName" :get-popup-container="(e) => (e.parentNode as HTMLElement)"> -->
                    <div class="name">
                      <h4 :title="item?.aiAlarmName">{{ item.aiAlarmName ?? '暂无名称' }}</h4>
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
                    </div>
                    <!-- </a-tooltip> -->
                    <!-- <a-tooltip :title="item?.senceName" :get-popup-container="(e) => (e.parentNode as HTMLElement)"> -->
                    <h6 :title="item.senceName">{{ item.senceName ?? '暂无名称' }}</h6>
                    <!-- </a-tooltip> -->
                    <!-- <a-tooltip :title="item?.deviceName" :get-popup-container="(e) => (e.parentNode as HTMLElement)"> -->
                    <p :title="item.deviceName">{{ item.deviceName ?? '暂无名称' }}</p>
                    <!-- </a-tooltip> -->
                  </div>
                  <!-- <a-tooltip :title="item.eventTime" :get-popup-container="(e) => (e.parentNode as HTMLElement)"> -->
                  <div class="card-time">
                    <p :title="item.eventTime">
                      <span>{{ cutoutTime(item.eventTime) ?? '暂无时间' }}</span>
                    </p>
                    <div class="media-tag sm" v-if="item.eventType === 1">
                      <i class="iconfont icon-play-fill"></i>
                      视频
                    </div>
                  </div>
                  <!-- </a-tooltip> -->
                </div>
              </li>
            </transition-group>
          </ul>
        </a-spin>
      </g-empty>
      <div v-if="alarmList?.length > 0 && complete" class="infinite-loading-tip" @click="loadMore">查看更多</div>
    </div>
    <g-preview-record-modal ref="alarmModalRef" :recordFaceData="recordFaceData" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import usePerfectScrollbar from '@/hooks/usePerfectScrollbar'
import defaultImage from '@/assets/images/alarm/no-img.png'
import { getRealUrl, imageErrorReplaceSrc, cutoutTime, historyCallInterval } from '@/utils/utils'
import gPreviewRecordModal, { CarouselDataProps } from '@/components/g-preview-record-modal.vue'
import { ArrayRecords } from '../interface'
import useList from '@/hooks/useList'
import { warningApi, recordApi } from '@/services/api'
import { useRouter } from 'vue-router'

const props = defineProps({
  isFullscreen: {
    type: Boolean,
    default: false,
  },
  currentConfig: {
    type: Object,
    default: () => ({
      warningStatus: false,
    }),
  },
})

const emits = defineEmits(['on-click-alarm'])

const { init, update, scrollToTop, destroy } = usePerfectScrollbar('.event-list-card-wrap')
const router = useRouter()

// 首次加载
let isFirstLoad = true
onMounted(async () => {
  await getWarningManagementFn()
})

const handleClickAlarm = (bool: boolean) => {
  transitionName.value = ''
  emits('on-click-alarm', bool)
}

const { dataList, loading, pageForm, getDataList } = useList(warningApi.getWarningCenter, {
  offset: 1,
})

const maxList = computed(() => {
  return Math.ceil(pageForm.total / 10)
})

const alarmList = ref<ArrayRecords[]>([])
const getWarningManagementFn = async () => {
  dataList.value = []
  await getDataList({ offset: 1 })
  alarmList.value = dataList.value
  complete.value = false
  nextTick(() => {
    scrollToTop()
    isFirstLoad ? init() : update()
    isFirstLoad = false
  })
}

// 加载数据
const complete = ref(false)
const scrollable = ref<HTMLElement>()
const handleScroll = async () => {
  if (!scrollable.value || loading.value) return
  const scrollDiv = scrollable.value
  // 滚动条已经到达底部
  if (!(scrollDiv.scrollTop + scrollDiv.clientHeight >= scrollDiv.scrollHeight - 0.5)) return
  const newOffset = ++pageForm.offset
  // 滑动大于5次
  if (newOffset > 6) return (complete.value = true)
  // 最大限度
  if (maxList.value < newOffset) return
  await getDataList({ offset: newOffset })
  alarmList.value = alarmList.value?.concat(dataList.value)
  nextTick(() => {
    update()
  })
}

// const timer = setInterval(() => {
//   getData({ id: Date.now() })
// }, 700)

const transitionName = ref('')
const getInterval = historyCallInterval()
const getData = (data: any, cb?: Function) => {
  transitionName.value = getInterval() > 600 ? 'event-list' : ''
  nextTick(() => {
    alarmList.value.unshift(data)
    if (!alarmList.value.length) return
    if (alarmList.value.length > 10) {
      alarmList.value.pop()
    }
  })
  nextTick(() => {
    update()
  })
  cb && cb()
}
const resetData = () => {
  getWarningManagementFn()
}

// 查看记录
const alarmModalRef = ref<InstanceType<typeof AlarmModal>>()
const handleClickAVatar = async (item: ArrayRecords) => {
  const data = [
    {
      id: item.id,
      tag: item.aiAlarmName,
      time: item.eventTime,
      image: getRealUrl(item.eventImg),
      video: getRealUrl(item.eventFile),
      title: item?.senceName,
      subTitle: item?.deviceName,
      downLoadLink: getRealUrl(item.eventImg),
      type: item.eventType === 0 ? 'image' : 'video',
    },
  ] as CarouselDataProps[]
  await getRecordDetail(item)
  alarmModalRef.value?.openModal(data)
}
const recordFaceData = ref()
const getRecordDetail = async (item: any) => {
  try {
    // 有算法联动的时候，查询人脸识别记录
    if (item && item.algorithmLinkageAlarm !== null && item.algorithmLinkageAlarm !== -1) {
      const { data } = await recordApi.recordDetail(item.id)
      recordFaceData.value = data || []
    } else {
      recordFaceData.value = []
    }
  } catch {}
}

// 查看更多
const loadMore = () => {
  const warningStatus = props.currentConfig.warningStatus
  //全部报警
  if (!warningStatus) return router.push(`/record`)
  //仅显示选中
  const deviceIds = props.currentConfig.deviceIds
  const name = deviceIds.map((item: any) => {
    return [item.locationName, item.deviceName]
  })
  const params = JSON.stringify(name)
  sessionStorage.setItem('names', params)
  router.push({ path: '/record' })
}

defineExpose({
  getData,
  resetData,
})

onUnmounted(() => {
  // clearInterval(timer)
  destroy()
})
</script>

<style lang="less" scoped>
.event-list {
  width: 313px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px 0;

  &.fullscreen {
    padding-bottom: 24px;
    padding-top: 24px;
    margin-right: 16px;
  }
  > header {
    height: 28px;
    width: 100%;
    padding: 14px 10px;
    display: flex;
    align-items: center;
    position: relative;
    gap: 0 12px;
    flex-shrink: 0;

    > div {
      border-radius: 40px;
      border: 1.2px solid @border2;
      background: @mask1;
      padding: 5px 12px;
      display: flex;
      align-items: center;
    }

    > p {
      font-size: 14px;
      font-weight: 700;
      line-height: 22px;
      color: @text3;
    }
    &::after {
      content: '';
      width: 95px;
      height: 10px;
      position: absolute;
      background: url(../../../assets/images/alarm/adorn2.png) no-repeat center;
      background-size: cover;
      right: 10px;
      top: 40%;
    }
  }

  .event-list-wrap {
    width: 100%;
    flex: 1;
    border-radius: 8px;
    background: @mask6;
    backdrop-filter: blur(2px);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .event-list-card-wrap {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 10px 6px;
      gap: 10px 0;
      position: relative;
      overflow: hidden;
      .event-list-card {
        width: 100%;
        height: 116px;
        border-radius: 8px;
        // border: 1px solid rgba(90, 153, 255, 0.15);
        border: 1px solid #314065;
        background: @mask5;
        flex-shrink: 0;
        display: flex;
        padding: 3px;
        gap: 0 8px;
        cursor: pointer;
        &:hover {
          border: 1px solid rgba(255, 255, 255, 0.3);
          background: rgba(90, 153, 255, 0.3);
        }

        > img {
          width: 167px;
          height: 100%;
          border-radius: 4px 2px 2px 4px;
          object-fit: cover;
          display: block;
          cursor: pointer;
        }
        .event-list-card-info {
          flex: 1;
          padding: 4px 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-width: 0;
          > div {
            width: 100%;
            min-width: 0;
            .name {
              display: flex;
              align-items: center;
              > h4 {
                font-size: 14px;
                font-weight: 700;
                line-height: 22px;
                color: @text1;
                max-width: calc(100% - 18px);
                .ellipsis();
              }
              .algoLinkIcon {
                font-size: 14px;
                margin-left: 4px;
                font-weight: 400;
                color: @primary2;
              }
            }
            > h6 {
              width: 100%;
              font-size: 14px;
              font-weight: 700;
              line-height: 22px;
              color: @text1;
              .ellipsis();
            }
            > h6,
            > p {
              font-size: 12px;
              font-weight: 400;
              line-height: 20px;
              color: @primary2;
              margin-top: 4px;
            }
            > p {
              color: @text3;
              margin-top: 0;
              .ellipsis();
            }
          }

          .card-time {
            display: flex;
            align-items: center;
            justify-content: space-between;
            > p {
              span {
                font-size: 11px;
              }
            }
          }

          p {
            font-size: 12px;
            font-weight: 400;
            line-height: 20px;
            color: @text3;
            .ellipsis();

            > span {
              color: @text2;
              display: block;
              .ellipsis();
            }
          }
        }
      }
    }
  }
}

.empty-box {
  > p {
    color: rgba(255, 255, 255, 0.45);
  }
}

.infinite-loading-tip {
  cursor: pointer;
  padding-top: 6px;
}

.ant-spin-nested-loading {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.event-list-move,
.event-list-enter-active,
.event-list-leave-active {
  transition: all 0.5s ease;
}

.event-list-enter-from {
  opacity: 0;
  transform: translateY(-30px);
}
.event-list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* 确保将离开的元素从布局流中删除
    以便能够正确地计算移动的动画。 */
// .event-list-leave-active {
//   position: absolute;
// }
</style>
