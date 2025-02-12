<template>
  <div class="equipment-wrap">
    <title-bar>
      <template #title>
        <div class="title">报警位置</div>
      </template>
      <template #icon>
        <img style="width: 24px; height: 24px" src="@/assets/images/dash-board/shebei-icon.png" alt="" />
      </template>
    </title-bar>
    <div class="equipment-main-wrap">
      <div class="equipment-main">
        <header class="card-header">
          <div>单位（次）</div>
          <tabs v-model:active="dayTabsActive" @change="onDayChange"></tabs>
        </header>
        <div class="equipment" id="equipment"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts/core'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { BarChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import TitleBar from './title-bar.vue'
import Tabs from './tabs.vue'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { usePolling } from '@/hooks/useSetInterval'

echarts.use([GridComponent, BarChart, CanvasRenderer, TooltipComponent])

const props = defineProps({
  statisticsData: {
    type: Object,
    default: () => {},
  },
})

let chartDom: HTMLDivElement
let equipmentChart: echarts.ECharts
let option: any
onMounted(() => {
  chartDom = document.getElementById('equipment') as HTMLDivElement
  equipmentChart = echarts.init(chartDom)
  option = {
    xAxis: {
      type: 'category',
      data: [],
      splitLine: {
        //去除网格线
        show: false,
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false, // 显示x轴刻度线
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.40)',
        fontSize: '12px',
      },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        show: false,
      },
      axisTick: {
        show: false, // 显示y轴刻度线
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.40)',
        fontSize: '12px',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
      },
      formatter: '',
    },
    grid: {
      top: '10',
      left: '60',
      right: '10',
      bottom: '20',
    },
    series: [
      {
        data: [],
        type: 'bar',
        showBackground: true,
        backgroundStyle: {
          color: '#2D2638',
          borderRadius: [4],
        },
        barWidth: 8, // 设置圆柱的宽度
        itemStyle: {
          borderRadius: [4],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#02A4FF' },
            { offset: 1, color: '#7D40FF' },
          ]),
        },
      },
    ],
  }
  option && equipmentChart.setOption(option)
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
const onDayChange = () => {
  start(5000)
}

const chartData = ref<any>({})
watch(
  () => [props.statisticsData, dayTabsActive.value],
  () => {
    const dayMap = ['today', 'recentThreeDays', 'recentSevenDays']
    chartData.value = props.statisticsData?.alarmLocation?.[dayMap[dayTabsActive.value]] || null
    if (!chartData.value) return
    option.xAxis.data = chartData.value.x

    option.xAxis.axisLabel.formatter = function (value: string) {
      return value.replace(/(.{7})/g, '$1\n')
    }
    option.series[0].data = chartData.value.y
    option && equipmentChart.setOption(option)
  },
)

const resize = () => {
  equipmentChart.resize()
}
onUnmounted(() => {
  window.removeEventListener('resize', resize)
  clear()
})
</script>

<style lang="less" scoped>
@import '../common.less';

.equipment-wrap {
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .equipment-main-wrap {
    width: 100%;
    height: 100%;
    border-radius: 6px;
    border: 1px solid #1c1b54;
    background: rgba(0, 0, 0, 0.42);
    box-shadow: 0px 12px 12px 0px rgba(0, 0, 0, 0.35);
    padding: 0 0 12px;
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

    .equipment-main {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      position: absolute;
      z-index: 1;
      .equipment {
        width: 100%;
        height: 100%;
        margin-top: 8px;
        padding-bottom: 12px;
      }
    }
  }
}
</style>
