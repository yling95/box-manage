<!-- 下拉加载更多 -->
<template>
  <infinite-loading
    :target="target"
    :distance="distance"
    :top="top"
    :identifier="identifier"
    :firstload="firstload"
    @infinite="load"
  >
    <template #spinner>
      <slot name="spinner">
        <div class="infinite-loading-tip">数据加载中...</div>
      </slot>
    </template>
    <template #complete>
      <slot name="complete">
        <div class="infinite-loading-tip" @click="onClickComplete">{{ empty ? emptyText : completeText }}</div>
      </slot>
    </template>
    <template #error="{ retry }">
      <slot name="error" :retry="retry">
        <a-button @click="retry">重新加载</a-button>
      </slot>
    </template>
  </infinite-loading>
</template>

<script setup lang="ts">
import InfiniteLoading from 'v3-infinite-loading'
import 'v3-infinite-loading/lib/style.css'

export interface InfiniteLoadingProps {
  // 此属性用于指定可滚动元素，它可以是任何有效的css选择器，如果未设置，则默认为窗口
  target?: string | HTMLElement
  // 如果滚动距离小于此值，将触发无限事件。
  distance?: number
  // 此属性用于将加载方向设置为顶部。
  top?: boolean
  // 如果这个属性改变了，组件将被重置
  identifier?: any
  // 此属性用于指定是否希望组件处理首次加载。
  firstload?: boolean
  // 是否空数据
  empty?: boolean
  // 空数据提示
  emptyText?: string
  completeText?: string
}

withDefaults(defineProps<InfiniteLoadingProps>(), {
  target: 'window',
  distance: 0,
  top: false,
  identifier: '',
  firstload: true,
  empty: false,
  emptyText: '暂无数据',
  completeText: '已加载全部数据',
})
const emits = defineEmits(['infinite', 'on-click-complete'])

// 加载
const load = ($state: any) => {
  emits('infinite', $state)
}

// 点击完成时的文字
const onClickComplete = () => {
  emits('on-click-complete')
}
</script>

<style lang="less" scoped>
.infinite-loading-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 0;
  width: 100%;
  font-size: 14px;
  color: @text4;
}
</style>
