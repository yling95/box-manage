<template>
  <g-modal
    width="800px"
    :bodyStyle="{ padding: '40px 40px' }"
    v-model:visible="pushVisible"
    title="新增推送任务"
    @ok="handleAddPushBtn"
    destroyOnClose
    :ok-button-props="{
      loading: loading,
    }"
    @cancel="handleAddPushCancel"
  >
    <div class="form-wrap">
      <a-form ref="pushFormRef" layout="vertical" :model="pushForm" :rules="pushFormRules">
        <div class="form-container">
          <a-form-item label="任务名称" name="taskName">
            <a-input placeholder="请输入" v-model:value="pushForm.taskName" :maxlength="15" />
          </a-form-item>
          <a-form-item label="推送方式" name="pushMethod">
            <a-radio-group v-model:value="pushForm.pushMethod" @change="onPushMethodChange">
              <a-radio :value="1">http/https</a-radio>
              <!-- <a-radio :value="2">websocket</a-radio> -->
            </a-radio-group>
          </a-form-item>
          <a-form-item
            label="推送地址"
            name="pushUrl"
            :rules="[
              {
                required: true,
                message: '请输入推送地址',
                trigger: 'blur',
              },
              {
                pattern: pattern,
                message: '请输入正确的推送地址',
                trigger: 'blur',
              },
            ]"
          >
            <a-input placeholder="请输入" v-model:value="pushForm.pushUrl" />
          </a-form-item>
          <a-form-item label="数据维度" name="dataType">
            <a-radio-group v-model:value="pushForm.dataType" @change="onDataDimensionChange">
              <a-radio :value="1">全部</a-radio>
              <a-radio :value="2">设备</a-radio>
              <a-radio :value="3">AI服务</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item v-if="pushForm.dataType !== 1">
            <div style="width: 636px">
              <checkbox-tree
                v-model:value="pushForm.selectIds"
                :parent-title="parentTitle"
                :child-title="childTitle"
                :options="options"
              />
            </div>
          </a-form-item>
        </div>
      </a-form>
    </div>
  </g-modal>
</template>

<script setup lang="ts">
import { urlReg, websocketReg } from '@/utils/regular'
import { ref, reactive } from 'vue'
import { useRequest } from 'vue-request'
import { Rule } from 'ant-design-vue/es/form'
import { systemApi } from '@/services/api'
import CheckboxTree from '../_components/checkbox-tree.vue'
import { FormInstance, RadioChangeEvent } from 'ant-design-vue'
import { message } from '@/utils/antd.util'

// 后端接口返回的格式
type TsRes = {
  code?: number
  data?: any
  message?: any
  [propKey: string]: any
}
const emits = defineEmits(['on-submit'])
const { runAsync: runAddPush } = useRequest(systemApi.addPush)
const loading = ref<boolean>(false)
const loadings = ref(true)

const handleAddPushBtn = async () => {
  await pushFormRef.value?.validate()
  loading.value = true
  loadings.value = false

  let res: TsRes = await runAddPush(pushForm)
  if (res.code === 0) {
    message.success(res.message)
    pushVisible.value = false
    emits('on-submit')
    loadings.value = true

    loading.value = false
  }
}
const handleAddPushCancel = () => {
  if (loadings.value) {
    pushVisible.value = false
  }
}
/**
 * 推送配置
 */
interface PushForm {
  id?: number
  status?: boolean
  taskName: string
  pushMethod: number
  pushUrl: string
  dataType: number
  selectIds?: any[]
}
const pushVisible = ref<boolean>(false)
const pushFormRef = ref<FormInstance>()
const pushForm = reactive<PushForm>({
  taskName: '',
  pushMethod: 1, // 1：http ,https 2.ws
  pushUrl: 'https://',
  dataType: 1, // 1:全部 2：设备 3：ai服务
  selectIds: [],
})
const pattern = ref<RegExp>(urlReg)
const pushFormRules: Record<string, Rule[]> = {
  taskName: [
    {
      required: true,
      message: '请输入任务名称',
      trigger: 'blur',
    },
  ],
  pushMethod: [
    {
      required: true,
      message: '请选择推送方式',
      trigger: 'blur',
    },
  ],
  dataType: [
    {
      required: true,
      message: '请选择数据维度',
      trigger: 'blur',
    },
  ],
}

/**
 * 推送地址变化
 */
const onPushMethodChange = (e: RadioChangeEvent) => {
  if (e.target.value === 1) {
    pattern.value = urlReg
    pushForm.pushUrl = 'https://'
  } else {
    pattern.value = websocketReg
    pushForm.pushUrl = 'ws://'
  }
}

/**
 * 设备列表
 */
const { runAsync: runGetEquipmentList } = useRequest(systemApi.getEquipmentList, {
  onSuccess: (res) => {
    options.value = res.data
  },
})

/**
 * 服务列表
 */
const { runAsync: runGetAiList } = useRequest(systemApi.getAiList, {
  onSuccess: (res) => {
    options.value = res.data
  },
})
/**
 * 数据维度变化
 */
const options = ref<any[]>([])
const parentTitle = ref<string>('设备')
const childTitle = ref<string>('AI服务')
const onDataDimensionChange = (e: RadioChangeEvent) => {
  const value = e.target.value
  if (value === 2) {
    parentTitle.value = '设备'
    childTitle.value = 'AI服务'
    pushForm.selectIds = []
    runGetEquipmentList()
  } else if (value === 3) {
    parentTitle.value = 'AI服务'
    childTitle.value = '设备'
    pushForm.selectIds = []
    runGetAiList()
  }
}
const openModal = (tag: string) => {
  pushVisible.value = true
  pushForm.taskName = tag
  pushForm.pushUrl = 'https://'
  pushForm.pushMethod = 1 // 1：http ,https 2.ws
  pushForm.dataType = 1 // 1全部 2：设备 3：ai服务
  pushForm.selectIds = []
}
defineExpose({
  openModal,
})
</script>

<style lang="less" scoped>
.form-wrap {
  height: 100%;
  overflow: auto;
  max-height: 600px;
  .ant-modal-content {
    background: #1e2736 !important;
  }
  input {
    width: 320px;
    border-radius: 6px;
    border: 1px solid @border3;
    background: @mask2 !important;
  }
}
.ant-form-vertical {
  :deep(.ant-form-item-label) {
    label {
      color: @text3 !important;
    }
  }
}
</style>
