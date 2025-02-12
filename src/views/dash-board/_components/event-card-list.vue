<template>
  <div class="event-card-wrap">
    <g-empty :empty="alarmList?.length === 0">
      <template #empty>
        <div class="event-card-empty">
          <a-empty :image="empty">
            <template #description>
              <div class="empty-description">暂无数据</div>
            </template>
          </a-empty>
        </div>
      </template>
      <a-spin :spinning="loading">
        <div class="event-card-list" @scroll="handleScroll" ref="scrollable">
          <transition-group :name="transitionName">
            <div class="event-card-list-item" v-for="item in alarmList" :key="item.id">
              <div class="event-card-list-item-header">
                <div :title="(item as any).aiAlarmName ?? '暂无名称'">
                  {{ (item as any).aiAlarmName ?? '暂无名称' }}
                </div>
                <div :title="`${(item as any).senceName ?? '暂无名称'}-${item.deviceName ?? '暂无名称'}`">
                  {{ item.senceName ?? '暂无名称' }}-{{ item.deviceName ?? '暂无名称' }}
                </div>
                <div :title="cutoutTime((item as any).eventTime)">
                  {{ cutoutTime((item as any).eventTime) ?? '暂无时间' }}
                </div>
              </div>
              <div class="event-card-list-item-main">
                <img
                  :key="item?.eventImg"
                  :src="getRealUrl(item.eventImg)"
                  :onerror="(e: any) => imageErrorReplaceSrc(e, defaultImage)"
                  alt=""
                />
              </div>
            </div>
          </transition-group>
        </div>
      </a-spin>
    </g-empty>
    <div v-if="loadingMore" class="alarm-list-loader" @click="loadMore">查看更多</div>
  </div>
</template>

<script setup lang="ts">
import useList from '@/hooks/useList'
import { baseURL } from '@/request'
import { warningApi } from '@/services/api'
import { useUserStore } from '@/store/user'
import { SSE } from '@/utils/SSE'
import { ArrayRecords } from '@/views/alarm-center/interface'
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import empty from '@/assets/images/dash-board/no-data.png'
import { cutoutTime, getRealUrl, historyCallInterval, imageErrorReplaceSrc } from '@/utils/utils'
import defaultImage from '@/assets/images/alarm/default.jpg'
import usePerfectScrollbar from '@/hooks/usePerfectScrollbar'

const { token } = useUserStore()
const router = useRouter()

const { init, update, destroy } = usePerfectScrollbar('.event-card-list')

const { dataList, loading, pageForm, getDataList } = useList(warningApi.getWarningCenter, {
  offset: 1,
})

const loadingMore = ref<boolean>(false)
const alarmList = ref<ArrayRecords[]>([])
const sse1 = new SSE({
  messageCb: (code: number, _message: string, data: any) => {
    if (code != 0) return
    if (!data) return
    let alarmInfo = data?.data

    // // 右边侧边栏
    if (alarmInfo?.id) {
      return getData(alarmInfo)
    }
  },
})

const transitionName = ref('')
const getInterval = historyCallInterval()
const getData = (data: any) => {
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
}

const maxList = computed(() => {
  return Math.ceil(pageForm.total / 10)
})

const scrollable = ref<HTMLElement>()
const handleScroll = async () => {
  if (!scrollable.value) return
  const scrollDiv = scrollable.value
  // 滚动条已经到达底部
  if (!(scrollDiv.scrollTop + scrollDiv.clientHeight >= scrollDiv.scrollHeight - 0.5)) return

  const newOffset = ++pageForm.offset
  // 滑动大于5次
  if (newOffset > 6) return (loadingMore.value = true)

  // 最大限度
  if (maxList.value < newOffset) return
  await getDataList({ offset: newOffset })
  alarmList.value = alarmList.value?.concat(dataList.value)
  nextTick(() => {
    update()
  })
}

const getWarningManagementFn = async () => {
  await getDataList({ offset: 1 })
  alarmList.value = dataList.value
  if (alarmList.value?.length === 0) {
    return
  }
  nextTick(() => {
    init()
  })
}

/**
 * 加载更多
 */
const loadMore = () => {
  router.push({ path: '/record' })
}

onMounted(() => {
  getWarningManagementFn()
  sse1.selectAndLink(`${baseURL}/sse/connect-warning?gToken=${token}`)
})

onUnmounted(() => {
  sse1.closeLink()
  destroy()
})
</script>

<style lang="less" scoped>
::v-deep(.ps-y-rail) {
  display: none;
}

.event-card-wrap {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .event-card-empty {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .empty-description {
    color: #ffffff;
  }

  .event-card-list {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow: hidden;
    position: relative;

    .event-card-list-item {
      width: 100%;
      height: 214px;
      border-radius: 6px;
      border: 1px solid #142e55;
      box-shadow: 0px 2px 8px 0px rgba(37, 37, 45, 0.38), 0px 1px 3px 0px rgba(37, 37, 45, 0.28),
        0px 12px 12px 0px rgba(0, 0, 0, 0.35);
      display: flex;
      flex-direction: column;
      // margin-bottom: 16px;

      .event-card-list-item-header {
        width: 100%;
        height: 29px;
        background: url('../../../assets/images/dash-board/card-title-bgc.png') no-repeat;
        background-size: cover;
        color: #f0f6fc;
        display: flex;
        align-items: center;
        padding: 0 23px 0 20px;
        font-style: normal;
        line-height: normal;
        flex-shrink: 0;

        div:nth-child(1) {
          font-family: Alibaba PuHuiTi 2;
          font-size: 16px;
          font-weight: 600;
          width: 95px;
          flex-shrink: 0;
          .ellipsis();
        }
        div:nth-child(2) {
          width: 90px;
          .ellipsis();
          font-family: Alibaba PuHuiTi 2;
          font-size: 14px;
          font-weight: 400;
          margin-left: 12px;
          flex-shrink: 0;
        }
        div:nth-child(3) {
          font-size: 14px;
          font-weight: 400;
          margin-left: 14px;
          flex-shrink: 0;
        }
      }

      .event-card-list-item-main {
        width: 100%;
        height: 183px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.12);
        overflow: hidden;

        > img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }
}

.alarm-list-loader {
  width: 300px;
  margin: 12px auto;
  height: 32px;
  line-height: 32px;
  color: #ffffff;
  font-size: 14px;
  padding-left: 8px;
  text-align: center;
  &:hover {
    cursor: pointer;
  }
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
