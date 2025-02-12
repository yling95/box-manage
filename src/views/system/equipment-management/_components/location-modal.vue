<template>
  <g-modal
    width="416px"
    :closable="false"
    v-model:visible="LocationModalVisible"
    ok-text="确定"
    cancel-text="取消"
    @ok="okFn"
    :body-style="{ padding: '40px 32px 0' }"
    @cancel="
      () => {
        locationFormRef?.resetFields()
        LocationModalVisible = false
      }
    "
  >
    <a-form ref="locationFormRef" :model="LocationConfig" layout="vertical">
      <a-form-item
        :label="LocationModalType.title"
        name="locationName"
        :rules="[{ required: true, message: `请输入场景位置名称` }]"
      >
        <a-input v-model:value.trim="LocationConfig.locationName" placeholder="请输入场景位置名称" :maxlength="25" />
      </a-form-item>
    </a-form>
  </g-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FormInstance } from 'ant-design-vue'
import { message } from '@/utils/antd.util'

import { equipmentApi } from '@/services/api'

const emit = defineEmits(['reloadFn'])

const locationFormRef = ref<FormInstance>()

const LocationModalVisible = ref<boolean>(false)

const LocationConfig = ref<any>([])

const LocationModalType = ref<any>([])

const okFn = () => {
  if (LocationModalType.value.type == 'add') return onAddSubmitName()
  return onEditName()
}

const onEditName = async () => {
  try {
    await locationFormRef.value?.validate()
    await equipmentApi.putLocationName({
      locationName: LocationConfig.value.locationName,
      locationId: LocationConfig.value.locationId,
    })
    locationFormRef.value?.resetFields()
    LocationModalVisible.value = false
    message.success('编辑场景名称成功')
    emit('reloadFn')
  } catch (error) {
    console.error(error)
  }
}
const onAddSubmitName = async () => {
  try {
    await locationFormRef.value?.validate()
    await equipmentApi.postLocationName(LocationConfig.value.locationName)
    locationFormRef.value?.resetFields()
    LocationModalVisible.value = false
    message.success('操作成功')
    emit('reloadFn')
  } catch (error) {
    console.error(error)
  }
}

const locationDefault = {
  deviceItem: {},
  locationModalType: {
    title: '添加场景',
    type: 'add',
  },
}
const openModal = (data: any = locationDefault, cb: Function) => {
  console.log('data1', data)
  LocationModalType.value = data.locationModalType
  LocationConfig.value.locationName = data.deviceItem.locationName
  LocationConfig.value.locationId = data.deviceItem.locationId
  if (cb) {
    cb()
  }
  LocationModalVisible.value = true
}

const closeModal = (data: any, cb: Function) => {
  console.log('data2', data)
  if (cb) {
    cb()
  }
  LocationModalVisible.value = false
}

defineExpose({
  openModal,
  closeModal,
})
</script>

<style lang="less" scoped></style>
