<template>
  <ul class="tabs-list">
    <li
      class="tabs-list-item"
      :class="[index === activeIndex && 'active']"
      @click="onClick(item, index)"
      v-for="(item, index) in tabs"
      :key="item.key"
    >
      <p>{{ item.title }}</p>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

export interface Tabs {
  key: string
  title: string
}
const props = defineProps({
  active: {
    type: Number,
    default: 0,
  },
  tabs: {
    type: Array<Tabs>,
    default: () => [
      {
        title: '今日',
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
    ],
  },
})

const emits = defineEmits(['change', 'update:active'])

const activeIndex = ref(props.active ?? 0)

watch(
  () => props.active,
  (newValue) => {
    activeIndex.value = newValue
  },
)

const onClick = (item: Tabs, index: number) => {
  activeIndex.value = index
  emits('change', index, item)
  emits('update:active', activeIndex.value)
}
</script>

<style lang="less" scoped>
.tabs-list {
  display: flex;
  align-items: center;
  gap: 0 16px;
  height: 29px;
  flex-shrink: 0;

  .tabs-list-item {
    display: flex;
    min-width: 40px;
    height: 29px;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    color: #8b949e;
    font-family: Noto Sans SC;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    //   line-height: 22px;
    transition: all 0.3s ease-in-out;
    cursor: pointer;

    > p {
      transform: translateY(-4px);
    }

    &.active {
      color: #c9d1d9;
      position: relative;
      &::after {
        content: '';
        width: 100%;
        height: 2px;
        position: absolute;
        background: linear-gradient(#61abff 0%, #61ffe2 100%);
        bottom: 0;
      }
    }
  }
}
</style>
