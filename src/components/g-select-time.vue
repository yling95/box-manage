<template>
  <div ref="selectTimeRef" class="schedule">
    <div class="schedule-wrap">
      <div class="day-row" v-for="(day, index) in days" :key="index">
        <div class="day-cell">{{ day.name }}</div>
        <div
          class="hour-cell"
          v-for="(hour, hourIndex) in day.hours"
          :key="hourIndex"
          :ref="`hour-${index}-${hourIndex}`"
          :data-week-index="index"
          :data-hour-index="hourIndex"
          :data-select-bool="hour[0].select"
          :data-minutes="hour[0].minutes"
        >
          <div
            class="half-cell"
            :class="{ select: hour[0].select, error: hour[0].error }"
            :data-week-index="index"
            :data-hour-index="hourIndex"
            :data-select-bool="hour[0].select"
            :data-minutes="hour[0].minutes"
          ></div>

          <div
            class="half-cell"
            :class="{ select: hour[1].select, error: hour[1].error }"
            :data-week-index="index"
            :data-hour-index="hourIndex"
            :data-select-bool="hour[1].select"
            :data-minutes="hour[1].minutes"
          ></div>
        </div>
      </div>
      <div class="day-row">
        <div class="day-cell"></div>
        <div class="hour-cell" v-for="hour in 24" :key="hour">
          <div class="hour-label">{{ hour - 1 }}</div>
        </div>
      </div>
    </div>
    <div class="g-select-time-operation">
      <a-button size="small" type="default" @click="onReset">清空</a-button>
      <a-button size="small" type="default" @click="onCheckAll">全选</a-button>
    </div>
  </div>
  <br />
  <!-- <h1 v-for="day in selectedTimeSlots" :key="day.name">{{ day.name }}: {{ day.time }}</h1> -->
  <!-- 鼠标选中框 -->
  <div
    v-if="box.isDragging"
    class="drag-box"
    :style="{ top: box.top + 'px', left: box.left + 'px', width: box.width + 'px', height: box.height + 'px' }"
  ></div>

  <!-- <h1>{{ axisList }}</h1> -->
</template>

<script setup lang="ts">
import { Form } from 'ant-design-vue'
import { cloneDeep } from 'g6-fn'
import { ref, reactive, onMounted, computed, onBeforeUnmount } from 'vue'

interface Hour {
  select: boolean
  error?: boolean
  timeStart: string
  timeEnd: string
  minutes: number
}

interface Day {
  name: string
  hours: Hour[][]
}

interface Box {
  isDragging: boolean
  startX: number
  startY: number
  left: number
  top: number
  width: number
  height: number
}

interface Axis {
  x: number // 代表星期几
  y: number // 代表第几个半小时
}

interface Props {
  axisList?: Axis[]
}

const props = withDefaults(defineProps<Props>(), {
  axisList: () => [],
})

const emit = defineEmits(['update:axisList'])
const formItemContext = Form.useInjectFormItemContext()

// 生成一个长度为24的数组，每个元素包含前半小时和后半小时
const generateHoursArray: () => Hour[][] = () => {
  const hours: Hour[][] = []
  for (let i = 0; i < 24; i++) {
    const time1 = `${i.toString().padStart(2, '0')}:00`
    const time2 = `${i.toString().padStart(2, '0')}:30`
    const time3 = `${(i + 1).toString().padStart(2, '0')}:00`
    hours.push([
      { select: false, timeStart: time1, timeEnd: time2, minutes: i * 60 },
      { select: false, timeStart: time2, timeEnd: time3, minutes: i * 60 + 30 },
    ])
  }
  return hours
}

const initDays = [
  { name: '星期一', hours: generateHoursArray() },
  { name: '星期二', hours: generateHoursArray() },
  { name: '星期三', hours: generateHoursArray() },
  { name: '星期四', hours: generateHoursArray() },
  { name: '星期五', hours: generateHoursArray() },
  { name: '星期六', hours: generateHoursArray() },
  { name: '星期日', hours: generateHoursArray() },
]
const days = ref<Day[]>(cloneDeep(initDays))

