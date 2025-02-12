<template>
  <div class="task-form">
    <a-form :model="form" ref="formRef" layout="vertical" :rules="formRules">
      <a-form-item label="任务名称" name="jobName">
        <a-input placeholder="请输入" v-model:value="form.jobName" :maxlength="50" />
      </a-form-item>
      <a-form-item label="数据上传" name="dataType" style="margin-bottom: 0">
        <div style="display: flex; gap: 0 8px">
          <a-radio-group class="background" :value="form.dataType" @change="onDataTypeChange">
            <a-radio :value="0">图片</a-radio>
            <a-tooltip title="功能已禁用，请减少当前连接的视频源后重新尝试" v-if="videoDisabled">
              <a-radio :value="1" disabled>视频</a-radio>
            </a-tooltip>
            <a-radio :value="1" v-else>视频</a-radio>
          </a-radio-group>
          <div class="info">
            <i class="iconfont icon-information-fill"></i>
            <div>
              <p v-html="dataTypeOptionMap[form.dataType].info"></p>
            </div>
          </div>
        </div>
      </a-form-item>
      <a-form-item name="fileList">
        <div class="upload-dragger-wrap">
          <g-upload-dragger
            ref="gUploadDraggerRef"
            v-model:value="form.fileList"
            :accept="dataTypeOptionMap[form.dataType].accept"
            :uid="uid"
            :type="false"
            :max-file-size="dataTypeOptionMap[form.dataType].maxFileSize"
            :list-max-num="dataTypeOptionMap[form.dataType].listMaxNum"
            :once-select-max-num="dataTypeOptionMap[form.dataType].onceSelectMaxNum"
            :upload-text="dataTypeOptionMap[form.dataType].btnInfo"
            :disabled="videoDisabled"
            :before-upload="beforeUpload"
            :dpi="dataTypeOptionMap[form.dataType].dpi"
            @on-upload-status="onUploadStatus"
          ></g-upload-dragger>
        </div>
        <div class="info">
          <i class="iconfont icon-information-fill"></i>
          <div>
            <p>上传数据默认保存7天，7天后自动清空该任务上传数据</p>
          </div>
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { confirm } from '@/utils/antd.util'
import { FormInstance } from 'ant-design-vue'
import { Rule } from 'ant-design-vue/es/form'
import { ref } from 'vue'
import GUploadDragger, { UploadStatus } from '@/components/g-upload-dragger.vue'
import { isVideoFixedDpi } from '@/utils/utils'

const props = withDefaults(
  defineProps<{
    uid: string
  }>(),
  {
    uid: '',
  },
)

const emits = defineEmits<{
  (e: 'onUploadStatus', value: UploadStatus): void
}>()

const gUploadDraggerRef = ref<InstanceType<typeof GUploadDragger>>()

const dataTypeOptionMap: { [key in number]: any } = {
  0: {
    accept: 'jpg,jpeg,png',
    info: `支持图片格式：JPG、JPEG、PNG，单张图片大小不超过5M；<br>单任务最大支持1万条检测数据，最大分辨率2560*1440`,
    btnInfo: '添加数据（批量单次5000张图片）',
    maxFileSize: 5,
    listMaxNum: 10000,
    onceSelectMaxNum: 5000,
    dpi: [
      [0, 0],
      [2560, 1440],
    ],
  },
  1: {
    accept: 'mp4',
    info: 'MP4，单个视频大小不超过2G；单任务最大支持25条检测数据；<br>支持分辨率：352*288、640*480、1280*720、1920*1080、2560*1440',
    btnInfo: '添加数据（批量单次25个视频）',
    maxFileSize: 2048,
    listMaxNum: 25,
    onceSelectMaxNum: 100,
    dpi: undefined,
  },
}

const formRef = ref<FormInstance>()
const form = ref({
  id: undefined,
  jobName: '',
  dataType: 0,
  dataSrcId: props.uid,
  fileList: [],
})

const formRules: Record<string, Rule[]> = {
  jobName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  dataType: [{ required: true, message: '请选择数据上传', trigger: 'blur' }],
  fileList: [{ required: true, message: '请上传文件', trigger: 'blur' }],
}

// 切换数据上传类型
const videoDisabled = ref(false)
const onDataTypeChange = (e: any) => {
  if (form.value.fileList.length === 0) {
    return run()
  }
  confirm({
    title: '切换数据上传类型，会清空当前上传数据，确定是否切换?',
    onOk: () => run(),
  })

  async function run() {
    await gUploadDraggerRef.value?.clearFileList()
    const value = e.target.value
    form.value.dataType = value
    form.value.fileList = []
  }
}

const getFormData = async () => {
  try {
    await formRef.value?.validate()
    return Promise.resolve(form.value)
  } catch (error) {
    return Promise.reject(error)
  }
}

const reset = async () => {
  form.value = {
    id: undefined,
    jobName: '',
    dataType: 0,
    dataSrcId: props.uid,
    fileList: [],
  }
}

const onUploadStatus = (status: UploadStatus) => {
  emits('onUploadStatus', status)
}

const beforeUpload = async (file: File) => {
  if (form.value.dataType === 0) {
    return Promise.resolve(true)
  }
  console.log(file)

  try {
    await isVideoFixedDpi(file, [
      [352, 288],
      [640, 480],
      [1280, 720],
      [1920, 1080],
      [2560, 1440],
    ])
    return Promise.resolve(true)
  } catch (error) {
    console.log(error, 'error')
    return Promise.reject({
      message: '分辨率错误',
    })
  }
}

const resetFileList = async (isDeleteRemote: boolean = true) =>
  await gUploadDraggerRef.value?.clearFileList(isDeleteRemote)

defineExpose({
  getFormData,
  reset,
  resetFileList,
})
</script>

<style lang="less" scoped>
.task-form {
  width: 680px;

  .info {
    color: @text4;
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
    display: flex;
    align-items: center;
    gap: 0 4px;
  }

  .upload-dragger-wrap {
    padding: 8px 0;
  }
}
</style>
