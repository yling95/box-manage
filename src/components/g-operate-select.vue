<template>
  <div class="g-operate-select" v-if="show">
    <div class="g-operate-select-left">
      <a-checkbox :checked="checkAll" @change="handleCheckAll">全选本页</a-checkbox>
      <span></span>
      <p>已选中{{ checkedList?.length || 0 }}条</p>
    </div>
    <div class="g-operate-select-right">
      <a-button
        type="default"
        class="icon-button"
        :disabled="checkedList?.length === 0 || exportDisabled"
        @click="handleExport"
      >
        <i class="iconfont icon-upload-2-line"></i>
        导出
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface OperateSelect {
  show: boolean
  checkAll?: boolean
  checkedList: any[]
  exportDisabled?: boolean
}
const props = withDefaults(defineProps<OperateSelect>(), {
  show: false,
  checkAll: false,
  exportDisabled: false,
})

const emits = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'update:checkAll', value: boolean): void
  (e: 'onCheckAll', value: boolean): void
  (e: 'onExport', value: any[]): void
}>()

const handleCheckAll = (e: any) => {
  const checked = e.target.checked
  emits('update:checkAll', checked)
  emits('onCheckAll', checked)
}
const handleExport = () => {
  emits('onExport', props.checkedList)
}
</script>

<style lang="less" scoped>
.g-operate-select {
  display: flex;
  align-items: center;
  height: 48px;
  border-bottom: 1px solid @border1;
  padding-left: 24px;

  .g-operate-select-left {
    display: flex;
    align-items: center;
    padding-right: 24px;

    p {
      color: @primary2;
      font-weight: 400;
      font-size: 14px;
    }
    span {
      background: rgba(255, 255, 255, 0.05);
      display: block;
      margin: 0 24px;
      width: 1px;
      height: 20px;
    }
  }

  .g-operate-select-right {
    height: 100%;
    display: flex;
    align-items: center;
    gap: 0 12px;
    padding-left: 24px;
    border-left: 1px solid @border1;
  }
}
</style>
