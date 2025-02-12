<template>
  <label for="upload-dragger-input" @dragover="(e) => e.preventDefault()" @drop.prevent="onDrop">
    <div class="upload-dragger-wrap" :disabled="disabled">
      <input
        type="file"
        id="upload-dragger-input"
        style="display: none"
        multiple
        :disabled="disabled"
        @change="onFileChange"
      />
      <slot>
        <div class="upload-dragger">
          <p class="upload-drag-icon">
            <upload-drag></upload-drag>
          </p>
          <p class="upload-text">{{ uploadText }}</p>
        </div>
      </slot>
    </div>
  </label>
  <div class="upload-list-wrap" v-if="fileList?.length">
    <header>
      <div>上传记录（{{ getFileListDoneLength }}/{{ fileList?.length }}）</div>
      <ul class="tab-list">
        <li
          class="tab-list-item"
          :class="[activeIndex === index && 'active']"
          v-for="(item, index) in tabs"
          :key="item"
          @click="onChangeTab(index)"
        >
          {{ item }}
        </li>
      </ul>
    </header>
    <div class="upload-list">
      <recycle-scroller
        ref="scrollerRef"
        class="upload-list-item-wrap"
        :class="[filterFileList.length > 10 && 'fixed-height']"
        :items="filterFileList"
        :item-size="40"
        key-field="uid"
        v-slot="{ item }"
      >
        <!-- <div class="upload-list-item-wrap" v-for="item in filterFileList" :key="item.uid"> -->
        <div class="upload-list-item" :class="[item?.status]">
          <!-- 名称 -->
          <div class="upload-list-item-name">
            <i class="iconfont icon-loader-4-fill" v-if="item?.status === 'uploading' || item?.status === 'await'"></i>
            <i class="iconfont icon-attachment-2" v-else></i>
            <p :title="item.name">{{ item.name }}</p>
          </div>
          <!-- 进度条 -->
          <div class="progress-wrap" v-if="item?.status === 'uploading' || item?.status === 'await'">
            <a-progress :percent="item.percent" size="small" :showInfo="false" />
          </div>
          <!-- 文件大小 -->
          <div class="upload-list-item-info" v-else>
            <div>{{ sizeFilter(item?.size || 0) }}</div>
            <div>
              {{ item?.message }}
            </div>
          </div>
          <!-- 状态 -->
          <div class="upload-list-item-status">
            <span
              v-if="item?.status === 'uploading' || item?.status === 'await'"
              @click.stop="handleCancelRequest(item)"
              >取消</span
            >
            <span v-else-if="item?.status === 'cancel'" @click.stop="handleRetryRequest(item)"> 重试 </span>
            <div class="delete-icon-wrap">
              <i class="iconfont icon-delete-bin-line" @click.stop="handleRemove(item)"></i>
            </div>
          </div>
        </div>
        <!-- </div> -->
      </recycle-scroller>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import uploadDrag from '@/assets/svg/upload-drag.svg'
import { localDetectionApi, localConversionApi } from '@/services/api'
import { sizeFilter, uuid } from 'g6-fn'
import axios from 'axios'
import { Form, message } from 'ant-design-vue'
import { isDpi } from '@/utils/utils'

export interface UploadDraggerProps {
  uid: string
  value?: GUploadFile[]
  accept?: string
  listMaxNum?: number
  onceSelectMaxNum?: number
  maxFileSize?: number
  disabled?: boolean
  uploadText?: string
  type?: boolean
  dpi?: [number, number] | [[number, number], [number, number]]
  beforeUpload?: (file: File) => Promise<boolean | string>
  onSuccess?: (res: any) => Promise<any>
}

export type UploadStatus = 'uploading' | 'done'
export interface GUploadFile {
  uid: string
  name: string
  status?: 'uploading' | 'cancel' | 'error' | 'success' | 'await'
  file?: File
  percent?: number
  size?: number
  url?: string
  message?: string
  cancelRequest?: Function
}
const props = withDefaults(defineProps<UploadDraggerProps>(), {
  uid: '',
  maxFileSize: -1,
  listMaxNum: -1,
  onceSelectMaxNum: -1,
  accept: undefined,
  disabled: false,
  GUploadFile: [],
  dpi: undefined,
  type: true,
  uploadText: '添加数据（支持批量选择添加）',
})

