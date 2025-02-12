<template>
  <div class="g-video-spin">
    <div class="video-abnormal" v-show="spinning">
      <img v-if="videoTipStatus" class="loading" src="@/assets/images/alarm/loading.png" />
      <img v-else src="@/assets/images/alarm/abnormal.png" />
      <!-- <LoadingSvg class="loading" v-if="videoTipStatus"></LoadingSvg>
      <AbnormalSvg v-else></AbnormalSvg> -->
      <div class="empty-description">{{ videoTipStatus ? '正在连接..' : '连接异常' }}</div>
    </div>
    <slot></slot>
  </div>
  <!-- <a-spin :spinning="spinning" wrapperClassName="g-video-spin">
    <template #indicator>
      <i class="iconfont icon-Monitoring-full"></i>
    </template>
    <template #tip>
      <div class="spin-tip">
        {{ videoTipStatus ? '正在连接..' : '连接异常' }}
      </div>
    </template>
    <slot></slot
  ></a-spin> -->
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
// import AbnormalSvg from '@/assets/svg/alarmCenterAbnormal.svg?component'
// import LoadingSvg from '@/assets/svg/alarmCenterLoading.svg?component'

interface videoSpinType {
  spinning: boolean
}

const props = withDefaults(defineProps<videoSpinType>(), {
  spinning: true,
  warningStatus: false,
})

watch(
  () => props.spinning,
  () => {
    if (!props.spinning) return
    videoTipStatus.value = true
    setTimeout(() => {
      videoTipStatus.value = false
    }, 10000)
  },
)

const videoTipStatus = ref<boolean>(true)

onMounted(() => {
  setTimeout(() => {
    videoTipStatus.value = false
  }, 10000)
})

const resetSpin = () => {
  videoTipStatus.value = true
  setTimeout(() => {
    videoTipStatus.value = false
  }, 10000)
}

defineExpose({
  resetSpin,
})
</script>

<style lang="less">
@import '../views/alarm-center/styles/index.less';

.warning {
  border: 4px solid #f59700;
}

.loading {
  animation: rotate 2s linear infinite;
}
.g-video-spin {
  width: 100%;
  height: 100%;
  user-select: none;
}
</style>