// 使用props.days初始化数据
function setPropsDays() {
  props.axisList.forEach((item) => {
    const selectHourIndex = Math.floor(item.x / 2)
    const selectMinutesIndex = item.x % 2
    if (selectMinutesIndex === 0) {
      days.value[item.y].hours[selectHourIndex][0].select = true
    } else {
      days.value[item.y].hours[selectHourIndex][1].select = true
    }
  })
}

// 计算选中的时间坐标
const axisList = computed<Axis[]>(() => {
  const arr: Axis[] = []
  days.value.forEach((day, index) => {
    day.hours?.forEach((hour, hourIndex) => {
      hour.forEach((item, itemIndex) => {
        if (item.select) {
          arr.push({ x: hourIndex * 2 + itemIndex, y: index })
        }
      })
    })
  })
  return arr
})

// 计算选中的时间段
const selectedTimeSlots = computed(() => {
  const selectedSlots: { name: string; time: string }[] = []

  days.value.forEach((day) => {
    let startTime: string | null = null
    let endTime: string | null = null
    const horizonList: string[] = []

    // 拍平半小时=》选中的半小时=》选中的半小时的时间=》合并相邻的时间
    day.hours
      ?.flat()
      .filter((hour) => hour.select)
      .forEach((hour) => {
        // 初始时间为空，则进行占位
        if (startTime === null) {
          startTime = hour.timeStart
          endTime = hour.timeEnd
          return
        }
        // 当前时间与上一个时间相邻，则进行合并
        if (hour.timeStart === endTime) {
          endTime = hour.timeEnd
        }
        // 当前时间与上一个时间不相邻，则进行占位
        else {
          horizonList.push(`${startTime} - ${endTime}`)
          startTime = hour.timeStart
          endTime = hour.timeEnd
        }
      })
    // 进行最后一次的添加
    if (startTime !== null && endTime !== null) {
      horizonList.push(`${startTime} - ${endTime}`)
    }

    selectedSlots.push({ name: day.name, time: horizonList.join(', ') })
  })

  return selectedSlots
})

const selectTimeRef = ref<HTMLElement | null>(null)

// 拖拽框信息
const box = reactive<Box>({
  isDragging: false,
  startX: 0,
  startY: 0,
  left: 0,
  top: 0,
  width: 0,
  height: 0,
})

// 新建拖拽框
// 容错值
const tolerance = 4
const createBox = (e: MouseEvent) => {
  if (!box.isDragging) {
    box.isDragging = true
    box.startX = e.clientX
    box.startY = e.clientY
    box.left = e.clientX - tolerance
    box.top = e.clientY - tolerance
    box.width = 0
    box.height = 0
  }
}
// 拖拽框移动
const resizeBox = (e: MouseEvent) => {
  if (!box.isDragging) {
    return
  }
  // 鼠标当前位置 取绝对值
  box.width = Math.abs(e.clientX - box.startX)
  box.height = Math.abs(e.clientY - box.startY)
  if (e.clientX < box.startX) {
    box.left = e.clientX + tolerance
  } else {
    box.left = box.startX - tolerance
  }
  if (e.clientY < box.startY) {
    box.top = e.clientY + tolerance
  } else {
    box.top = box.startY - tolerance
  }
  const domList = document.querySelectorAll('.half-cell')
  const startDom = domList[0]
  const endDom = domList[domList.length - 1]
  const { x: sx, y: sy } = startDom.getBoundingClientRect()
  const { x: ex, y: ey, width: ew, height: eh } = endDom.getBoundingClientRect()

  // 超出左边界
  if (e.clientX < sx) {
    box.left = sx
    box.width = box.startX - sx + tolerance
  }
  // 超出上边界
  if (e.clientY < sy) {
    box.top = sy
    box.height = box.startY - sy + tolerance
  }
  // 超出右边界
  if (e.clientX > ex + ew) {
    box.width = ex + ew - box.startX + tolerance
  }
  // 超出下边界
  if (e.clientY > ey + eh) {
    box.height = ey + eh - box.startY + tolerance
  }
}
// 移除拖拽框
const removeBox = () => {
  box.isDragging = false
}

