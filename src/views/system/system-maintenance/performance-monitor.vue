<template>
  <div class="the-page-monitor">
    <div class="the-monitor-content">
      <div class="the-store-information">
        <div class="the-common-title">存储信息</div>
        <div class="the-information-content">
          <div class="information-detail">
            <div class="use-status">存储空间已使用</div>
            <div class="detail-percent">
              <span class="detail-percent-current">{{ diskData.use }}</span> GB/{{ diskData.total }}GB
            </div>
          </div>
          <!-- <div class="the-progress"> -->
          <a-progress :percent="diskData.percent" :showInfo="false" />
          <!-- </div> -->
        </div>
      </div>
      <div class="the-performance-monitor">
        <div class="the-common-title">性能监控</div>
        <div class="the-performance-content">
          <div class="the-content-child">
            <div class="the-child-title">CPU利用率</div>
            <div class="the-child-percent">
              {{ performancePercentData.cpu }}<span class="the-percent-symbol">%</span>
            </div>
            <div class="the-child-chart" ref="cpu"></div>
          </div>
          <div class="the-content-child">
            <div class="the-child-title">NPU利用率</div>
            <div class="the-child-percent">
              {{ performancePercentData.npu }}<span class="the-percent-symbol">%</span>
            </div>
            <div class="the-child-chart" ref="npu"></div>
          </div>
          <div class="the-content-child">
            <div class="the-child-title">内存利用率</div>
            <div class="the-child-percent">
              {{ performancePercentData.memory }}<span class="the-percent-symbol">%</span>
            </div>
            <div class="the-child-chart" ref="memory"></div>
          </div>
          <div class="the-content-child">
            <div class="the-child-title">网络速度</div>
            <div class="the-child-network">
              <div class="the-network-speed">
                <div class="speed-out-icon"></div>
                <div class="speed-title">上行</div>
                <div class="speed-number">{{ networkSpeed.out }}</div>
                <div class="speed-symbol">{{ networkSpeed.outSymbol }}</div>
              </div>
              <div class="the-network-speed">
                <div class="speed-in-icon"></div>
                <div class="speed-title">下行</div>
                <div class="speed-number">{{ networkSpeed.in }}</div>
                <div class="speed-symbol">{{ networkSpeed.inSymbol }}</div>
              </div>
            </div>
            <div class="the-child-chart" ref="network"></div>
          </div>
        </div>
      </div>
      <div class="logo">
        <img src="@/assets/images/system/logo1.png" alt="" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref, computed, onBeforeUnmount } from 'vue'
import { systemApi } from '@/services/api'
import * as echarts from 'echarts/core'
import { TitleComponent, ToolboxComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { LineChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

/**
 * 初始获取数据
 */
echarts.use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  CanvasRenderer,
  UniversalTransition,
])

let performanceData = reactive<{
  cpuQueue: timeDate[]
  npuQueue: timeDate[]
  memoryQueue: timeDate[]
  networkQueue: timeDate[]
  diskQueue: any
}>({
  cpuQueue: [],
  npuQueue: [],
  memoryQueue: [],
  networkQueue: [],
  diskQueue: [],
})

let diskData = reactive<{
  percent: number
  total: number
  use: number
}>({
  percent: 0,
  total: 0,
  use: 0,
})

let monitorLoop: any = null

let cpuChart: any, npuChart: any, networkChart: any, memoryChart: any

onMounted(() => {
  const setContent = {
    //设置控制图表大小变量
    width: 500,
    height: 240,
  }
  cpuChart = echarts.init(cpu.value as any, undefined, setContent)
  npuChart = echarts.init(npu.value as any, undefined, setContent)
  networkChart = echarts.init(network.value as any, undefined, setContent)
  memoryChart = echarts.init(memory.value as any, undefined, setContent)
  getMonitor()
  monitorLoop = setInterval(getMonitor, 5000)
})

// 卸载关闭请求
onBeforeUnmount(() => {
  clearInterval(monitorLoop)
})
const performancePercentData = reactive<{
  cpu: number
  npu: number
  memory: number
  network: { out: string; in: string }
}>({
  cpu: 0,
  npu: 0,
  memory: 0,
  network: { out: '0kb', in: '0kb' },
})
const getMonitor = async () => {
  try {
    let { data } = await systemApi.getMonitor()
    performanceData = data
    diskData = data.diskQueue.data
    diskData.percent = (data.diskQueue.data.use / data.diskQueue.data.total) * 100
    performancePercentData.cpu = data.cpuQueue.slice(-1)[0].data
    performancePercentData.npu = data.npuQueue.slice(-1)[0].data
    performancePercentData.memory = data.memoryQueue.slice(-1)[0].data
    performancePercentData.network = {
      out: data.networkQueue.slice(-1)[0].data.out.value,
      in: data.networkQueue.slice(-1)[0].data.in.value,
    }
    draw()
  } catch (error) {
    console.error(error)
  }
}

