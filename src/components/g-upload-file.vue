<template>
  <div class="g-upload-file">
    <div class="g-upload-file-wrap">
      <div class="g-upload-file-select">
        <div v-if="loading">
          <!-- <div class="icon-loader" v-if="loading"
          <i class="iconfont icon-loader-line"></i> -->
          {{ progress }}%
        </div>
        <label for="g-upload-file-input" v-else>
          <slot><span>浏览</span></slot>
        </label>
      </div>
    </div>
    <div class="g-upload-file-input-wrap">
      {{ fileName }}
      <input id="g-upload-file-input" type="file" readonly @change="onFileChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ModuleType, commonApi } from '@/services/api'
import { Form, message } from 'ant-design-vue'
import axios, { CancelTokenSource } from 'axios'
import { ref } from 'vue'

const formItemContext = Form.useInjectFormItemContext()
const loading = ref<boolean>(false)

interface UploadFileProps {
  fileName?: string
  fileUrl?: string
  moduleType: ModuleType
  maxFileSize?: number
  accept?: string
  beforeUpload?: (file: File) => boolean
  cancelRequest?: () => void
}
const props = withDefaults(defineProps<UploadFileProps>(), {
  fileName: '',
  fileUrl: '',
  moduleType: ModuleType.SYSTEM,
  maxFileSize: -1,
  accept: 'zip',
  beforeUpload: () => true,
})

const emit = defineEmits(['update:fileName', 'update:fileUrl', 'on-success', 'on-error'])
const progress = ref(0)
let source: CancelTokenSource

// 监听文件变化
const onFileChange = async (e: any) => {
  try {
    const file = e.target.files[0]
    // 验证文件大小
    const isLt2M = file.size! / 1024 / 1024 < props.maxFileSize
    if (props.maxFileSize !== -1 && !isLt2M) {
      e.target.value = ''
      return message.error(`文件大小不能超过${props.maxFileSize}M`)
    }
    // 验证格式
    const postfix: string = file?.name?.split('.')?.slice(-1)[0]
    if (props?.accept && !props?.accept?.split(',')?.includes(postfix)) {
      e.target.value = ''
      return message.error(`仅支持${props?.accept}格式`)
    }
    if (props.beforeUpload && !props.beforeUpload(file)) {
      e.target.value = ''
      return
    }
    loading.value = true
    const formData = new FormData()
    formData.append('file', file)
    source = axios.CancelToken.source()
    progress.value = 0
    const { data } = await commonApi.upload(props.moduleType, formData, {
      cancelToken: source.token,
      onUploadProgress: (progressEvent) => {
        progress.value = Math.ceil((progressEvent.progress as number) * 100)
      },
    })

    emit('update:fileName', file.name)
    emit('update:fileUrl', data.relativeFilePath)
    emit('on-success', { fileName: file.name, fileUrl: data.relativeFilePath })
    loading.value = false
    formItemContext.onFieldChange()
    e.target.value = ''
  } catch (error) {
    loading.value = false
    emit('on-error', error)
    e.target.value = ''
  }
}

// 取消上传
const cancelRequest = () => {
  loading.value = false
  progress.value = 0
  source && source.cancel()
}

defineExpose({
  cancelRequest,
})
</script>

<style lang="less" scoped>
.g-upload-file {
  display: flex;
  gap: 0 8px;

  .g-upload-file-input-wrap {
    width: 80%;
    height: 36px;
    border-radius: 6px;
    border: 1px solid @border3;
    pointer-events: none;
    display: flex;
    align-items: center;
    padding: 0 12px;
    background: @mask2;
    color: @text1;

    div {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    input {
      width: 100%;
      border: 1px solid #d9d9db;
      border-radius: 6px;
      outline: none;
      display: none;
    }
  }

  .g-upload-file-select {
    width: 60px;
    height: 36px;
    border: 1px solid @border3;
    color: @text1;
    cursor: pointer;
    border-radius: 8px;
    background: @mask2;

    box-shadow: @shadow-ss;
    .center();

    label {
      cursor: pointer;
      width: 100%;
      height: 100%;
      .center();
    }

    .icon-loader {
      width: 21px;
      height: 21px;
      animation: rotate 1s linear infinite;
      .center();

      i {
        font-size: 20px;
        color: @primary1;
      }
    }

    .ant-spin-spinning {
      display: flex;
      align-items: center;
    }
  }
}
</style>