const emits = defineEmits<{
  (e: 'update:value', value: GUploadFile[]): void
  (e: 'onUploadStatus', value: UploadStatus): void
}>()

const formItemContext = Form.useInjectFormItemContext()

const tabs = ['全部', '上传失败']
const activeIndex = ref(0)
const onChangeTab = (index: number) => {
  activeIndex.value = index
}

// 控制并发
class ConcurrencyRequest {
  taskList: GUploadFile[] = []
  maxNum: number
  nextIndex: number = 0
  stop: boolean = false
  uploadingNum: number = 0

  constructor(maxNum: number) {
    this.maxNum = maxNum
  }

  // 并发请求
  async request() {
    if (this.nextIndex >= this.taskList.length) return
    const fileInfo = this.taskList[this.nextIndex]
    this.nextIndex++
    if (fileInfo.status === 'uploading' && this.getAvailableTasksNum() <= 0) return
    try {
      if (fileInfo.status !== 'await') return
      fileInfo.status = 'uploading'
      const source = axios.CancelToken.source()
      const formData = new FormData()
      formData.append('file', fileInfo.file!)
      fileInfo.cancelRequest = source.cancel
      props.type
        ? await localDetectionApi.uploadFile(props.uid, formData, {
            cancelToken: source.token,
            onUploadProgress(progressEvent) {
              fileInfo.percent = (progressEvent.progress || 0) * 100
            },
          })
        : await localConversionApi.uploadFile(props.uid, formData, {
            cancelToken: source.token,
            onUploadProgress(progressEvent) {
              fileInfo.percent = (progressEvent.progress || 0) * 100
            },
          })

      fileInfo.status = 'success'
    } catch (err: any) {
      fileInfo.status = 'cancel'
      fileInfo.message = '上传失败'
    } finally {
      emits('update:value', successFileList.value)
      formItemContext.onFieldChange()
      if (!this.stop) {
        this.request()
      }
    }
  }

  // 更新数据
  updateData(list: GUploadFile[]) {
    this.taskList = list.filter((item) => item.status === 'await' || item.status === 'uploading')
  }

  // 更新下一个索引
  updateNextIndex(index = 0) {
    this.nextIndex = index
  }

  // 获取可用任务数量
  getAvailableTasksNum() {
    const uploadingNum = this.taskList.filter((item) => item.status === 'uploading').length
    const num = Math.min(this.maxNum, this.taskList.length)

    return num - uploadingNum
  }

  // 启动任务
  async startTask() {
    if (this.taskList.length === 0) {
      return
    }
    this.stop = false
    this.nextIndex = 0
    const limit = this.getAvailableTasksNum()
    for (let index = 0; index < limit; index++) {
      this.request()
    }
  }

  // 停止任务
  stopTask() {
    this.stop = true
    this.taskList.forEach((item) => {
      item.status === 'uploading' && item.cancelRequest && item.cancelRequest()
      item.status === 'await' && (item.status = 'error')
    })
  }
}

const scrollerRef = ref()
const fileList = ref<GUploadFile[]>([])
const concurrencyRequest = new ConcurrencyRequest(5)

// 选择文件
const onFileChange = async (e: Event) => {
  const files = (e.target as any).files as File[]
  await uploadFiles(files)
  ;(e.target as any).value = ''
}

// 上传之前
const beforeUpload = async (file: File) => {
  // 验证文件类型
  const postfix: string = file?.name?.split('.')?.slice(-1)[0]
  if (props?.accept && !props?.accept?.split(',')?.includes(postfix.toLocaleLowerCase())) {
    return Promise.reject({
      type: 'verify',
      message: '文件类型错误',
      name: file.name,
    })
  }

  // 验证文件大小
  if (props.maxFileSize > 0) {
    const maxSize = props.maxFileSize * 1024 * 1024
    if (file.size! > maxSize) {
      return Promise.reject({
        type: 'verify',
        message: '超出文件大小',
        name: file.name,
      })
    }
  }

  // 验证分辨率
  if (props?.dpi) {
    try {
      await isDpi(file, props?.dpi)
    } catch (error) {
      return Promise.reject({
        type: 'verify',
        message: '分辨率错误',
        name: file.name,
      })
    }
  }

  return Promise.resolve()
}

