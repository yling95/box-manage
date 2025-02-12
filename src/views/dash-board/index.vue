<template>
  <div class="dash-board-wrapper" ref="fullscreenDiv">
    <!-- <div class="dash-board-close" v-if="showClose" @click="handleBack">
      <i class="iconfont icon-home-5-fill"></i>
      <p>报警中心</p>
    </div> -->
    <header title="返回报警中心">
      <div @click="handleBack"></div>
    </header>
    <main>
      <div class="main-left">
        <div class="card-wrap general-view">
          <div class="card-title-wrap">
            <div class="card-title">报警概览</div>
            <div class="dot"></div>
          </div>
          <div class="card-main">
            <p>今日报警</p>
            <p>
              <span>
                <count-up
                  :duration="0.8"
                  :start-val="todayTotalAlarmOldCount"
                  :end-val="statisticsData?.todayTotalAlarmCount || 0"
                ></count-up>
              </span>
            </p>
          </div>
        </div>
        <div class="card-wrap run-view">
          <div class="card-title-wrap">
            <div class="card-title">设备运行</div>
            <div class="dot"></div>
          </div>
          <ul class="card-main">
            <li class="card-main-item">
              <p class="card-main-item-left">
                <count-up
                  :duration="0.8"
                  :start-val="onlineDeviceOldCount"
                  :end-val="statisticsData?.onlineDeviceCount || 0"
                ></count-up>
              </p>
              <p class="card-main-item-right">在线设备</p>
            </li>
            <li class="card-main-item">
              <p class="card-main-item-left">
                <count-up
                  :duration="0.8"
                  :start-val="offlineDeviceOldCount"
                  :end-val="statisticsData?.offlineDeviceCount || 0"
                ></count-up>
              </p>
              <p class="card-main-item-right">离线设备</p>
            </li>
          </ul>
        </div>
        <classes :statisticsData="statisticsData"></classes>
      </div>
      <div class="main-center">
        <video-list></video-list>
        <div class="chart-wrap">
          <tendency :statisticsData="statisticsData"></tendency>
          <equipment :statisticsData="statisticsData"></equipment>
        </div>
      </div>
      <div class="main-right">
        <title-bar>
          <template #title>
            <div class="title">报警记录</div>
          </template>
          <template #icon>
            <img style="width: 24px; height: 24px" src="@/assets/images/dash-board/jilu-icon.png" alt="" />
          </template>
        </title-bar>
        <event-card-list></event-card-list>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import VideoList from './_components/video-list.vue'
import EventCardList from './_components/event-card-list.vue'
import TitleBar from './_components/title-bar.vue'
import Tendency from './_components/tendency.vue'
import Equipment from './_components/equipment.vue'
import { useRequest } from 'vue-request'
import { warningApi } from '@/services/api'
import CountUp from 'vue-countup-v3'
import Classes from './_components/classes.vue'
import useSetInterval from '@/hooks/useSetInterval'
import { useRouter } from 'vue-router'
import { useMouseMovement } from '@/hooks/useMouse'
import { useGlobalStore } from '@/store/global'

const globalStore = useGlobalStore()
const router = useRouter()

const showClose = ref<boolean>(false)
const mouseMovement = useMouseMovement((e: boolean) => {
  showClose.value = e
})
const statisticsData = ref<any>({
  todayTotalAlarmCount: 0,
  onlineDeviceCount: 0,
  offlineDeviceCount: 90,
})
let todayTotalAlarmOldCount = ref<number>(0)
let onlineDeviceOldCount = ref<number>(0)
let offlineDeviceOldCount = ref<number>(0)

const { runAsync: runGetStatistics } = useRequest(warningApi.getStatistics)
const getStatistics = async () => {
  todayTotalAlarmOldCount.value = statisticsData.value.todayTotalAlarmCount || 0
  onlineDeviceOldCount.value = statisticsData.value.onlineDeviceCount || 0
  offlineDeviceOldCount.value = statisticsData.value.offlineDeviceCount || 0
  const { data } = await runGetStatistics()
  statisticsData.value = data
}

//气泡框挂载
const getPopupContainerEl = ref<any>(document.body)
onMounted(() => {
  nextTick(() => {
    getPopupContainerEl.value = document.getElementById('screen-button')
  })
})

const { start, clear } = useSetInterval()
const init = () => {
  start(getStatistics, 1000, true)
}
init()

// 返回
const handleBack = () => {
  document?.exitFullscreen?.()
  toAlarmCenter()
}

// 跳转到报警中心
const { start: toLinkTimeStart, clear: toLinkTimeClear } = useSetInterval()
const toAlarmCenter = () => {
  globalStore.updateLoading(true, { tip: '正在退出...' })
  toLinkTimeStart(() => {
    globalStore.updateLoading(false)
    router.replace('/alarm-center')
  }, 1000)
}

const exitHandler = () => {
  const _document: any = document
  if (!_document.webkitIsFullScreen && !_document.mozFullScreen && !_document.msFullscreenElement) {
    toAlarmCenter()
  }
}

// 监听fullscreenchange事件（全屏模式的变化）
if (document.addEventListener) {
  document.addEventListener('webkitfullscreenchange', exitHandler, false)
  document.addEventListener('mozfullscreenchange', exitHandler, false)
  document.addEventListener('fullscreenchange', exitHandler, false)
  document.addEventListener('MSFullscreenChange', exitHandler, false)
}

