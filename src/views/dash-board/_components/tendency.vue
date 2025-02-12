<template>
  <div class="tendency-wrap">
    <title-bar>
      <template #title>
        <div class="title">报警趋势</div>
      </template>
      <template #icon>
        <img style="width: 24px; height: 24px" src="@/assets/images/dash-board/qushi-icon.png" alt="" />
      </template>
    </title-bar>
    <div class="tendency-main-wrap">
      <div class="tendency-main">
        <header class="card-header">
          <div>单位（次）</div>
          <tabs :tabs="tabList" v-model:active="dayTabsActive" @change="onDayChange"></tabs>
        </header>
        <div ref="chartDom" class="tendency" id="tendency"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts/core'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { LineChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import TitleBar from './title-bar.vue'
import Tabs from './tabs.vue'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import autofit from '@/utils/autofit'
import { usePolling } from '@/hooks/useSetInterval'

echarts.use([GridComponent, LineChart, CanvasRenderer, TooltipComponent])

const props = defineProps({
  statisticsData: {
    type: Object,
    default: () => {},
  },
})

const tabList = [
  {
    title: '24小时',
    key: '1',
  },
  {
    title: '近3日',
    key: '2',
  },
  {
    title: '近7日',
    key: '3',
  },
]

let chartDom = ref()
let tendencyChart: echarts.ECharts
let option: any
onMounted(() => {
  autofit.init(
    {
      dh: 1080,
      dw: 1920,
      el: 'body',
      resize: true,
    },
    false,
  )

  // chartDom = document.getElementById('tendency') as HTMLDivElement
  tendencyChart = echarts.init(chartDom.value, undefined)
  option = {
    xAxis: {
      type: 'category',
      data: [],
      axisTick: {
        show: false, // 显示x轴刻度线
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.40)',
        fontSize: '12px',
        interval: 22,
      },
      axisLine: {
        lineStyle: {
          color: '#1f203f', // 设置 y 轴线颜色为红色
        },
      },
    },

    yAxis: {
      type: 'value',
      axisTick: {
        show: false, // 显示y轴刻度线
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.40)',
        fontSize: '12px',
      },
      splitLine: {
        lineStyle: {
          color: '#1f203f',
        },
      },
    },
    grid: {
      top: '10',
      left: '60',
      right: '25',
      bottom: '20',
    },
    tooltip: {
      trigger: 'axis',
    },
    series: [
      {
        data: [],
        type: 'line',
        symbol: 'none', // 可以设置为 'none' 或 'empty'
        lineStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
            { offset: 0, color: '#7D40FF' },
            { offset: 1, color: '#02A4FF' },
          ]), // 设置折线的颜色为红色
        },
      },
    ],
  }
  option && tendencyChart.setOption(option)
  window.addEventListener('resize', resize)
})

/**
 * 自动更新天数
 */
const dayTabsActive = ref(0)
const { start, clear } = usePolling(() => {
  dayTabsActive.value++
  if (dayTabsActive.value > 2) return (dayTabsActive.value = 0)
})
start(5000)
const onDayChange = (index: number) => {
  start(5000)
  dayTabsActive.value = index
}

const chartData = ref<any>({})
watch(
  () => [props.statisticsData, dayTabsActive.value],
  () => {
    chartData.value = props.statisticsData?.alarmTrend || null
    if (!chartData.value) return
    let x = []
    let y = []
    switch (dayTabsActive.value) {
      case 1:
        x = (chartData.value.x as string[]).slice(0, 3 * 24)
        y = (chartData.value.y as number[]).slice(0, 3 * 24)
        option.xAxis.axisLabel.interval = 22
        option.xAxis.axisLabel.formatter = function (value: string) {
          return value.slice(5, 10)
        }
        break

      case 2:
        x = (chartData.value.x as string[]).slice(0, 7 * 24)
        y = (chartData.value.y as number[]).slice(0, 7 * 24)
        option.xAxis.axisLabel.interval = 22
        option.xAxis.axisLabel.formatter = function (value: string) {
          return value.slice(5, 10)
        }
        break

      default:
        x = (chartData.value.x as string[]).slice(0, 1 * 24)
        y = (chartData.value.y as number[]).slice(0, 1 * 24)
        option.xAxis.axisLabel.interval = 2
        option.xAxis.axisLabel.formatter = function (value: string) {
          return value.slice(10, 16)
        }
        break
    }
    option.xAxis.data = x.reverse()
    option.series[0].data = y.reverse()
    option && tendencyChart.setOption(option)
  },
)

const resize = () => {
  tendencyChart.resize()
}
onUnmounted(() => {
  window.removeEventListener('resize', resize)
  autofit.off()
  clear()
})
</script>

<style lang="less" scoped>
@import '../common.less';

.tendency-wrap {
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .tendency-main-wrap {
    width: 100%;
    flex: 1;
    border-radius: 6px;
    border: 1px solid #1c1b54;
    background: rgba(0, 0, 0, 0.42);
    box-shadow: 0px 12px 12px 0px rgba(0, 0, 0, 0.35);
    position: relative;
    overflow: hidden;

    &::after {
      content: '';
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      backdrop-filter: blur(40px);
    }
    .tendency-main {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      position: absolute;
      z-index: 1;
      .tendency {
        width: 100%;
        height: 100%;
        margin-top: 8px;
        padding-bottom: 12px;
      }
    }
  }
}
</style>
