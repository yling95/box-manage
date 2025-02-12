<template>
  <g-modal
    width="660px"
    :bodyStyle="{ padding: '40px 40px' }"
    v-model:visible="copyVisible"
    title="复制配置信息到..."
    @ok="handleCopySubmit"
    destroyOnClose
    @cancel="handleCopyCancel"
  >
    <a-input
      v-if="!hasConflict"
      style="width: 239px; margin-bottom: 24px"
      placeholder="设备名称"
      allowClear
      :maxlength="15"
      v-model:value="deviceName"
      @press-enter="handleSearch"
    >
      <template #prefix>
        <i class="iconfont icon-search-line"></i>
      </template>
    </a-input>
    <p class="copy-info" v-else>
      <span>{{ managementAiList.length }}</span> 台设备将复制AI服务配置（原有配置将被覆盖），请确认！
    </p>
    <a-table
      :loading="aiListLoading"
      :row-selection="hasConflict ? undefined : { selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      :columns="copyColumns"
      :dataSource="managementAiList"
      :scroll="{ y: 490 }"
      :pagination="false"
      :rowKey="(record: any) => record.deviceId"
      class="copy-table"
    >
    </a-table>
  </g-modal>
</template>

<script setup lang="ts">
import { MaskingAreaSize, equipmentApi } from '@/services/api'
import { message } from 'ant-design-vue'
import { ref } from 'vue'
import { useRequest } from 'vue-request'
import { Key } from 'ant-design-vue/es/_util/type'

const props = defineProps({
  equipmentId: {
    type: [String, Number],
    required: true,
  },
})

const copyColumns = [
  {
    title: '设备名称',
    dataIndex: 'deviceConcatName',
    key: 'deviceConcatName',
  },
  {
    title: 'AI服务',
    dataIndex: 'aiSrvConcatName',
    key: 'aiSrvConcatName',
    ellipsis: true,
  },
]
const copyVisible = ref<boolean>(false)
const managementAiList = ref<any[]>([])
let maskingAreaSize: MaskingAreaSize = {
  width: 0,
  height: 0,
}
// 是否有冲突
const hasConflict = ref<boolean>(false)
const deviceName = ref<string>('')
let copyManagementAiList: any[] = []
//  搜索
const handleSearch = () => {
  managementAiList.value = copyManagementAiList.filter((item: any) => {
    return item.deviceConcatName.indexOf(deviceName.value) > -1
  })
}
const { loading: aiListLoading, runAsync: runGetManagementAiList } = useRequest(equipmentApi.getManagementAiList)
const getManagementAiList = async () => {
  const { data } = await runGetManagementAiList()
  managementAiList.value = data?.filter((item: any) => {
    return Number(item.deviceId) !== Number(props.equipmentId)
  })
  copyManagementAiList = managementAiList.value
}
const openCopyModal = (params: MaskingAreaSize) => {
  maskingAreaSize = params
  getManagementAiList()
  copyVisible.value = true
}
const selectedRowKeys = ref<any[]>([])
const onSelectChange = (keys: Key[]) => {
  selectedRowKeys.value = keys
}
const { runAsync: runCopyAreaInfo } = useRequest(equipmentApi.copyAreaInfo)
const handleCopySubmit = async () => {
  if (selectedRowKeys.value.length === 0) {
    return message.warning('请选择要复制的设备')
  }
  if (!hasConflict.value) {
    const deviceList = managementAiList.value.filter((item: any) => {
      return selectedRowKeys.value.includes(Number(item.deviceId))
    })
    // 冲突列表
    const conflictList = deviceList.filter((item: any) => {
      return item.aiSrvConcatName !== '无'
    })
    hasConflict.value = conflictList.length > 0
    if (hasConflict.value) {
      managementAiList.value = conflictList
      return
    }
  }
  await runCopyAreaInfo({
    originDeviceId: props.equipmentId,
    overrideDeviceIds: selectedRowKeys.value,
    maskingAreaSize,
  })
  message.success('操作成功')
  handleCopyCancel()
}
const handleCopyCancel = () => {
  copyVisible.value = false
  managementAiList.value = []
  selectedRowKeys.value = []
  hasConflict.value = false
}

defineExpose({
  openCopyModal,
})
</script>

<style lang="less" scoped>
.copy-info {
  font-weight: 700;
  font-size: 14px;
  color: @text1;
  margin-bottom: 38px;
  span {
    color: @link;
  }
}
</style>
