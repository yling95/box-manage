<template>
  <div class="classes-wrap">
    <title-bar title="报警类别" sub-title="TOP8">
      <template #icon>
        <img style="width: 22px; height: 22px" src="@/assets/images/dash-board/class-icon.png" alt="" />
      </template>
    </title-bar>
    <div class="classes-ranking-wrap">
      <header class="card-header">
        <div>单位（次）</div>
        <tabs v-model:active="dayTabsActive" @change="onDayChange"></tabs>
      </header>
      <ul class="classes-list" ref="parent">
        <li v-for="(item, index) in classes" :key="item?.y">
          <div class="info">
            <div>
              <p>NO.{{ index + 1 }}</p>
              <p>
                <span>{{ item?.y }}</span>
              </p>
            </div>
            <div>{{ item?.x }}</div>
          </div>
          <a-progress
            trailColor="#2D2638"
            strokeColor="linear-gradient(90deg, #7D40FF 0%, #02A4FF 100%)"
            :percent="item?.p || 0"
            :show-info="false"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import Tabs from './tabs.vue'
import TitleBar from './title-bar.vue'
import { usePolling } from '@/hooks/useSetInterval'
import { onUnmounted, ref, watch } from 'vue'
import { useAutoAnimate } from '@formkit/auto-animate/vue'

const [parent] = useAutoAnimate()

const props = defineProps({
  statisticsData: {
    type: Object,
    default: () => {},
  },
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

const classes = ref<any[]>([])
watch(
  () => [props.statisticsData, dayTabsActive.value],
  () => {
    const dayMap = ['today', 'recentThreeDays', 'recentSevenDays']
    classes.value = props.statisticsData?.alarmCategory?.[dayMap[dayTabsActive.value]] ?? []
  },
)

onUnmounted(() => {
  clear()
})
</script>

<style lang="less" scoped>
@import '../common.less';

.classes-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  .classes-ranking-wrap {
    width: 100%;
    flex: 1;
    border-radius: 6px;
    position: relative;
    border-radius: 6px;
    border: 1px solid #1c1b54;
    background: rgba(0, 0, 0, 0.42);
    box-shadow: 0px 12px 12px 0px rgba(0, 0, 0, 0.35);
    overflow: auto;

    .classes-list {
      display: flex;
      flex-direction: column;
      padding: 8px 20px 16px;
      gap: 8px 0;
      .info {
        color: rgba(255, 255, 255, 0.8);
        font-family: PingFang SC;
        font-size: 12px;
        font-style: normal;
        line-height: 20px;
        display: flex;
        justify-content: space-between;
        > div {
          display: flex;
          gap: 0 12px;
          p {
            font-weight: 500;
          }
          span {
            font-weight: 400;
            color: rgba(255, 255, 255, 0.6);
          }
        }
      }
    }
  }
}
</style>