// 上传
let newFileNum = 0
let isCancel = false
const uploadFiles = async (files: File[]) => {
  isCancel = false
  newFileNum = 0
  const maxLength = props.onceSelectMaxNum > 0 ? Math.min(files.length, props.onceSelectMaxNum) : files.length
  for (let index = 0; index < maxLength; index++) {
    if (isCancel) return
    const file = files[index]
    if (props.listMaxNum > 0 && fileList.value.length >= props.listMaxNum) {
      message.success(`成功将${newFileNum}个文件添加到任务列表`)
      message.warning(`最多上传${props.listMaxNum}个文件`)
      break
    }
    try {
      await beforeUpload(file)
      props.beforeUpload && (await props.beforeUpload(file))
      if (isCancel) return
      fileList.value.push({
        file: file,
        uid: uuid(),
        name: file.name,
        size: file.size,
        status: 'await',
        percent: 0,
        url: '',
      })
      newFileNum++
      if (newFileNum === maxLength) {
        message.success(`成功将${newFileNum}个文件添加到任务列表`)
      }
    } catch (error: any) {
      if (isCancel) return
      fileList.value.push({
        file: file,
        uid: uuid(),
        name: file.name,
        size: file.size,
        status: 'error',
        percent: 0,
        url: '',
        message: error?.message || '文件错误',
      })
      newFileNum++
      if (newFileNum === maxLength) {
        message.success(`成功将${newFileNum}个文件添加到任务列表`)
      }
    }
  }

  concurrencyRequest.updateData(fileList.value)
  concurrencyRequest.startTask()
  formItemContext.onFieldChange()

  nextTick(() => {
    scrollerRef.value?.handleResize()
    scrollerRef.value.scrollToItem(fileList.value.length)
  })
}