onUnmounted(() => {
  clear()
  toLinkTimeClear()
  document.removeEventListener('webkitfullscreenchange', exitHandler, false)
  document.removeEventListener('mozfullscreenchange', exitHandler, false)
  document.removeEventListener('fullscreenchange', exitHandler, false)
  document.removeEventListener('MSFullscreenChange', exitHandler, false)
  // body退出全屏
  mouseMovement()
})
</script>

<style lang="less" scoped>
@import './common.less';

.dash-board-wrapper {
  height: 100%;
  width: 100%;
  background: url('../../assets/images/dash-board/bgc.png') no-repeat;
  background-size: cover;

  .dash-board-close {
    padding: 8px 24px;
    position: fixed;
    cursor: pointer;
    z-index: 1;
    text-align: end;
    right: 0;
    border-radius: 0px 0px 0px 1000px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: #222f77;
    .center();
    gap: 0 6px;
    color: #ffffff;
    i {
      font-size: 18px;
    }
  }

  > header {
    height: 84px;
    width: 100%;
    background: url('../../assets/images/dash-board/header-bgc.png') no-repeat;
    background-size: 100% 100%;
    position: absolute;
    cursor: pointer;
    div {
      width: 700px;
      height: 80px;
      position: absolute;
      left: 50%;
      transform: translate(-50%);
    }
  }

  > main {
    height: 100%;
    width: 100%;
    display: flex;

    > div {
      height: 100%;
    }

    .main-left {
      width: 389px;
      height: 100%;
      padding: 36px 32px 36px 24px;
      display: flex;
      flex-direction: column;
      gap: 24px 0;

      .card-wrap {
        padding: 12px;
        border-radius: 8px;
        border: 1px solid #1d3c69;
        box-shadow: 0px 12px 12px 0px rgba(0, 0, 0, 0.35);
        flex-shrink: 0;
        .card-title-wrap {
          display: flex;
          align-items: center;
          .card-title {
            width: 86px;
            height: 20px;
            background: url('../../assets/images/dash-board/card-title-bgc01.png') no-repeat;
            background-size: 100% 100%;
            font-family: Alibaba PuHuiTi 2;
            font-size: 14px;
            font-style: normal;
            font-weight: 400;
            line-height: normal;
            padding-left: 24px;
            color: #dcdef3;
          }

          .dot {
            width: 4px;
            height: 4px;
            flex-shrink: 0;
            border-radius: 1px;
            background-color: #afaccd;
            margin-left: auto;
          }
        }
      }

      .general-view {
        width: 100%;
        height: 292px;
        background: url('../../assets/images/dash-board/general-view-bgc.png') no-repeat;
        background-size: 100% 100%;

        .card-main {
          width: 172px;
          height: 172px;
          background: url('../../assets/images/dash-board/general-view-main-bgc.png') no-repeat;
          background-size: 100% 100%;
          margin: 19px auto;
          color: #f0f6fc;
          font-family: D-DIN;
          font-size: 14px;
          font-style: normal;
          font-weight: 700;
          line-height: normal;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          span {
            display: flex;
            font-size: 48px;
          }
        }
      }

      .run-view {
        width: 100%;
        height: 159px;
        background: url('../../assets/images/dash-board/run-bgc.png') no-repeat;
        background-size: 100% 100%;
        display: flex;
        flex-direction: column;

        .card-main {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0 40px;
          .card-main-item {
            width: 120px;
            height: 56px;
            display: flex;
            gap: 0 8px;

            .card-main-item-left {
              width: 56px;
              height: 56px;
              background: url('../../assets/images/dash-board/run-main-bgc.png') no-repeat;
              background-size: 100% 100%;
              .center();
              color: #f0f6fc;
              font-family: D-DIN;
              font-size: 36px;
              font-style: normal;
              font-weight: 700;
              line-height: normal;
            }

            .card-main-item-right {
              font-family: Noto Sans SC;
              font-size: 14px;
              font-style: normal;
              font-weight: 400;
              line-height: 22px;
              color: #f0f6fc;
              position: relative;
              padding-top: 8px;
              &::after {
                content: '';
                width: 31px;
                height: 8px;
                background: url('../../assets/images/dash-board/run-main-bgc01.png') no-repeat;
                background-size: 100% 100%;
                position: absolute;
                bottom: 8px;
                left: 0;
              }
            }

            &:last-child {
              .card-main-item-right::after {
                background: url('../../assets/images/dash-board/run-main-bgc02.png') no-repeat;
                background-size: 100% 100%;
              }
            }
          }
        }
      }
    }

    .main-center {
      flex: 1;
      height: 100%;
      padding: 112px 0 36px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 19px 0;

      .chart-wrap {
        height: 298px;
        display: flex;
        gap: 0 32px;
        flex-shrink: 0;
      }
    }

    .main-right {
      width: 391px;
      height: 100%;
      padding: 36px 24px 0 32px;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;

      .title {
        font-size: 20px;
        font-style: normal;
        font-weight: 600;
        line-height: normal;
        color: #f0f6fc;
        margin-left: 8px;
      }
    }
  }
}
</style>