/**
 * echarts图表
 */
interface networkData {
  in: { data: number; value: string }
  out: { data: number; value: string }
}
interface timeDate {
  time: string
  data: networkData
}
let cpu = ref(HTMLDivElement)
let npu = ref(HTMLDivElement)
let network = ref(HTMLDivElement)
let memory = ref(HTMLDivElement)

const draw = () => {
  let option: any
  option = {
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: [],
      axisTick: {
        show: false, //隐藏x轴刻度
      },
      axisLabel: {
        interval: 0,
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
      },
      formatter: '',
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        show: true,
        interval: 'auto',
        formatter: '{value}%',
      },
      axisTick: {
        show: false, //隐藏x轴刻度
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
    grid: {
      x: 40,
      y: 20,
      x2: 15,
      y2: 45,
      borderWidth: 1,
    },
    series: [
      {
        data: [],
        type: 'line',
        value: [],
        areaStyle: {},
        smooth: true,
        symbol: 'none',
      },
      {
        data: [],
        value: [],
        type: 'line',
        areaStyle: {},
        label: [],
        smooth: true,
        symbol: 'none',
      },
      {
        data: [],
        value: [],
        type: 'line',
        areaStyle: {},
        label: [],
        smooth: true,
        symbol: 'none',
      },
      {
        data: [],
        value: [],
        type: 'line',
        areaStyle: {},
        label: [],
        smooth: true,
        symbol: 'none',
      },
    ],
  }

  function tooltipText(params: any, percent = '%') {
    let tip = ''
    if (params != null && params.length > 0) {
      tip += params[0].name + '<br/>'
      if (params.length > 1) {
        for (let i = 0; i < 2; i++) {
          let j = i + 2
          tip += params[i].marker + `${params[i].seriesName}` + params[j].value + `${percent}<br />`
        }
      } else {
        tip += params[0].marker + `${params[0].seriesName}` + params[0].value + `${percent}<br />`
      }
    }
    return tip
  }
  // cpu图绘制
  performanceData.cpuQueue.map((cpuData: timeDate) => {
    option.xAxis.data.push(cpuData.time)
    option.series[0].data.push(cpuData.data)
  })
  option.series[0].name = 'CPU利用率:'
  option.color = ['#5CC969']
  option.tooltip.formatter = function (params: any) {
    return tooltipText(params)
  }
  option && cpuChart.setOption(option)

  // npu图绘制
  option.color = ['#4686ED']
  option.series[0].name = 'NPU利用率:'
  option.series[0].data = []
  performanceData.npuQueue.map((cpuData: timeDate) => {
    option.series[0].data.push(cpuData.data)
  })
  option.tooltip.formatter = function (params: any) {
    return tooltipText(params)
  }
  option && npuChart.setOption(option)

  //  内存图绘制
  option.color = ['#0D4CCA']
  option.series[0].data = []
  performanceData.memoryQueue.map((cpuData: timeDate) => {
    option.series[0].data.push(cpuData.data)
  })
  option.series[0].name = '内存利用率:'
  option.tooltip.formatter = function (params: any) {
    return tooltipText(params)
  }
  option && memoryChart.setOption(option)

  //network图绘制
  option.color = ['#00A9C3', '#F59700']
  option.yAxis.axisLabel.formatter = '{value}'
  option.series[0].data = []
  performanceData.networkQueue.map((networkData: timeDate) => {
    option.series[0].data.push(networkData.data.out.data)
    option.series[1].data.push(networkData.data.in.data)
    option.series[2].data.push(networkData.data.out.value)
    option.series[3].data.push(networkData.data.in.value)
  })
  option.series[0].areaStyle = null
  option.series[1].areaStyle = null
  option.series[0].name = '上行流量:'
  option.series[1].name = '下行流量:'
  option.grid.x = 70
  option.tooltip.formatter = function (params: any) {
    return tooltipText(params, '')
  }

  option && networkChart.setOption(option)
}

