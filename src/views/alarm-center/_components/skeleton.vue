<template>
  <div class="skeleton-wrap" v-show="_loading">
    <div class="skeleton-left-wrap">
      <div class="skeleton-input" active />
      <div class="skeleton-input" active />
      <div class="skeleton-input" active />
      <div class="skeleton-input" active />
    </div>
    <div class="skeleton-center-wrap">
      <div class="skeleton-input" active />
      <div class="skeleton-input" active />
      <div class="skeleton-input" active />
      <div class="skeleton-input" active />
    </div>
    <div class="skeleton-right-wrap">
      <div class="skeleton-input" active />
      <div class="skeleton-input" active />
      <div class="skeleton-input" active />
    </div>
  </div>
  <div v-show="!_loading" class="skeleton-slot"><slot></slot></div>
</template>

<script setup lang="ts">
import { watch, ref, onUnmounted } from 'vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  // 延迟时间
  delay: {
    type: Number,
    default: 0,
  },
})

const _loading = ref(props.loading)
let timer: any
const stop = watch(
  () => props.loading,
  (val) => {
    if (!val) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        _loading.value = false
        clearTimeout(timer)
      }, props.delay)
    } else {
      _loading.value = val
    }
  },
)

onUnmounted(() => {
  stop()
})
</script>

<style lang="less" scoped>
.skeleton-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  gap: 0 16px;
  padding: 20px 16px;

  .skeleton-input {
    background: linear-gradient(270deg, rgba(0, 136, 255, 0.2) 0.23%, rgba(0, 136, 255, 0.06) 99.79%);
    background-size: 400% 100%;
    animation: skeleton-loading 1.4s ease infinite;
  }

  .skeleton-left-wrap,
  .skeleton-right-wrap {
    width: 316px;
    height: 100%;
    border-radius: 8px;
    background: rgba(46, 75, 120, 0.1);
    backdrop-filter: blur(2px);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 42px 0;
    gap: 24px 0;
    .skeleton-input {
      width: 268px;
      height: 28px;
      border-radius: 4px;
      overflow: hidden;
      &:first-child {
        margin-bottom: 16px;
      }
    }
  }

  .skeleton-right-wrap {
    .skeleton-input {
      height: 80px;
      &:first-child {
        margin-bottom: 0;
      }
    }
  }
  .skeleton-center-wrap {
    width: 100%;
    flex: 1;
    border-radius: 8px;
    background: rgba(46, 75, 120, 0.1);
    backdrop-filter: blur(2px);
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    padding: 40px;
    gap: 40px;

    .skeleton-input {
      border-radius: 4px;
    }
  }
}

.skeleton-slot {
  width: 100%;
  height: 100%;
}
</style>
