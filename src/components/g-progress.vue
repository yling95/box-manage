<template>
  <div class="g-progress-bar" :style="trailStyle">
    <div class="g-progress-in" :style="progressStyle"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    default: 0,
  },
  progress: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 100,
  },
  trailColor: {
    type: String,
    default: '#2d2638',
  },
  strokeColor: {
    type: String,
    default: '#7d40ff',
  },
  showInfo: {
    type: Boolean,
    default: true,
  },
})

const progress = computed(() => {
  return (props.value / props.max) * 100
})

const progressStyle = computed(() => {
  return {
    width: `${props.progress ?? progress.value}%`,
    backgroundColor: props.strokeColor,
  }
})

const trailStyle = computed(() => {
  return {
    backgroundColor: props.trailColor,
  }
})
</script>

<style lang="less" scoped>
.g-progress-bar {
  width: 100%;
  height: 4px;
  background-color: #2d2638;
  border-radius: 2px;
  .g-progress-in {
    width: 0;
    height: 100%;
    background-color: #7d40ff;
    border-radius: 2px;
    transition: all 0.5s;
  }
}
</style>