// 拖拽上传
let dropFileList: any[] = []
const onDrop = async (e: any) => {
  e.preventDefault()
  if (props.disabled) return
  dropFileList = []
  const entryToFile = (entry: any) => {
    return new Promise((resolve, reject) => {
      try {
        if (entry.isDirectory) {
          const reader = entry.createReader()
          reader.readEntries(async (entries: any[]) => {
            let fileList: File[] = []
            for (const entry of entries) {
              const file = (await entryToFile(entry)) as File
              fileList.push(file)
            }
            resolve(fileList)
          })
        } else {
          entry.file((file: File) => {
            resolve(file)
          })
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  let entryList: any[] = []
  for (const item of e.dataTransfer.items) {
    const entry = item.webkitGetAsEntry()
    entryList.push(entry)
  }
  for (const item of entryList) {
    const res = await entryToFile(item)
    dropFileList.push(res)
  }
  // 扁平化数组
  dropFileList = dropFileList.flat(Infinity)
  uploadFiles(dropFileList)
}

// 过滤数据
const filterFileList = computed(() => {
  if (activeIndex.value === 1) {
    return fileList.value.filter((item) => item.status === 'error' || item.status === 'cancel')
  }
  return fileList.value
})

// 过滤成功数据
const successFileList = computed(() => {
  const list = fileList.value.filter((item) => item.status === 'success')
  return list.map((item) => {
    return {
      uid: item.uid,
      name: item.name,
      url: item.url,
    }
  })
})

// 任务完成数量
const getFileListDoneLength = computed(() => {
  const doneNum = fileList.value.filter((item) => item.status !== 'uploading' && item.status !== 'await').length
  const status = doneNum === fileList.value.length ? 'done' : 'uploading'
  emits('onUploadStatus', status)
  return doneNum
})

// 取消
const handleCancelRequest = (item: GUploadFile) => {
  item.percent = 0
  if (item.status === 'uploading') {
    item.cancelRequest?.()
  } else {
    item.status = 'cancel'
  }
  concurrencyRequest.updateNextIndex(0)
  emits('update:value', successFileList.value)
  formItemContext.onFieldChange()
}

// 重试
const handleRetryRequest = (item: GUploadFile) => {
  item.status = 'await'
  item.percent = 0
  concurrencyRequest.updateData(fileList.value)
  concurrencyRequest.startTask()
}

// 删除
const handleRemove = async (item: GUploadFile) => {
  if (item.status === 'uploading') {
    item.cancelRequest?.()
  }
  if (item.status === 'await') {
    item.status = 'error'
  }
  if (item.status === 'success') {
    await localDetectionApi.deleteFile(props.uid, item.name)
  }
  item.file = undefined
  fileList.value = fileList.value.filter((i) => i.uid !== item.uid)
  emits('update:value', successFileList.value)
  formItemContext.onFieldChange()
}

// 清空上传列表
const clearFileList = async (isDeleteRemote: boolean = true) => {
  isCancel = true
  fileList.value.forEach((item) => {
    item.percent = 0
    item.cancelRequest && item.cancelRequest()
  })
  concurrencyRequest.stopTask()
  successFileList.value.length && isDeleteRemote && (await localDetectionApi.deleteFile(props.uid))
  fileList.value = []
  emits('update:value', successFileList.value)
  formItemContext.onFieldChange()
}

defineExpose({
  clearFileList,
})
</script>

<style lang="less" scoped>
.upload-dragger-wrap {
  cursor: pointer;

  &[disabled='true'] {
    cursor: not-allowed;
  }
}
.upload-dragger {
  width: 100%;
  border-radius: 6px;
  border: none;
  background: rgba(225, 237, 255, 0.05);
  padding: 16px 6px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;

  p.upload-drag-icon {
    margin-bottom: 8px;
  }
  p.upload-text {
    color: #8b949e;
    text-align: center;
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
  }
}
.upload-list-wrap {
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.2);
  padding: 12px 8px;
  margin-top: 8px;

  > header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: @text3;
    font-size: 14px;
    font-weight: 700;
    line-height: 22px;
    padding: 0 8px;

    .tab-list {
      display: flex;
      gap: 0 4px;

      .tab-list-item {
        height: 24px;
        padding: 0 8px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 400;
        &.active {
          color: @text2;
          background: rgba(255, 255, 255, 0.15);
        }
      }
    }
  }
  .upload-list {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px 0;

    .upload-list-item-wrap {
      &.fixed-height {
        height: 400px;
        overflow: auto;
      }

      .upload-list-item {
        height: 30px;
        display: flex;
        align-items: center;
        padding: 0 8px;
        color: @primary2;
        border-radius: 4px;
        cursor: pointer;

        .upload-list-item-name {
          width: 204px;
          font-size: 14px;
          font-weight: 400;
          line-height: 22px;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-right: 8px;
          > p {
            .ellipsis();
          }
        }

        .progress-wrap {
          width: 256px;
          height: 100%;
          :deep(.ant-progress) {
            transform: translateY(2px);
            .ant-progress-inner {
              background-color: @text4;
            }

            .ant-progress-bg {
              height: 4px !important;
              background-color: @primary1;
            }
          }
        }

        .upload-list-item-info {
          display: flex;

          div {
            &:first-child {
              width: 80px;
              .ellipsis();
            }
            &:last-child {
              width: 180px;
              .ellipsis();
            }
          }
        }

        .upload-list-item-status {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 0 10px;

          .delete-icon-wrap {
            width: 22px;
            > i {
              display: none;
            }
          }
        }

        &:hover {
          background: rgba(255, 255, 255, 0.05);
          .upload-list-item-status i {
            display: block;
          }
        }

        &.uploading,
        &.await {
          .upload-list-item-name {
            > i {
              color: @primary1;
            }
            > p {
              color: @text2;
            }
          }
          &:hover {
            .upload-list-item-status i {
              display: block;
            }
          }
        }

        &.done,
        &.success {
          color: @primary2;
        }
        &.error,
        &.cancel {
          color: @danger;
        }
      }
    }
  }
}
</style>