const networkSpeed = computed(() => {
  let res: any = {}
  const outStr = performancePercentData.network.out
  const outNum = outStr.indexOf(' ')
  const inStr = performancePercentData.network.in
  const inNum = inStr.indexOf(' ')
  res.out = outStr.substring(0, outNum)
  res.outSymbol = outStr.substring(outNum, outStr.length)
  res.in = inStr.substring(0, inNum)
  res.inSymbol = inStr.substring(inNum, inStr.length)
  return res
})
</script>

<style lang="less" scoped>
.the-page-monitor {
  width: 1200px;
  height: 100%;

  .the-monitor-content {
    box-sizing: border-box;
    padding-top: 24px;
    width: 100%;
    .the-common-title {
      font-weight: 700;
      font-size: 16px;
      line-height: 24px;
      color: @text1;
      position: relative;
      padding-left: 11px;

      &::before {
        content: '';
        position: absolute;
        top: 3px;
        left: 0;
        width: 3px;
        height: 18px;
        border-radius: 2px;
        background: @primary2;
        // border-radius: 0px 2px 2px 0px;
      }
    }

    .the-performance-monitor {
      border: 1px solid @border3;
      background: var(--background-3, #202c40);
      box-sizing: border-box;
      padding: 12px 20px;
      height: 666px;
      // background: #fafafa;
      // border: 1px solid #d9d9db;
      border-radius: 4px;
      margin-top: 24px;

      .the-performance-content {
        height: 600px;
        display: flex;
        justify-content: space-between;
        margin-top: 5px;
        flex-wrap: wrap;

        .the-content-child {
          width: 572px;
          height: 292px;
          border-radius: 4px;
          box-sizing: border-box;
          padding: 12px 16px;
          margin-top: 12px;
          background: @border1;
          .the-child-title {
            font-weight: 700;
            font-size: 14px;
            line-height: 22px;
            color: @text2;
          }

          .the-child-network {
            margin: 8px 0 8px;
            display: flex;

            .the-network-speed {
              margin-right: 50px;
              display: flex;
              align-items: center;

              .speed-out-icon {
                width: 9px;
                height: 9px;
                background: #00a9c3;
                border-radius: 50%;
                margin-right: 2px;
              }

              .speed-in-icon {
                width: 9px;
                height: 9px;
                background: #f59700;
                border-radius: 50%;
                margin-right: 2px;
              }

              .speed-title {
                font-weight: 400;
                font-size: 12px;
                line-height: 20px;
                color: @text2;
                margin-right: 8px;
              }

              .speed-number {
                font-weight: 700;
                font-size: 18px;
                line-height: 26px;
                color: @text1;
              }

              .speed-symbol {
                font-weight: 400;
                font-size: 12px;
                line-height: 20px;
                margin-left: 2px;
                color: @text2;
              }
            }
          }

          .the-child-percent {
            font-weight: 700;
            font-size: 18px;
            line-height: 26px;
            color: @text1;
            margin: 2px 0 8px;

            .the-percent-symbol {
              font-weight: 400;
              font-size: 12px;
              line-height: 20px;
              color: @text2;
              margin-left: 2px;
            }
          }

          .the-child-chart {
            width: 540px;
            height: 200px;
            // border: 1px solid @border3;
            // background: @mask1;
          }
        }
      }
    }

    .the-store-information {
      border-radius: 4px;
      border: 1px solid @border3;
      background: @background3;
      box-sizing: border-box;
      padding: 12px 20px 20px;
      height: 148px;
      .the-common-title {
        margin-bottom: 24px;
      }
      .the-information-content {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;

        .information-detail {
          display: flex;
          width: 100%;
          justify-content: space-between;

          .use-status {
            font-weight: 400;
            font-size: 14px;
            line-height: 22px;
            color: @text2;
          }

          .detail-percent {
            font-weight: 400;
            font-size: 12px;
            line-height: 20px;
            color: @text2;

            .detail-percent-current {
              font-weight: 700;
              font-size: 16px;
              line-height: 24px;
              color: @text1;
            }
          }
        }

        ::v-deep(.ant-progress-inner) {
          margin-top: 8px;
          border-radius: 6px;
          border: 1px solid @border3;
          background: @mask1;
          .ant-progress-bg {
            height: 24px !important;
            border-radius: 6px 0 0 6px;
            background-color: #5cc969;
          }
        }
      }
    }

    .logo {
      margin-top: 24px;
      width: 196px;
      height: 16px;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        margin-bottom: 40px;
      }
    }
  }
}
</style>