let mouseDownDom: HTMLElement | null = null
let selectDayIndex = 0 // 选中的星期索引
let selectHourIndex = 0 // 选中的小时索引
let selectMinutes = 0 // 选中的分钟数
let selectBool = false // 选中的状态
let selectPickBody = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
}

const resetSelect = () => {
  mouseDownDom = null
  selectDayIndex = 0
  selectHourIndex = 0
  selectMinutes = 0
  selectBool = false
}

// 监听鼠标按下事件
function handleMouseDown(event: MouseEvent) {
  const target = event.target as HTMLElement
  const rect = selectTimeRef.value?.getClientRects()[0] || { left: 0, top: 0, right: 0, bottom: 0 }
  selectPickBody.top = rect.top
  selectPickBody.left = rect.left
  selectPickBody.right = rect.right
  selectPickBody.bottom = rect.bottom

  // 判断是否为半个单元格
  const isHalfCell = target && target.getAttribute('data-week-index')
  if (!isHalfCell) {
    return
  }
  mouseDownDom = target
  createBox(event)

  selectDayIndex = Number(target.getAttribute('data-week-index'))
  selectHourIndex = Number(target.getAttribute('data-hour-index'))
  selectMinutes = Number(target.getAttribute('data-minutes'))
  selectBool = target.getAttribute('data-select-bool') === 'true'
}

// 监听鼠标松开事件
function handleMouseUp(event: MouseEvent) {
  let target = event.target as HTMLElement
  let isHalfCell = target && target.getAttribute('data-week-index')

  // 有开始点无结束点时 取离鼠标位置最近的点
  if (!isHalfCell && !!mouseDownDom) {
    // 计算距离鼠标最终位置最近的格子
    const domList = document.querySelectorAll('.half-cell')
    let { clientX, clientY } = event
    const distanceList = Array.from(domList).map((dom) => {
      let { x, y, width, height } = dom.getBoundingClientRect()
      // 往右画需要加上自身宽度
      if (box.startX < clientX) {
        x = x + width
      }
      // 往右画需要加上自身高度
      if (box.startY < clientY) {
        y = y + height
      }
      return Math.sqrt(Math.pow(x - clientX, 2) + Math.pow(y - clientY, 2))
    })
    const minIndex = distanceList.indexOf(Math.min(...distanceList))
    const minDom = domList[minIndex]
    target = minDom as HTMLElement
    isHalfCell = target && target.getAttribute('data-week-index')
  }

  if (!isHalfCell || !mouseDownDom) {
    resetSelect()
    removeBox()
    return
  }
  const DayIndex = Number(target.getAttribute('data-week-index'))
  const hourIndex = Number(target.getAttribute('data-hour-index'))
  const minutes = Number(target.getAttribute('data-minutes'))
  const minDayIndex = Math.min(selectDayIndex, DayIndex)
  const maxDayIndex = Math.max(selectDayIndex, DayIndex)
  const minHourIndex = Math.min(selectHourIndex, hourIndex)
  const maxHourIndex = Math.max(selectHourIndex, hourIndex)
  const minMinutes = Math.min(selectMinutes, minutes)
  const maxMinutes = Math.max(selectMinutes, minutes)

  // 鼠标选中天
  const selectDays = days.value.slice(minDayIndex, maxDayIndex + 1)

  selectDays.forEach((day) => {
    day.hours!.slice(minHourIndex, maxHourIndex + 1).forEach((hour) => {
      hour.forEach((m) => {
        if (m.minutes >= minMinutes && m.minutes <= maxMinutes) {
          m.select = !selectBool
          m.error = false //取消错误状态
        }
      })
    })
  })
  emit('update:axisList', axisList.value)
  formItemContext.onFieldChange()
  resetSelect()
  removeBox()
}

// 监听鼠标移动事件
const handleMouseMove = (e: MouseEvent) => {
  resizeBox(e)
}

