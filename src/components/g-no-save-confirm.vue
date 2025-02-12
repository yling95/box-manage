<template>
  <div class="leave-no-save-confirm">
    <g-modal
      v-model:visible="props.visible"
      :mask-closable="false"
      :keyboard="false"
      :title="null"
      :closable="false"
      :width="416"
      :body-style="{ padding: '40px 40px 8px 40px' }"
    >
      <div class="content">
        <i class="iconfont confirm-info icon-alert-fill"></i>
        <p class="text">{{ props.text }}</p>
      </div>
      <template #footer>
        <div class="footer">
          <a-button @click="cancel">取消</a-button>
          <a-button @click="noSave">不保存</a-button>
          <a-button type="primary" @click="save" :loading="saveLoading">保存</a-button>
        </div>
      </template>
    </g-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const props = defineProps({
  text: {
    type: String,
    default: '信息未保存，确认保存后离开？',
  },
  visible: {
    type: Boolean,
    default: false,
  },
  saveLoading: {
    type: Boolean,
    default: false,
  },
  confirmFunObj: {
    type: Object,
    default: {
      noSaveFun: () => {
        console.log('不保存')
      },
      saveFun: () => {
        console.log('保存')
      },
      cancelFun: () => {
        console.log('取消')
      },
    },
  },
})
const saveLoading = ref<boolean>(false)
const emits = defineEmits(['update:visible', 'cancel', 'no-save', 'save'])

const cancel = () => {
  emits('update:visible', false)
  emits('cancel')
}
const noSave = async () => {
  await props.confirmFunObj.noSaveFun()
  emits('no-save')
  emits('update:visible', false)
}
const save = async () => {
  saveLoading.value = true
  await props.confirmFunObj.saveFun()
  saveLoading.value = false
  emits('save')
  emits('update:visible', false)
}
</script>

<style lang="less" scoped>
.content {
  display: flex;
  color: @text1;
  .text {
    color: @text1;
    font-size: 14px;
  }
}
.footer {
  justify-content: center;
  align-items: flex-end;
  gap: 8px;
}
</style>
