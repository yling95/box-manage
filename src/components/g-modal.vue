<template>
  <a-modal v-bind="props" :wrap-class-name="props.fullscreen ? 'full-modal' : undefined" centered>
    <template v-for="slotName in slotList" #[slotName]="scope">
      <slot v-if="slotName" :name="slotName" v-bind="scope || {}"></slot>
    </template>
    <template #closeIcon>
      <a-button type="text" class="alone-icon-button icon-close">
        <i class="iconfont icon-close-line"></i>
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ModalProps } from 'ant-design-vue'
import { useSlots, computed } from 'vue'

const slots = useSlots()
const slotList = computed(() => {
  const list = []
  for (const slot in slots) {
    if (slot !== 'closeIcon') {
      list.push(slot)
    }
  }
  return list
})

interface ModalType extends ModalProps {
  fullscreen?: boolean
}

const props = withDefaults(defineProps<ModalType>(), {
  mask: true,
  closable: true,
  keyboard: true,
  maskClosable: true,
  fullscreen: false,
})
</script>

<style lang="less" scoped>
.icon-close-line {
  width: 36px;
  font-size: 22px;
}
</style>
