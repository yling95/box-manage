<template>
  <div class="g-empty" :style="{ width, height }" v-if="empty">
    <slot name="empty"></slot>
  </div>
  <template v-else>
    <slot></slot>
  </template>
</template>

<script setup lang="ts">
defineProps({
  empty: {
    type: Boolean,
    default: false,
  },
  width: {
    type: String,
    default: '100%',
  },
  height: {
    type: String,
    default: '100%',
  },
})
</script>

<style lang="less" scoped>
.g-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: @text2;
  font-size: 14px;
  font-weight: 400;
}
</style>