// 全选
const onCheckAll = () => {
  days.value.forEach((day) => {
    day.hours?.forEach((hour) => {
      hour.forEach((item) => {
        item.select = true
      })
    })
  })
  emit('update:axisList', axisList.value)
  formItemContext.onFieldChange()
}

// 清空
const onReset = () => {
  days.value = cloneDeep(initDays)
  emit('update:axisList', axisList.value)
  formItemContext.onFieldChange()
}

onMounted(() => {
  setPropsDays()

  window.addEventListener('mousedown', handleMouseDown)
  window.addEventListener('mouseup', handleMouseUp)
  window.addEventListener('mousemove', handleMouseMove)
})
onBeforeUnmount(() => {
  window.removeEventListener('mousedown', handleMouseDown)
  window.removeEventListener('mouseup', handleMouseUp)
  window.removeEventListener('mousemove', handleMouseMove)
})

const setAxisList = (axisList: Axis[], errorList: Axis[] = []) => {
  console.log('6666666666', errorList)

  days.value = cloneDeep(initDays)
  axisList.forEach((item) => {
    const selectHourIndex = Math.floor(item.x / 2)
    const selectMinutesIndex = item.x % 2
    if (errorList.length) {
      days.value[item.y].hours[selectHourIndex][selectMinutesIndex].select = true
      if (errorList.some((errItem) => errItem.x === item.x && errItem.y === item.y)) {
        days.value[item.y].hours[selectHourIndex][selectMinutesIndex].error = true
      }
    } else {
      days.value[item.y].hours[selectHourIndex][selectMinutesIndex].select = true
    }
  })
  emit('update:axisList', axisList)
}

defineExpose({
  selectedTimeSlots,
  axisList,
  setAxisList,
})
</script>

<style scoped lang="less">
.schedule {
  -moz-user-select: none; /* 火狐 */
  -webkit-user-select: none; /* 谷歌 */
  -ms-user-select: none; /* IE */
  user-select: none;
  // 圆角变量
  @border-radius-base: 4px;
  display: inline-flex;
  flex-direction: column;
  user-select: none;
  color: @text2;

  .g-select-time-operation {
    display: flex;
    gap: 0 8px;
    margin-top: 8px;
  }
  .schedule-wrap {
    border-radius: 8px;
    border: 1px solid rgba(103, 103, 103, 0.2);
    background: #202c40;
    box-shadow: @shadow-ss;
  }
  .day-row {
    display: flex;
    align-items: center;

    &:first-child {
      .day-cell:first-child {
        border-top-left-radius: @border-radius-base;
      }
      .hour-cell:last-child {
        border-top-right-radius: @border-radius-base;
        .half-cell:last-child {
          border-top-right-radius: @border-radius-base;
        }
      }
    }
    &:last-child {
      .day-cell:first-child {
        border-bottom-left-radius: @border-radius-base;
        background: none;
      }
      .hour-cell:last-child {
        border-bottom-right-radius: @border-radius-base;

        .half-cell:last-child {
          border-bottom-right-radius: @border-radius-base;
        }
      }
    }

    .day-cell {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 64px;
      height: 28px;
      font-size: 12px;
      text-align: center;
      background: @mask1;

      border: 1px solid rgba(103, 103, 103, 0.2);
    }

    .hour-cell {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 30px;
      height: 28px;
      border: 1px solid rgba(103, 103, 103, 0.2) !important;

      .half-cell {
        position: relative;
        width: 50%;
        height: 100%;
        cursor: pointer;

        .half-cell {
          width: 100%;
          height: 100%;
        }

        &.select {
          background-color: @success;
        }

        &.error {
          background-color: #fd4439;
        }

        &:hover {
          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.12);
          }
        }
      }

      .hour-label {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
      }
    }

    & > [class$='-cell'] {
      margin-left: -1px;
    }
  }

  .day-row + .day-row {
    margin-top: -1px;
  }

  .day-row:last-of-type {
    background: rgba(103, 103, 103, 0.2) !important;
  }
}

.drag-box {
  position: fixed;
  border: 2px dashed #000;
  cursor: pointer;
}
</style>
